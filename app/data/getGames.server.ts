import getFleetId from "./getFleetId.server";
import gamelift from "./gamelift.server";

const getGames = () => {
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
          isPrivate:
            g.GameProperties?.find((gp) => gp.Key === "IsPrivate")?.Value ===
            "False",
        })),
    }));
};

export default getGames;
