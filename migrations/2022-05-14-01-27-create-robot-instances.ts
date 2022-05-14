import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";
import type { MigrationProps } from "fuegojs/dist/migrate";

export const migrate = ({ connection }: MigrationProps) => {
  return getMysqlConnection(connection).then((connection) =>
    connection.execute(
      `CREATE TABLE IF NOT EXISTS robot_instances (
          uuid          VARCHAR(36) NOT NULL,
          address       VARCHAR(64) NOT NULL,
          network       INT         NOT NULL,
          version       VARCHAR(17) NOT NULL,
          user_id       VARCHAR(32) NOT NULL,
          model_uuid    VARCHAR(36) NOT NULL,
  
          PRIMARY KEY (uuid),
          CONSTRAINT UC_name UNIQUE (address,network)
        )`
    )
  );
};

export const revert = ({ connection }: MigrationProps) => {
  return getMysqlConnection(connection).then((connection) =>
    connection.execute(`DROP TABLE IF EXISTS robot_instances`)
  );
};
