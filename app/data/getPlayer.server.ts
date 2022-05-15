import gamelift from "./gamelift.server";
import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";

const getRobotModel = (uuid: string) => {
  return Promise.resolve({
    priority: 8,
    health: 8,
    attack: 8,
    name: uuid,
  });
};

const getPlayer = ({
  userId,
  params,
}: {
  userId: string;
  params: Record<string, string | undefined>;
}) => {
  const id = params["id"];
  return Promise.all([
    gamelift
      .describePlayerSessions({
        PlayerSessionId: id,
      })
      .promise(),
    getMysqlConnection().then(({ execute, destroy }) =>
      execute(`SELECT uuid, model_uuid FROM robot_instances WHERE user_id`, [
        userId,
      ]).then((records) => {
        destroy();
        const instances = records as { uuid: string; model_uuid: string }[];
        return Promise.all(
          instances.map((r) =>
            getRobotModel(r.model_uuid).then((m) => ({ uuid: r.uuid, ...m }))
          )
        );
      })
    ),
  ]).then(([r, myRoster]) => ({
    playerSessionId: id,
    ipAddress: (r.PlayerSessions || [])[0].IpAddress,
    port: (r.PlayerSessions || [])[0].Port,
    myRoster,
  }));
};

export default getPlayer;
