import { BadRequestError } from "aws-sdk-plus/dist/errors";
import gamelift from "./gamelift.server";
import getFleetId from "./getFleetId.server";

const createGame = ({
  playerId,
  isPrivate = "false",
  password = "",
}: {
  playerId: string;
  isPrivate?: string;
  password?: string;
}) => {
  console.log('player id', playerId, isPrivate, password);
  if (!playerId) {
    throw new BadRequestError("`playerId` is required");
  }
  if (isPrivate === "true" && !password) {
    throw new BadRequestError("`password` is required for private matches");
  }
  return getFleetId()
    .then((FleetId) => {
      return gamelift
        .createGameSession({
          FleetId,
          CreatorId: playerId,
          MaximumPlayerSessionCount: 2,
          GameProperties: [
            { Key: "IsPrivate", Value: isPrivate },
            { Key: "Password", Value: password },
          ],
        })
        .promise();
    })
    .then(({ GameSession }) =>
      gamelift
        .createPlayerSession({
          PlayerId: playerId,
          GameSessionId: GameSession?.GameSessionId || "",
        })
        .promise()
    )
    .then(({ PlayerSession }) => ({
      playerSessionId: PlayerSession?.PlayerSessionId,
      ipAddress: PlayerSession?.IpAddress,
      port: PlayerSession?.Port,
    }));
};

export default createGame;
