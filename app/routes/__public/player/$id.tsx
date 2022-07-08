import React, { useRef, useEffect, useState } from "react";
import type { Command, Robot } from "../../../../server/game";
import loadMatch from "~/data/loadMatch.server";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import Button from "@dvargas92495/app/components/Button";
import Loading from "@dvargas92495/app/components/Loading";
import Select from "@dvargas92495/app/components/Select";
import { BATTERY_SPACE_ID, QUEUE_SPACE_ID } from "~/enums/spaces";

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

const RobotPanel = (r: Robot & { commands: Command[] }) => {
  return (
    <div key={r.uuid} className={"flex flex-col flex-1"}>
      <h4 className="py-4 px-2 border border-opacity-50">{r.name}</h4>
      {r.commands.map((c) => (
        <div>
          <p>
            <b>Command:</b>
            {c.commandId}
          </p>
          <p>
            <b>Direction:</b>
            {c.direction}
          </p>
        </div>
      ))}
    </div>
  );
};

const MatchScene = (): React.ReactElement => {
  const [commands, setCommands] = useState<Command[]>([]);
  const {
    myTeam = [],
    board,
    ipAddress,
    port,
    playerSessionId,
  } = useLoaderData<Awaited<ReturnType<typeof loadMatch>>>();
  const [opponentName, setOpponentName] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [opponentTeam, setOpponentTeam] = useState<Robot[]>([]);
  const ws = useRef<WebSocket>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const instance = new WebSocket(`ws://${ipAddress}:${port}`);
    instance.onmessage = ({ data }) => {
      const { name, ...props } = JSON.parse(data);
      if (name === "GAME_READY") {
        setOpponentTeam(props.opponentTeam);
        setLoading(false);
      } else if (name === "ERROR") {
        setError(props.message);
      }
    };
    instance.onopen = () =>
      instance.send(
        JSON.stringify({
          name: "ACCEPT_PLAYER_SESSION",
          playerSessionId,
        })
      );
    ws.current = instance;
  }, [
    ws,
    setLoading,
    setError,
    setOpponentTeam,
    setOpponentName,
    setIsPrimary,
  ]);
  const [robotId, setRobotId] = useState(0);
  const [commandId, setCommandId] = useState(0);
  const [direction, setDirection] = useState(0);
  return loading ? (
    <div>
      <Loading />
    </div>
  ) : error ? (
    <div className="text-red-700 font-bold">{error}</div>
  ) : (
    <div>
      <h1>
        Playing against {opponentName} as{" "}
        {`${isPrimary ? "Primary" : "Secondary"}`}
      </h1>
      <div className="flex">
        <div className="w-1/4 flex-shrink-0">
          <h2>Me</h2>
          {myTeam.map((r) => (
            <RobotPanel
              {...r}
              key={r.uuid}
              commands={commands.filter((c) => c.robotId === r.id)}
            />
          ))}
        </div>
        <div className={"max-w-1/2 flex flex-col h-full"}>
          <table className="flex-grow">
            <tbody>
              {Array(board.height)
                .fill(null)
                .map((_, y) => (
                  <tr key={y}>
                    {Array(board.width)
                      .fill(null)
                      .map((_, x) => {
                        const space = board.spaces[x + y * board.width];
                        return (
                          <td key={x}>
                            <pre className={"text-xs"}>
                              <span
                                className={
                                  "inline-block justify-center items-center"
                                }
                              >
                                {space.type === QUEUE_SPACE_ID && space.index}
                                {space.type === BATTERY_SPACE_ID && "B"}
                              </span>
                            </pre>
                          </td>
                        );
                      })}
                  </tr>
                ))}
            </tbody>
          </table>
          <div className="h-24">
            <Select
              options={myTeam.map((m) => ({ id: m.id, label: m.name }))}
              onChange={(e) => setRobotId(e as number)}
            />
            <Select
              options={[
                { id: 0, label: "Spawn" },
                { id: 1, label: "Move" },
                { id: 2, label: "Attack" },
                { id: 3, label: "Special" },
              ]}
              onChange={(e) => setCommandId(e as number)}
            />
            <Select
              options={[
                { id: 0, label: "Up" },
                { id: 1, label: "Left" },
                { id: 2, label: "Down" },
                { id: 3, label: "Right" },
              ]}
              onChange={(e) => setDirection(e as number)}
            />
            <Button
              disabled={!ws.current}
              onClick={() => {
                setCommands([...commands, { robotId, commandId, direction }]);
              }}
            >
              Add
            </Button>
            <Button
              disabled={!ws.current}
              onClick={() => {
                ws.current?.send(
                  JSON.stringify({
                    name: "SUBMIT_COMMANDS",
                    commands,
                  })
                );
              }}
            >
              Submit
            </Button>
          </div>
        </div>
        <div className="w-1/4 flex-shrink-0">
          <h2>Opponent</h2>
          <div className="flex">
            {opponentTeam.map((r) => (
              <RobotPanel
                {...r}
                key={r.uuid}
                commands={commands.filter((c) => c.robotId === r.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const loader: LoaderFunction = ({ params }) => {
  return loadMatch(params["id"] || "");
};

export const handle = {
  mainClassName: "max--w-5xl",
};

export default MatchScene;
