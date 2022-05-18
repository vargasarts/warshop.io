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

const loadMatch = (
  id: string
) => {
  return gamelift
    .describePlayerSessions({ PlayerSessionId: id })
    .promise()
    .then((ps) => {
      if (!ps.PlayerSessions?.length) {
        throw new Error(`Could not find any player sessions with id ${id}`);
      }
      const [session] = ps.PlayerSessions;
      return gamelift
        .describeGameSessionDetails({
          GameSessionId: session.GameSessionId,
        })
        .promise()
        .then((details) => ({ details, session }));
    })
    .then(async ({ details, session }) => {
      const playerId = session.PlayerId;
      if (!details.GameSessionDetails?.length) {
        throw new Error(`Could not find any game sessions with id ${id}`);
      }
      const { GameSession } = details.GameSessionDetails[0];
      if (!GameSession) {
        throw new Error(`Could not find any game sessions with id ${id}`);
      }
      const properties = Object.fromEntries(
        (GameSession.GameProperties || []).map((prop) => [prop.Key, prop.Value])
      );
      const allPlayers = await gamelift
        .describePlayerSessions({
          GameSessionId: GameSession.GameSessionId,
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
      if (!opponent) {
        throw new Error("Failed to find opponent in game's player sessions");
      }
      return {
        myTeam: await Promise.all(
          me.data
            .split(",")
            .map((r) =>
              getRobot(r).then((rob) => ({
                ...rob,
                id: 0,
                position: {x:0, y:0},
                startingHealth: rob.health,
              }))
            )
        ),
        opponentTeam: await Promise.all(
          opponent.data
            .split(",")
            .map((r) =>
              getRobot(r).then((rob) => ({
                ...rob,
                id: 0,
                position: {x:0, y:0},
                startingHealth: rob.health,
              }))
            )
        ),
        opponentName: id,
        isPrimary: allPlayers[0].id === playerId,
        board: await getBoardById(properties["board"]),
        ipAddress: session.IpAddress,
        port: session.Port,
        playerSessionId: id,
      };
    });
};

export default loadMatch;
