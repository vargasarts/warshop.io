import gamelift from "./gamelift.server";
import getBoardById from "./getBoardById.server";
import getRobot from "./getRobot.server";

const loadMatch = (id: string) => {
  return gamelift
    .describePlayerSessions({ PlayerSessionId: id })
    .promise()
    .then(async (ps) => {
      if (!ps.PlayerSessions?.length) {
        throw new Error(`Could not find any player sessions with id ${id}`);
      }
      const [session] = ps.PlayerSessions;
      return {
        myTeam: await Promise.all(
          (session.PlayerData || "").split(",").map((r) =>
            getRobot(r).then((rob) => ({
              ...rob,
              id: 0,
              position: { x: 0, y: 0 },
              startingHealth: rob.health,
            }))
          )
        ),
        // Gamelift local does not support describe game session details
        // so dont stick data in there
        // storing data in mysql gives us the option to eventually
        // run away from AWS
        board: await getBoardById("todo"),
        ipAddress: session.IpAddress,
        port: session.Port,
        playerSessionId: id,
      };
    });
};

export default loadMatch;
