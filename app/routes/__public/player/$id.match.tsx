import React, { useRef, useEffect, useState } from "react";
import type { Command, Robot } from "../../../../server/game";
import loadMatch from "~/data/loadMatch.server";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import Button from "@dvargas92495/app/components/Button";

/*
  useEffect(() => {
    
  }, [ipAddress, port, playerSessionId]);

   ws.send(
            JSON.stringify({
              name: "START_GAME",
              myRobots: myRoster.slice(0, 4).map((r) => r.uuid),
              myName: PLAYER_ID,
            })
          )
*/

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

const MatchScene = (): React.ReactElement => {
  const commands = useRef<Command[]>([]);
  const {
    myTeam = [],
    opponentTeam = [],
    isPrimary,
    board,
    opponentName,
    ipAddress,
    port,
    playerSessionId,
  } = useLoaderData<Awaited<ReturnType<typeof loadMatch>>>();
  const ws = useRef<WebSocket>();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const instance = new WebSocket(`ws://${ipAddress}:${port}`);
    instance.onmessage = ({ data }) => {
      const {
        name,
        //...props
      } = JSON.parse(data);
      if (name === "GAME_READY") {
        setLoading(true);
      }
    };
    instance.onopen = () =>
      instance.send(
        JSON.stringify({
          name: "ACCEPT_PLAYER_SESSION",
          playerSessionId,
        })
      );
    instance.onmessage = ({ data }) => {
      const { name, props } = JSON.parse(data);
      console.log(name, props);
    };
    ws.current = instance;
  }, [ws]);
  const [command, setCommand] = useState<Record<string, string>>({});
  return loading ? (
    <div>Loading...</div>
  ) : (
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
          <Button
            disabled={!ws.current}
            onClick={() => {
              ws.current?.send(
                JSON.stringify({
                  name: "SUBMIT_COMMANDS",
                  commands: commands.current,
                })
              );
            }}
          >
            Submit
          </Button>
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

export const loader: LoaderFunction = ({ params }) => {
  return loadMatch(params["id"] || "");
};

export default MatchScene;
