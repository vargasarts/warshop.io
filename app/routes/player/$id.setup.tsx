import Button from "@dvargas92495/app/components/Button";
import React, { useContext, useEffect, useState } from "react";
import WsContext from "~/contexts/WsContext";
import { useLoaderData, useNavigate } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import getPlayer from "~/data/getPlayer.server";
import remixAppLoader from "@dvargas92495/app/backend/remixAppLoader.server";

const PLAYER_ID = "Web";

const SetupScene = (): React.ReactElement => {
  const { ipAddress, port, playerSessionId, myRoster } =
    useLoaderData<Awaited<ReturnType<typeof getPlayer>>>();
  const { ws, setWs } = useContext(WsContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const ws = new WebSocket(`ws://${ipAddress}:${port}`);
    ws.onmessage = ({ data }) => {
      const {
        name,
        //...props
      } = JSON.parse(data);
      if (name === "LOAD_SETUP") {
        setLoading(false);
      } else if (name === "GAME_READY") {
        navigate(`/player/${name}/match`);
      }
    };
    ws.onopen = () =>
      ws.send(
        JSON.stringify({
          name: "ACCEPT_PLAYER_SESSION",
          playerSessionId,
        })
      );
    setWs(ws);
  }, [ipAddress, port, playerSessionId]);
  return loading ? (
    <div>Loading...</div>
  ) : !ws ? (
    <div>Failed to connect web socket</div>
  ) : (
    <div>
      <Button
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
      </Button>
      <ul>
        {myRoster.map((r) => (
          <li key={r.uuid}>{r.name}</li>
        ))}
      </ul>
    </div>
  );
};

export const loader: LoaderFunction = (args) => {
  return remixAppLoader(args, getPlayer);
};

export default SetupScene;
