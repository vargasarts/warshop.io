import createAPIGatewayProxyHandler from "aws-sdk-plus/dist/createAPIGatewayProxyHandler";
import { gamelift } from "../_common";
import getFleetId from "../_common/getFleetId";

const logic = () => {
  return getFleetId()
    .then((FleetId) => {
      return gamelift
        .describeGameSessions({ FleetId, StatusFilter: "ACTIVE" })
        .promise();
    })
    .then((res) => ({
      gameViews: (res.GameSessions || [])
        .filter(
          (g) =>
            (g.CurrentPlayerSessionCount || 0) <
            (g.MaximumPlayerSessionCount || 2)
        )
        .map((g) => ({
          gameSessionId: g.GameSessionId,
          creatorId: g.CreatorId,
          isPrivate: g.GameProperties?.some((gp) => gp.Key === "IsPrivate"),
        })),
    }));
};

export const handler = createAPIGatewayProxyHandler(logic);
export type Handler = typeof logic;
