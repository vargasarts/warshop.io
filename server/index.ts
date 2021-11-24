import WebSocket, { WebSocketServer } from "ws";
import GameLiftServerAPI, {
  LogParameters,
  ProcessParameters,
} from "@dplusic/gamelift-nodejs-serversdk";
import { OnStartGameSessionDelegate } from "@dplusic/gamelift-nodejs-serversdk/dist/types/Server/ProcessParameters";
import { createMap, NULL_VEC } from "./map";
import { commandsToEvents, flip, Game, storeCommands } from "./game";

const port = Number(process.argv[2]) || 12345;
const boardFile =
  "8 5\nA W W W W W W a\nB W W W W W W b\nW P W W W W p W\nC W W W W W W c\nD W W W W W W d";
const game: Game = {
  healthChecks: 0,
  board: createMap(boardFile),
  gameSessionId: "",
  nextRobotId: 0,
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

const onAcceptPlayerSession = ({
  playerSessionId,
}: {
  playerSessionId: string;
}) => {
  return GameLiftServerAPI.AcceptPlayerSession(playerSessionId).then(
    (outcome) => {
      if (!outcome.Success) {
        console.error(outcome);
        return;
      }
    }
  );
};

const onStartGame = (
  {
    myRobots,
    myName,
  }: {
    myRobots: unknown[];
    myName: string;
  },
  ws: WebSocket,
  game: Game
) => {
  console.log("Client Starting Game");

  const isPrimary = !game.primary?.joined;
  const robots = myRobots.map(() => {
    const robot = {
      // ...createRobot(r),
      id: game.nextRobotId++,
      position: NULL_VEC,
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
  };
  if (isPrimary) {
    game.primary = player;
  } else {
    game.secondary = player;
  }
  if (game.primary?.joined && game.secondary?.joined) {
    game.primary.ws.send(
      JSON.stringify({
        name: "GAME_READY",
        props: { isPrimary: true },
      })
    );
    game.secondary.ws.send(
      JSON.stringify({
        name: "GAME_READY",
        props: { isPrimary: false },
      })
    );
  }
};

const onSubmitCommands = (
  { owner, commands }: { owner: string; commands: unknown[] },
  ws: WebSocket,
  game: Game
) => {
  console.log("Client Submitting Commands");
  try {
    const p =
      game.primary?.name === owner
        ? game.primary
        : game.secondary?.name === owner
        ? game.secondary
        : null;
    if (p) storeCommands(p, commands);
    if (game.primary?.ready && game.secondary?.ready) {
      const events = commandsToEvents(game);
      const props = { events, turn: game.turn };
      game.primary.ws.send(
        JSON.stringify({
          name: "TURN_EVENTS",
          props,
        })
      );
      game.secondary.ws.send(
        JSON.stringify({
          name: "TURN_EVENTS",
          props: flip(props),
        })
      );
    } else {
      ws.send(JSON.stringify({ name: "WAITING_COMMANDS", props: {} }));
    }
  } catch (e) {
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
        console.log("data received \n %o", data);
        const { name, props } = JSON.parse(data.toString());
        MESSAGE_HANDLERS[name as keyof typeof MESSAGE_HANDLERS](
          props,
          ws,
          game
        );
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
