import createAPIGatewayProxyHandler from "aws-sdk-plus/dist/createAPIGatewayProxyHandler";
import { BadRequestError } from "aws-sdk-plus/dist/errors";
import { gamelift } from "../_common";
import getFleetId from "../_common/getFleetId";

const logic = ({
  playerId,
  isPrivate = 'false',
  password = "",
}: {
  playerId: string;
  isPrivate?: string;
  password?: string;
}) => {
  if (!playerId) {
    throw new BadRequestError("`playerId` is required");
  }
  if (isPrivate === 'true' && !password) {
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

export const handler = createAPIGatewayProxyHandler(logic);
export type Handler = typeof logic;
