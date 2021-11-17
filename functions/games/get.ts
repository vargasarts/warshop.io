import createAPIGatewayProxyHandler from "aws-sdk-plus/dist/createAPIGatewayProxyHandler";
import AWS from "aws-sdk";

const gamelift = new AWS.GameLift();

const logic = () => {
  return gamelift
    .listAliases({ Name: "WarshopServer" })
    .promise()
    .then((res) => {
      const AliasId = res.Aliases?.[0]?.AliasId || "";
      return gamelift.describeAlias({ AliasId }).promise();
    })
    .then((res) => {
      const FleetId = res.Alias?.RoutingStrategy?.FleetId;
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
