import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";
import { v4 } from "uuid";

const buyFromMarket = ({
  data,
  userId,
}: {
  data: Record<string, string[]>;
  userId: string;
}) => {
  const model = data["model"][0];
  const uuid = v4();
  return getMysqlConnection()
    .then((cxn) =>
      cxn
        .execute(
          `INSERT INTO robot_instances(uuid, address,network,version,user_id,model_uuid)
      VALUES (?,?,?,?,?,?)`,
          [uuid, `0x${uuid.slice(0, 8)}`, 4, "0xdeadbeef", userId, model]
        )
        .then(() => cxn.destroy())
    )
    .then(() => ({ success: true, message: "Successfully bought robot!" }));
};

export default buyFromMarket;
