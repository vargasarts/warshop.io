import React, { useState } from "react";
import { Form, useLoaderData } from "@remix-run/react";
import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import BaseInput from "@dvargas92495/app/components/BaseInput";
import Button from "@dvargas92495/app/components/Button";
import Checkbox from "@dvargas92495/app/components/Checkbox";
import getGames from "~/data/getGames.server";
import joinGame from "~/data/joinGame.server";
import createGame from "~/data/createGame.server";
import remixAppLoader from "@dvargas92495/app/backend/remixAppLoader.server";
export { default as CatchBoundary } from "@dvargas92495/app/components/DefaultCatchBoundary";
export { default as ErrorBoundary } from "@dvargas92495/app/components/DefaultErrorBoundary";

type GameViews = Awaited<ReturnType<typeof getGames>>["gameViews"];

const GameSession = (g: GameViews[number]) => {
  return (
    <div className="flex justify-between p-4 items-center">
      <span />
      <input
        name={"gameSessionId"}
        defaultValue={g.gameSessionId}
        type={"hidden"}
      />
      <span>{g.creatorId}</span>
      {g.isPrivate && <BaseInput placeholder="password" type={"password"} />}
      <BaseInput
        type={"radio"}
        name={"gameSessionId"}
        value={g.gameSessionId}
      />
    </div>
  );
};

const PlayerPage = (): React.ReactElement => {
  const { gameViews, roster } =
    useLoaderData<Awaited<ReturnType<typeof getGames>>>();
  return (
    <div>
      <h1>Pick your Game</h1>
      <Form method="post">
        <div className="flex justify-between p-4">
          <span>New Game</span>
          <span>{"web"}</span>
          <input />
          <BaseInput type={"radio"} name={"gameSessionId"} value={"new"} />
        </div>
        {gameViews.map((g) => (
          <GameSession key={g.gameSessionId} {...g} />
        ))}
        <hr />
        <h1>Pick your Team</h1>
        {roster.map((r) => (
          <Checkbox name={"robot"} value={r.uuid} label={r.name} />
        ))}
        <Button>Join</Button>
      </Form>
    </div>
  );
};

export const loader: LoaderFunction = (args) => {
  return remixAppLoader(args, getGames);
};

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();
  // return joinGame({
  //   playerId: "web",
  //   gameSessionId: data.get("gameSessionId") as string,
  //   password: data.get("password") as string,
  // }).then((res) => redirect(`/player/${res.playerSessionId}/setup`));
  if (request.method === "post") {
    console.log(data);
    return {}; // createGame({ playerId: "", isPrivate: "false", password: "" });
  } else
    throw new Response(`Method ${request.method} Not Found`, { status: 404 });
};

export default PlayerPage;
