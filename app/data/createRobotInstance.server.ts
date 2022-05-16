import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";
import { v4 } from "uuid";

const createRobotInstance = ({
  model,
  userId,
  address,
  network,
  version,
}: {
  model: string;
  userId: string;
  address: string;
  network: number;
  version: string;
}): Promise<string> =>
  getMysqlConnection().then(({ execute, destroy }) =>
    Promise.resolve(v4()).then((uuid) =>
      execute(
        `INSERT INTO robot_instances (uuid, address, network, version, model_uuid, user_id) 
      VALUES (?, ?, ?, ?, ?, ?)`,
        [uuid, address, network, version, model, userId]
      ).then(() => {
        destroy();
        return uuid;
      })
    )
  );

export default createRobotInstance;
