import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";
import type { RobotStats } from "../../server/game";
import getRobotModel from "./getRobotModel.server";

const getRobotByUuid = (uuid: string): Promise<RobotStats> =>
  getMysqlConnection().then(({ execute, destroy }) =>
    execute(`SELECT model_uuid FROM robot_instances WHERE uuid = ?`, [
      uuid,
    ]).then((records) => {
      destroy();
      const [robotModel] = records as { model_uuid: string }[];
      if (!robotModel)
        return Promise.reject(
          `Could not find robot model from instance ${uuid}`
        );
      return getRobotModel(robotModel.model_uuid);
    })
  );

export default getRobotByUuid;
