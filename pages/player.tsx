import React, { useEffect, useState } from "react";
import useHandler from "@dvargas92495/ui/dist/useHandler";
import Button from "@mui/material/Button";
import type { Handler as GetGames } from "../functions/games/get";
import type { Handler as CreateGame } from "../functions/game/post";

type GameViews = Awaited<ReturnType<GetGames>>["gameViews"];

const PlayerPage = (): React.ReactElement => {
  const getGames = useHandler<GetGames>({
    path: "games",
    method: "GET",
  });
  const createGame = useHandler<CreateGame>({
    path: "game",
    method: "POST",
  });
  const [games, setGames] = useState<GameViews>([]);
  useEffect(() => {
    getGames().then((r) => setGames(r.gameViews));
  }, [getGames, setGames]);
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
        <span>Web</span>
        <input />
        <Button
          color={"primary"}
          variant={"contained"}
          onClick={() => createGame({ playerId: "Web" })}
        >
          Create
        </Button>
      </div>
      {games.map((g) => (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: 16,
          }}
        >
          <span>{g.gameSessionId}</span>
          <span>{g.creatorId}</span>
          {g.isPrivate && <input />}
          <Button color={"primary"} variant={"contained"}>
            Join
          </Button>
        </div>
      ))}
    </div>
  );
};

export default PlayerPage;
