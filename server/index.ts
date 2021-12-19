import WebSocket, { WebSocketServer } from "ws";
import GameLiftServerAPI, {
  LogParameters,
  ProcessParameters,
} from "@dplusic/gamelift-nodejs-serversdk";
import { OnStartGameSessionDelegate } from "@dplusic/gamelift-nodejs-serversdk/dist/types/Server/ProcessParameters";
import { createMap, NULL_VEC } from "./map";
import { commandsToEvents, Command, Game, storeCommands } from "./game";
import { getRobotRosterByPlayerId, getRobotByUuid } from "./db";

const port = Number(process.argv[2]) || 12345;
const MAX_BATTERY = 256;
const boardFile =
  "8 5\nA W W W W W W a\nB W W W W W W b\nW P W W W W p W\nC W W W W W W c\nD W W W W W W d";
const game: Game = {
  healthChecks: 0,
  board: createMap(boardFile),
  gameSessionId: "",
  nextRobotId: 0,
  turn: 0,
  history: {},
};

const onGameSession: OnStartGameSessionDelegate = (gameSession) => {
  game.gameSessionId = gameSession.GameSessionId || "";
  GameLiftServerAPI.ActivateGameSession();
};

const onUpdateGameSession = () => {
  console.log("Updating");
};

const EndGame = () => {
  GameLiftServerAPI.TerminateGameSession();
};

const onHealthCheck = (): boolean => {
  GameLiftServerAPI.DescribePlayerSessions({
    GameSessionId: game.gameSessionId,
    Limit: 2,
  }).then((result) => {
    const sessions = result.Result?.PlayerSessions || [];
    let timedOut = sessions.length > 0;
    sessions.forEach((ps) => {
      timedOut = timedOut && ps.Status === 4; // PlayerSessionStatus.TIMEDOUT;
    });
    if (timedOut) EndGame();
    if (game.healthChecks == 10 && sessions.length == 0) EndGame();
  });
  return true;
};

const onProcessTerminate = () => {
  GameLiftServerAPI.ProcessEnding();
  GameLiftServerAPI.Destroy();
  process.exit(0);
};

const onAcceptPlayerSession = (
  {
    playerSessionId,
  }: {
    playerSessionId: string;
  },
  ws: WebSocket
) => {
  return GameLiftServerAPI.AcceptPlayerSession(playerSessionId).then(
    (outcome) => {
      if (!outcome.Success) {
        console.error(outcome);
        return;
      }
      GameLiftServerAPI.DescribePlayerSessions({
        PlayerSessionId: playerSessionId,
        Limit: 1,
      })
        .then((p) =>
          getRobotRosterByPlayerId(
            p.Result?.PlayerSessions?.[0]?.PlayerId || ""
          )
        )
        .then((myRoster) =>
          ws.send(JSON.stringify({ name: "LOAD_SETUP", myRoster }))
        );
    }
  );
};

const onStartGame = (
  {
    myRobots,
    myName,
  }: {
    myRobots: string[];
    myName: string;
  },
  ws: WebSocket,
  game: Game
) => {
  console.log("Client Starting Game");

  const isPrimary = !game.primary?.joined;
  return Promise.all(myRobots.map(getRobotByUuid)).then((myRobots) => {
    const robots = myRobots.map((r) => {
      const robot = {
        ...r,
        id: game.nextRobotId++,
        position: NULL_VEC,
        startingHealth: r.health,
      };
      // game.board add to dock
      return robot;
    });
    const player = {
      name: myName,
      joined: true,
      ready: false,
      ws,
      team: robots,
      battery: MAX_BATTERY,
    };
    if (isPrimary) {
      game.primary = player;
    } else {
      game.secondary = player;
    }
    if (game.primary?.joined && game.secondary?.joined) {
      const commonProps = {
        name: "GAME_READY",
        board: {
          ...game.board,
          spaces: game.board.spaces.map((s) => JSON.stringify(s)),
        },
      };
      game.primary.ws.send(
        JSON.stringify({
          ...commonProps,
          isPrimary: true,
          opponentName: game.secondary.name,
          myTeam: game.primary.team,
          opponentTeam: game.secondary.team,
        })
      );
      game.secondary.ws.send(
        JSON.stringify({
          ...commonProps,
          isPrimary: false,
          opponentName: game.primary.name,
          myTeam: game.secondary.team,
          opponentTeam: game.primary.team,
        })
      );
    }
  });
};

const onSubmitCommands = (
  { commands }: { commands: Command[] },
  ws: WebSocket,
  game: Game
) => {
  console.log("Client Submitting Commands");
  try {
    const p =
      game.primary?.ws === ws
        ? game.primary
        : game.secondary?.ws === ws
        ? game.secondary
        : null;
    if (!p) {
      console.warn("Received submit commands from unknown player");
      return;
    }
    if (!game.primary || !game.secondary) {
      throw new Error("Lost reference to a player");
    }
    storeCommands(game, p, commands);
    if (game.primary.ready && game.secondary.ready) {
      const events = commandsToEvents(game as Required<Game>);
      game.primary.ws.send(
        JSON.stringify({
          name: "TURN_EVENTS",
          events,
          turn: game.turn,
        })
      );
      game.secondary.ws.send(
        JSON.stringify({
          name: "TURN_EVENTS",
          events,
          turn: game.turn,
        })
      );
      console.log("events sent: ", JSON.stringify(events, null, 4));
    } else {
      const otherWs =
        game.primary.ws === ws ? game.secondary.ws : game.primary.ws;
      otherWs.send(JSON.stringify({ name: "WAITING_COMMANDS" }));
    }
  } catch (err) {
    const e = err as Error;
    console.error(e);
    const props = {
      serverMessage:
        "Game server crashed when processing your submitted commands",
      exceptionType: e.name,
      exceptionMessage: e.message,
    };
    game.primary?.ws?.send?.(
      JSON.stringify({
        name: "SERVER_ERROR",
        props,
      })
    );
    game.secondary?.ws?.send?.(
      JSON.stringify({
        name: "SERVER_ERROR",
        props,
      })
    );
    EndGame();
  }
};

console.log(`Starting the server at port: ${port}`);
const outcome = GameLiftServerAPI.InitSDK();
const MESSAGE_HANDLERS = {
  ACCEPT_PLAYER_SESSION: onAcceptPlayerSession,
  START_GAME: onStartGame,
  SUBMIT_COMMANDS: onSubmitCommands,
} as const;

if (outcome.Success) {
  const paths = new LogParameters(["./logs"]);
  const wss = new WebSocketServer({ port }, () => {
    console.log("server started");
  });
  wss.on("connection", (ws) => {
    ws.on("message", (data) => {
      try {
        const { name, ...props } = JSON.parse(data.toString());
        console.log(name, props);
        MESSAGE_HANDLERS[name as keyof typeof MESSAGE_HANDLERS](
          props,
          ws,
          game
        );
      } catch (e) {
        console.error("Latest message failed:");
        console.error("- data:", data.toString());
        console.error("- error:", e);
      }
    });
  });
  wss.on("listening", () => {
    console.log(`listening on ${port}`);
    GameLiftServerAPI.ProcessReady(
      new ProcessParameters(
        onGameSession,
        onUpdateGameSession,
        onProcessTerminate,
        onHealthCheck,
        port,
        paths
      )
    );
  });
} else {
  console.log(outcome);
}
