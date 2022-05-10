import React, { useState } from "react";
import { Form, useLoaderData } from "@remix-run/react";
import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import BaseInput from "@dvargas92495/app/components/BaseInput";
import Button from "@dvargas92495/app/components/Button";
import axios from "axios";
import getGames from "../../data/getGames.server";
import joinGame from "../../data/joinGame.server";

type GameViews = Awaited<ReturnType<typeof getGames>>["gameViews"];

const GameSession = (g: GameViews[number]) => {
  const [password, setPassword] = useState("");
  return (
    <Form method="post" className="flex justify-between p-4 items-center">
      <span />
      <input
        name={"gameSessionId"}
        defaultValue={g.gameSessionId}
        type={"hidden"}
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
      <Button>Join</Button>
    </Form>
  );
};

const PlayerPage = (): React.ReactElement => {
  const { gameViews } = useLoaderData<Awaited<ReturnType<typeof getGames>>>();
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
          <GameSession key={g.gameSessionId} {...g} />
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
  return joinGame({
    playerId: "web",
    gameSessionId: data.get("gameSessionId") as string,
    password: data.get("password") as string,
  }).then((res) => redirect(`/player/${res.playerSessionId}/setup`));
};

export default PlayerPage;
