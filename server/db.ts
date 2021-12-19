import type { RobotStats } from "./game";
import { v4 } from "uuid";

type IdLessRobotStats = Omit<RobotStats, "uuid">;

const PlatinumGrunt: IdLessRobotStats = {
  priority: 8,
  health: 8,
  attack: 3,
  name: "Platinum Grunt",
};

const GoldenGrunt: IdLessRobotStats = {
  priority: 7,
  health: 8,
  attack: 3,
  name: "Golden Grunt",
};

const SilverGrunt: IdLessRobotStats = {
  priority: 6,
  health: 8,
  attack: 3,
  name: "Silver Grunt",
};

const BronzeGrunt: IdLessRobotStats = {
  priority: 5,
  health: 8,
  attack: 3,
  name: "Bronze Grunt",
};

const all = [PlatinumGrunt, GoldenGrunt, SilverGrunt, BronzeGrunt];
const repo: { [uuid: string]: RobotStats } = {};

const mockRobot = () => {
  const stats = all[Math.floor(Math.random() * all.length)];
  const robot = { ...stats, uuid: v4() };
  repo[robot.uuid] = robot;
  return robot;
};

export const getRobotRosterByPlayerId = (
  playerId: string
): Promise<RobotStats[]> => {
  if (playerId) {
    return Promise.resolve(Array.from({ length: 6 }, mockRobot));
  } else {
    return Promise.resolve([]);
  }
};

export const getRobotByUuid = (uuid: string): Promise<RobotStats> =>
  Promise.resolve(repo[uuid]);
