import gamelift from "./gamelift.server";
import { UnauthorizedError } from "aws-sdk-plus/dist/errors";

const joinGame = ({
  playerId,
  gameSessionId,
  password,
}: {
  playerId: string;
  gameSessionId: string;
  password: string;
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
        })
        .promise();
    })
    .then((r) => ({
      playerSessionId: r.PlayerSession?.PlayerSessionId,
      ipAddress: r.PlayerSession?.IpAddress,
      port: r.PlayerSession?.Port,
    }));

export default joinGame;
