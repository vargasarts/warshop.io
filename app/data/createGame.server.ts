import { BadRequestError } from "aws-sdk-plus/dist/errors";
import gamelift from "./gamelift.server";
import getFleetId from "./getFleetId.server";

const createGame = ({
  playerId,
  isPrivate = "false",
  password = "",
  team,
}: {
  playerId: string;
  isPrivate?: string;
  password?: string;
  team: string[];
}) => {
  if (!playerId) {
    throw new BadRequestError("`playerId` is required");
  }
  if (isPrivate === "true" && !password) {
    throw new BadRequestError("`password` is required for private matches");
  }
  if (!team.length) {
    throw new BadRequestError("At least one robot must be on the team");
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
          PlayerData: team.join(","),
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
