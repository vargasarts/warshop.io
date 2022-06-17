import React, { useState } from "react";
import { Form, useLoaderData } from "@remix-run/react";
import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import BaseInput from "@dvargas92495/app/components/BaseInput";
import Button from "@dvargas92495/app/components/Button";
import Checkbox from "@dvargas92495/app/components/Checkbox";
import getGames from "~/data/getGames.server";
import joinGame from "~/data/joinGame.server";
import createGame from "~/data/createGame.server";
import remixAppAction from "@dvargas92495/app/backend/remixAppAction.server";
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
  const { gameViews, roster, playerId } =
    useLoaderData<Awaited<ReturnType<typeof getGames>>>();
  const [isNewGame, setIsNewGame] = useState(true);
  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">Pick your Game</h1>
      <Form method="post" className="flex flex-col h-full items-start">
        <div className="flex-grow">
          <div className="flex justify-between px-4 pt-4 border rounded-t-md border-gray-300 gap-4">
            <span>New Game</span>
            <span>{playerId}</span>
            <input />
            <BaseInput
              type={"radio"}
              name={"gameSessionId"}
              value={"new"}
              defaultChecked
              onChange={(e) => setIsNewGame(e.target.checked)}
            />
          </div>
          {gameViews.map((g) => (
            <GameSession key={g.gameSessionId} {...g} />
          ))}
          <h1 className="mb-4 text-3xl font-bold mt-8">Pick your Team</h1>
          {roster.map((r) => (
            <Checkbox name={"robot"} value={r.uuid} label={r.name} />
          ))}
        </div>
        <Button className="my-8">{isNewGame ? "Create" : "Join"}</Button>
      </Form>
    </div>
  );
};

export const loader: LoaderFunction = (args) => {
  return remixAppLoader(args, getGames);
};

export const action: ActionFunction = async (args) => {
  return remixAppAction(args, ({ method, userId, data }) => {
    if (method === "POST") {
      const gameSessionId = data["gameSessionId"]?.[0];

      return gameSessionId
        ? createGame({ playerId: userId, isPrivate: "false", password: "" })
        : joinGame({
            playerId: userId,
            gameSessionId,
            password: "",
          }).then((res) => redirect(`/player/${res.playerSessionId}/setup`));
    } else throw new Response(`Method ${method} Not Found`, { status: 404 });
  });
};

export default PlayerPage;
