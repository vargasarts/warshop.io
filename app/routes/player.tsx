import React, {useEffect,useRef,useState } from "react";
import type {Handler as GetGames } from "../../functions/games/get";
import type {Handler as JoinGame } from "../../functions/join/post";
import type {
 Robot,
 RobotStats,
 Command,
} from "../../server/game";
import type {Map } from "../../server/map";
import axios from "axios";

type GameViews = Awaited<ReturnType<GetGames>>["gameViews"];
type JoinInfo = Awaited<ReturnType<JoinGame>>;
const PLAYER_ID = "Web";

const GameSession = (
  g: GameViews[number] & { onJoin: (p: JoinInfo) => void }
) => {
  const [password, setPassword] = useState("");
  // const joinGame = useHandler<JoinGame>({
  //   path: "join",
  //   method: "POST",
  // });
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: 16,
      }}
    >
      <span style={{ maxWidth: 200 }}>{g.gameSessionId}</span>
      <span>{g.creatorId}</span>
      {g.isPrivate && (
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          type={"password"}
        />
      )}
      <button
        onClick={() =>
          axios
            .post(`${process.env.API_URL}/join`, {
              playerId: PLAYER_ID,
              gameSessionId: g.gameSessionId || "",
              password,
            })
            .then((r) => g.onJoin(r.data))
        }
      >
        Join
      </button>
    </div>
  );
};

const LobbyScene = ({
  onJoin,
}: {
  onJoin: (p: JoinInfo) => void;
}): React.ReactElement => {
  const [games, setGames] = useState<GameViews>([]);
  useEffect(() => {
    axios
      .get(`${process.env.API_URL}/games`)
      .then((r) => setGames(r.data.gameViews));
  }, [setGames]);
  return (
    <div style={{ margin: 64 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: 16,
        }}
      >
        <span>New Game</span>
        <span>{PLAYER_ID}</span>
        <input />
        <button
          onClick={() =>
            axios.post(`${process.env.API_URL}/game`, { playerId: "Web" })
          }
        >
          Create
        </button>
      </div>
      {games.map((g) => (
        <GameSession {...g} onJoin={onJoin} />
      ))}
    </div>
  );
};

const SetupScene = ({
  ws,
  myRoster,
}: {
  ws: WebSocket;
  myRoster: RobotStats[];
}) => {
  return (
    <div>
      <button
        onClick={() =>
          ws.send(
            JSON.stringify({
              name: "START_GAME",
              myRobots: myRoster.slice(0, 4).map((r) => r.uuid),
              myName: PLAYER_ID,
            })
          )
        }
      >
        Ready!
      </button>
      <ul>
        {myRoster.map((r) => (
          <li key={r.uuid}>{r.name}</li>
        ))}
      </ul>
    </div>
  );
};

const RobotComponent = (r: Robot) => {
  return (
    <div>
      <hr />
      <h4>{r.name}</h4>
      <p>
        <b>Attack:</b> {r.attack}
      </p>
      <p>
        <b>Health:</b> {r.health}
      </p>
      <p>
        <b>Priority:</b> {r.priority}
      </p>
    </div>
  );
};

const MatchScene = ({
  myTeam = [],
  opponentTeam = [],
  isPrimary,
  board,
  opponentName,
  ws,
}: {
  myTeam: Robot[];
  opponentTeam: Robot[];
  opponentName: string;
  isPrimary: boolean;
  board: Map;
  ws: WebSocket;
}) => {
  const commands = useRef<Command[]>([]);
  useEffect(() => {
    ws.onmessage = ({ data }) => {
      const { name, props } = JSON.parse(data);
      console.log(name, props);
    };
  }, []);
  const [command, setCommand] = useState<Record<string, string>>({});
  return (
    <div>
      <h1>
        Playing against {opponentName} as {`${isPrimary}`}
      </h1>
      <div style={{ display: "flex" }}>
        <div style={{ width: "50%" }}>
          <h2>Me</h2>
          {myTeam.map((r) => (
            <>
              <RobotComponent {...r} key={r.uuid} />
              <div style={{ height: 24 }}>
                <input
                  value={command[r.id] || ""}
                  onChange={(e) =>
                    setCommand({ ...command, [r.id]: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      commands.current.push({
                        robotId: r.id,
                        commandId: Number(command[r.id][0]),
                        direction: Number(command[r.id][1]),
                      });
                      setCommand({ ...command, [r.id]: "" });
                    }
                  }}
                />
              </div>
            </>
          ))}
          <button
            onClick={() => {
              ws.send(
                JSON.stringify({
                  name: "SUBMIT_COMMANDS",
                  commands: commands.current,
                })
              );
            }}
          >
            Submit
          </button>
        </div>
        <div style={{ width: "50%" }}>
          <h2>Opponent</h2>
          {opponentTeam.map((r) => (
            <>
              <RobotComponent {...r} key={r.uuid} />
              <div style={{ height: 24 }} />
            </>
          ))}
        </div>
      </div>
      <h2>Board:</h2>
      <div>{JSON.stringify(board)}</div>
    </div>
  );
};

type SetupProps = Omit<Parameters<typeof SetupScene>[0], "ws">;
type MatchProps = Omit<Parameters<typeof MatchScene>[0], "ws">;

const PlayerPage = (): React.ReactElement => {
  const [scene, setScene] = useState("lobby");
  const [setupProps, setSetupProps] = useState<SetupProps>();
  const [matchProps, setMatchProps] = useState<MatchProps>();
  const websocketRef = useRef<WebSocket>();
  return (
    <>
      <style>{`body {\n  font-family: sans-serif;\n}`}</style>
      {scene === "lobby" ? (
        <LobbyScene
          onJoin={({ ipAddress, playerSessionId = "", port }) => {
            const ws = (websocketRef.current = new WebSocket(
              `ws://${ipAddress}:${port}`
            ));
            ws.onmessage = ({ data }) => {
              const { name, ...props } = JSON.parse(data);
              if (name === "LOAD_SETUP") {
                setSetupProps(props);
                setScene("setup");
              } else if (name === "GAME_READY") {
                setMatchProps(props);
                setScene("match");
              }
            };
            ws.onopen = () =>
              ws.send(
                JSON.stringify({
                  name: "ACCEPT_PLAYER_SESSION",
                  playerSessionId,
                })
              );
          }}
        />
      ) : scene === "setup" ? (
        <SetupScene
          {...(setupProps as Required<SetupProps>)}
          ws={websocketRef.current || new WebSocket("")}
        />
      ) : scene === "match" ? (
        <MatchScene
          {...(matchProps as Required<MatchProps>)}
          ws={websocketRef.current || new WebSocket("")}
        />
      ) : (
        <div>Invalid Scene: {scene}</div>
      )}
    </>
  );
};

export default PlayerPage;
