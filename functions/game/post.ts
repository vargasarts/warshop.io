import createAPIGatewayProxyHandler from "aws-sdk-plus/dist/createAPIGatewayProxyHandler";
import { gamelift } from "../_common";
import getFleetId from "../_common/getFleetId";

const logic = ({
  playerId,
  isPrivate,
  password = "",
}: {
  playerId: string;
  isPrivate: boolean;
  password?: string;
}) => {
  return getFleetId()
    .then((FleetId) => {
      return gamelift
        .createGameSession({
          FleetId,
          CreatorId: playerId,
          MaximumPlayerSessionCount: 2,
          GameProperties: [
            { Key: "IsPrivate", Value: `${isPrivate}` },
            { Key: "Password", Value: password },
          ],
        })
        .promise();
    })
    .then(({ GameSession }) =>
      gamelift
        .createPlayerSession({
          PlayerId: playerId,
          GameSessionId: GameSession?.GameSessionId,
        })
        .promise()
    )
    .then(({ PlayerSession }) => ({
      playerSessionId: PlayerSession?.PlayerSessionId,
      ipAddress: PlayerSession.IpAddress,
      port: PlayerSession?.Port,
    }));
};

export const handler = createAPIGatewayProxyHandler(logic);

/**
int retries = 0;
while (gameSession.Status.Equals(GameSessionStatus.ACTIVATING) && retries < 100)
{
    DescribeGameSessionsRequest describeReq = new DescribeGameSessionsRequest();
    describeReq.GameSessionId = res.GameSession.GameSessionId;
    gameSession = (await amazonClient.DescribeGameSessionsAsync(describeReq)).GameSessions[0];
    retries++;
}
 */
