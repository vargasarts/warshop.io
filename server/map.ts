import {
  BATTERY_SPACE_ID,
  BLANK_SPACE_ID,
  QUEUE_SPACE_ID,
  VOID_SPACE_ID,
} from "~/enums/spaces";

type SpaceBase = { x: number; y: number };
export type VoidSpace = SpaceBase & { type: typeof VOID_SPACE_ID };
export type BlankSpace = SpaceBase & { type: typeof BLANK_SPACE_ID };
export type BatterySpace = SpaceBase & {
  type: typeof BATTERY_SPACE_ID;
  isPrimary: boolean;
};
export type QueueSpace = SpaceBase & {
  type: typeof QUEUE_SPACE_ID;
  isPrimary: boolean;
  index: number;
};
export type Space = QueueSpace | BatterySpace | BlankSpace | VoidSpace;
export type Map = {
  spaces: Space[];
  width: number;
  height: number;
  primaryDock: Set<number>;
  secondaryDock: Set<number>;
};

export const NULL_VEC = { x: -1, y: -1 };
