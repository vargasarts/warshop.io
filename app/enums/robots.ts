import type { RobotStats } from "../../server/game";

const PlatinumGrunt: RobotStats = {
  priority: 8,
  health: 8,
  attack: 3,
  name: "Platinum Grunt",
  uuid: "05da83b5-f7c7-4478-b426-e4a2b69ab2b7",
};

const GoldenGrunt: RobotStats = {
  priority: 7,
  health: 8,
  attack: 3,
  name: "Golden Grunt",
  uuid: "f9564a8b-836e-4259-81bb-cdafadba0ed2",
};

const SilverGrunt: RobotStats = {
  priority: 6,
  health: 8,
  attack: 3,
  name: "Silver Grunt",
  uuid: "06ea4e02-0697-48f4-9296-d72153b5a58d",
};

const BronzeGrunt: RobotStats = {
  priority: 5,
  health: 8,
  attack: 3,
  name: "Bronze Grunt",
  uuid: "df38d5f0-2023-47ba-b614-67b86be047ba",
};

const all = [PlatinumGrunt, GoldenGrunt, SilverGrunt, BronzeGrunt];

export default all;
