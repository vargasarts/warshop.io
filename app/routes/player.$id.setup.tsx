import type { RobotStats } from "../../server/game";
import Button from "@dvargas92495/app/components/Button";
const PLAYER_ID = "Web";

const SetupScene = ({
  ws,
  myRoster,
}: {
  ws: WebSocket;
  myRoster: RobotStats[];
}): React.ReactElement => {
  return (
    <div>
      <Button
        onClick={() =>
          ws.send(
            JSON.stringify({
              name: "START_GAME",
              myRobots: myRoster.slice(0, 4).map((r) => r.uuid),
              myName: PLAYER_ID,
            })
          )
        }
      >
        Ready!
      </Button>
      <ul>
        {myRoster.map((r) => (
          <li key={r.uuid}>{r.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default SetupScene;
