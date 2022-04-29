import React, { useRef, useState } from "react";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import BaseInput from "@dvargas92495/app/components/BaseInput";
import Button from "@dvargas92495/app/components/Button";
import axios from "axios";
import getGames from "../data/getGames.server";
import joinGame from "../data/joinGame.server";

type GameViews = Awaited<ReturnType<typeof getGames>>["gameViews"];
type JoinInfo = Awaited<ReturnType<typeof joinGame>>;

const GameSession = (
  g: GameViews[number] & { onJoin: (p: JoinInfo) => void }
) => {
  const [password, setPassword] = useState("");
  return (
    <Form method="post" className="flex justify-between p-4">
      <input
        disabled
        className="w-52"
        name={"gameSessionId"}
        defaultValue={g.gameSessionId}
      />
      <input
        name={"___gameSessionId"}
        defaultValue={g.gameSessionId}
        type={'hidden'}
      />
      <span>{g.creatorId}</span>
      {g.isPrivate && (
        <BaseInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          type={"password"}
        />
      )}
      <Button>
        Join
      </Button>
    </Form>
  );
};

const PlayerPage = (): React.ReactElement => {
  const { gameViews } = useLoaderData<Awaited<ReturnType<typeof getGames>>>();
  const websocketRef = useRef<WebSocket>();
  const navigate = useNavigate();
  return (
    <>
      <div style={{ margin: 64 }} className={"m-16"}>
        <div className="flex justify-between p-4">
          <span>New Game</span>
          <span>{"web"}</span>
          <input />
          <Button
            onClick={() =>
              axios.post(`${process.env.API_URL}/game`, { playerId: "Web" })
            }
          >
            Create
          </Button>
        </div>
        {gameViews.map((g) => (
          <GameSession
            {...g}
            onJoin={({ ipAddress, playerSessionId = "", port }) => {
              const ws = (websocketRef.current = new WebSocket(
                `ws://${ipAddress}:${port}`
              ));
              ws.onmessage = ({ data }) => {
                const {
                  name,
                  //...props
                } = JSON.parse(data);
                if (name === "LOAD_SETUP") {
                  navigate(`/player/${name}/setup`);
                  // setSetupProps(props);
                } else if (name === "GAME_READY") {
                  navigate(`/player/${name}/match`);
                  // setMatchProps(props);
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
        ))}
      </div>
    </>
  );
};

export const loader: LoaderFunction = () => {
  return getGames();
};

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();
  console.log(data);
  return joinGame({
    playerId: "web",
    gameSessionId: data.get("gameSessionId") as string,
    password: data.get("password") as string,
  });
};

export default PlayerPage;
