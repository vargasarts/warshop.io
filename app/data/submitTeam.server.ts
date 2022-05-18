import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";
import gamelift from "./gamelift.server";
import getRobotModel from "./getRobotModel.server";

const submitTeam = ({
  userId,
  data,
  params,
}: {
  userId: string;
  data: Record<string, string[]>;
  params: Record<string, string | undefined>;
}) => {
    // TODO: check that userId can actually submit to this player session
  const id = params["id"];
  return gamelift
    .describePlayerSessions({
      PlayerSessionId: id,
    })
    .promise()
    .then(() => gamelift.pla);
};

export default submitTeam;
