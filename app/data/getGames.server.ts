import getFleetId from "./getFleetId.server";
import gamelift from "./gamelift.server";
import getRobotRoster from "./getRobotRoster.server";
import { users } from "@clerk/clerk-sdk-node";

const getGames = ({ userId }: { userId: string }) => {
  return Promise.all([
    getFleetId().then((FleetId) => {
      return gamelift
        .describeGameSessions({ FleetId, StatusFilter: "ACTIVE" })
        .promise();
    }),
    getRobotRoster(userId),
    users.getUser(userId),
  ])
    .then(async ([res, roster, user]) => {
      return {
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
        roster,
        playerId:
          user.username ||
          user.firstName ||
          user.emailAddresses[0]?.emailAddress,
      };
    })
    .catch((e) => {
      console.log(e);
      throw new Response(e.message, { status: 500 });
    });
};

export default getGames;
