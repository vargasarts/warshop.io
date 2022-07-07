import gamelift from "./gamelift.server";
import getRobot from "./getRobot.server";

const getBoardById = (id: string) =>
  Promise.resolve({
    spaces: [],
    width: 4,
    height: 4,
    primaryDock: new Set<number>(),
    secondaryDock: new Set<number>(),
    id,
  });

const loadMatch = (id: string) => {
  return gamelift
    .describePlayerSessions({ PlayerSessionId: id })
    .promise()
    .then(async (ps) => {
      if (!ps.PlayerSessions?.length) {
        throw new Error(`Could not find any player sessions with id ${id}`);
      }
      const [session] = ps.PlayerSessions;
      const playerId = session.PlayerId;
      const allPlayers = await gamelift
        .describePlayerSessions({
          GameSessionId: session.GameSessionId,
        })
        .promise()
        .then((r) =>
          (r.PlayerSessions || []).map((p) => ({
            id: p.PlayerId,
            data: p.PlayerData || "",
          }))
        );
      const me = allPlayers.find((p) => p.id === playerId);
      if (!me) {
        throw new Error("Failed to find myself in game's player sessions");
      }
      const opponent = allPlayers.find((p) => p.id !== playerId);
      return {
        myTeam: await Promise.all(
          me.data.split(",").map((r) =>
            getRobot(r).then((rob) => ({
              ...rob,
              id: 0,
              position: { x: 0, y: 0 },
              startingHealth: rob.health,
            }))
          )
        ),
        opponentTeam: opponent
          ? await Promise.all(
              opponent.data.split(",").map((r) =>
                getRobot(r).then((rob) => ({
                  ...rob,
                  id: 0,
                  position: { x: 0, y: 0 },
                  startingHealth: rob.health,
                }))
              )
            )
          : [],
        opponentName: id,
        isPrimary: allPlayers[0].id === playerId,
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
