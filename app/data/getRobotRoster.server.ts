import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";
import getRobotModel from "./getRobotModel.server";

const getRobotRoster = (userId: string) =>
  getMysqlConnection().then(({ execute, destroy }) =>
    execute(`SELECT uuid, model_uuid FROM robot_instances WHERE user_id = ?`, [
      userId,
    ]).then((records) => {
      destroy();
      const instances = records as { uuid: string; model_uuid: string }[];
      return Promise.all(
        instances.map((r) =>
          getRobotModel(r.model_uuid).then((rm) => ({ ...rm, ...r }))
        )
      );
    })
  );

export default getRobotRoster;
