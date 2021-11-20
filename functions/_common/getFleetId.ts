import { gamelift } from ".";

const getFleetId =
  process.env.NODE_ENV === "development"
    ? () => Promise.resolve("fleet-123")
    : () =>
        gamelift
          .listAliases({ Name: "WarshopServer" })
          .promise()
          .then((res) => {
            const AliasId = res.Aliases?.[0]?.AliasId || "";
            return gamelift.describeAlias({ AliasId }).promise();
          })
          .then((res) => res.Alias?.RoutingStrategy?.FleetId);

export default getFleetId;
