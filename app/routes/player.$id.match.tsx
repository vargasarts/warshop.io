import { useRef, useEffect, useState } from "react";
import type { Command, Robot } from "../../server/game";
import type { Map } from "../../server/map";

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
}): React.ReactElement => {
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

export default MatchScene;
