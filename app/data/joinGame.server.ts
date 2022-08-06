import gamelift from "./gamelift.server";
import { UnauthorizedError } from "@dvargas92495/app/backend/errors.server";

const joinGame = ({
  playerId,
  gameSessionId,
  password,
  team,
}: {
  playerId: string;
  gameSessionId: string;
  password: string;
  team: string[];
}) =>
  gamelift
    .describeGameSessions({ GameSessionId: gameSessionId })
    .promise()
    .then((gameSession) => {
      const props = gameSession.GameSessions?.[0]?.GameProperties || [];
      const isPrivate =
        props.find((g) => g.Key === "IsPrivate")?.Value === "True";
      const gamePassword = props.find((g) => g.Key === "Password")?.Value || "";
      if (isPrivate && password !== gamePassword) {
        throw new UnauthorizedError(
          `Entered incorrect password for private game`
        );
      }
      return gamelift
        .createPlayerSession({
          PlayerId: playerId,
          GameSessionId: gameSessionId,
          PlayerData: team.join(","),
        })
        .promise();
    })
    .then((r) => ({
      playerSessionId: r.PlayerSession?.PlayerSessionId,
      ipAddress: r.PlayerSession?.IpAddress,
      port: r.PlayerSession?.Port,
    }));

export default joinGame;
