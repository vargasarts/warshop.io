import gamelift from "./gamelift.server";
import type { RobotStats } from "../../server/game";

const getPlayer = (id: string) => {
  return gamelift
    .describePlayerSessions({
      PlayerSessionId: id,
    })
    .promise()
    .then((r) => ({
      playerSessionId: id,
      ipAddress: (r.PlayerSessions || [])[0].IpAddress,
      port: (r.PlayerSessions || [])[0].Port,
      myRoster: [] as RobotStats[],
    }));
};

export default getPlayer;
