import WebSocket from "ws";
import GameLiftServerAPI, {
  LogParameters,
  ProcessParameters,
} from "@dplusic/gamelift-nodejs-serversdk";
import { OnStartGameSessionDelegate } from "@dplusic/gamelift-nodejs-serversdk/dist/types/Server/ProcessParameters";
import { PlayerSessionStatus } from "@dplusic/gamelift-nodejs-serversdk/dist/types/Server/Model/PlayerSessionStatus";
import { createMap } from "./map";
import { commandsToEvents, flip, Game, joinGame, storeCommands } from "./game";

const PORT = 12345;
const appgame: { current: Game } = {
  current: {},
};
let healthChecks = 0;

const onGameSession: OnStartGameSessionDelegate = (gameSession) => {
  // log.ConfigureNewGame(gameSession.GameSessionId);
  const boardFile =
    "8 5\nA W W W W W W a\nB W W W W W W b\nW P W W W W p W\nC W W W W W W c\nD W W W W W W d";
  appgame.current = {
    board: createMap(boardFile),
    gameSessionId: gameSession.GameSessionId,
  };
  GameLiftServerAPI.ActivateGameSession();
};

const onUpdateGameSession = () => {
  console.log("Updating");
};

const EndGame = () => {
  GameLiftServerAPI.TerminateGameSession();
};

const onHealthCheck = (): boolean => {
  healthChecks++;
  console.log("Heartbeat - " + healthChecks);
  GameLiftServerAPI.DescribePlayerSessions({
    GameSessionId: appgame.current.gameSessionId,
    Limit: 5,
  }).then((result) => {
    let timedOut = result.Result.PlayerSessions.length > 0;
    result.Result.PlayerSessions.forEach((ps) => {
      timedOut = timedOut && ps.Status == PlayerSessionStatus.TIMEDOUT;
    });
    if (timedOut) EndGame();
    if (healthChecks == 10 && result.Result.PlayerSessions.length == 0)
      EndGame();
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
  ws: WebSocket
) => {
  console.log("Client Starting Game");

  appgame.current = joinGame({
    game: appgame.current,
    robots: myRobots,
    name: myName,
    ws,
  });
  if (appgame.current.primary.joined && appgame.current.secondary.joined) {
    appgame.current.primary.ws.send(
      JSON.stringify({
        name: "GAME_READY",
        props: { isPrimary: true },
      })
    );
    appgame.current.secondary.ws.send(
      JSON.stringify({
        name: "GAME_READY",
        props: { isPrimary: false },
      })
    );
  }
};

const onSubmitCommands = (
  { owner, commands }: { owner: string; commands: unknown[] },
  ws
) => {
  console.log("Client Submitting Commands");
  try {
    const p =
      appgame.current.primary.name === owner
        ? appgame.current.primary
        : appgame.current.secondary;
    storeCommands(p, commands);
    if (appgame.current.primary.ready && appgame.current.secondary.ready) {
      const events = commandsToEvents(appgame.current);
      const props = { events, turn: appgame.current.turn };
      appgame.current.primary.ws.send(
        JSON.stringify({
          name: "TURN_EVENTS",
          props,
        })
      );
      appgame.current.secondary.ws.send(
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
    appgame.current.primary.ws.send(
      JSON.stringify({
        name: "SERVER_ERROR",
        props,
      })
    );
    appgame.current.secondary.ws.send(
      JSON.stringify({
        name: "SERVER_ERROR",
        props,
      })
    );
    EndGame();
  }
};

console.log(`Starting the server at port: ${PORT}`);
const outcome = GameLiftServerAPI.InitSDK();
const MESSAGE_HANDLERS = {
  ACCEPT_PLAYER_SESSION: onAcceptPlayerSession,
  START_GAME: onStartGame,
  SUBMIT_COMMANDS: onSubmitCommands,
} as const;
type Message<T> = { name: keyof typeof MESSAGE_HANDLERS; props: T };

if (outcome.Success) {
  const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log("server started");
  });
  wss.on("connection", (ws) => {
    ws.on("message", (data) => {
      console.log("data received \n %o", data);
      const { name, props } = JSON.parse(data.toString()) as Message<
        Parameters<typeof onAcceptPlayerSession>[0] &
          Parameters<typeof onStartGame>[0] &
          Parameters<typeof onSubmitCommands>[0]
      >;
      MESSAGE_HANDLERS[name](props, ws);
    });
  });
  wss.on("listening", () => {
    console.log(`listening on ${PORT}`);
  });
  const paths = new LogParameters(["./logs"]);
  GameLiftServerAPI.ProcessReady(
    new ProcessParameters(
      onGameSession,
      onUpdateGameSession,
      onProcessTerminate,
      onHealthCheck,
      PORT,
      paths
    )
  );
} else {
  console.log(outcome);
}
