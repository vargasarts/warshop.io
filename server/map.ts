export const VOID_SPACE_ID = 0;
export const BLANK_SPACE_ID = 1;
export const BATTERY_SPACE_ID = 2;
export const QUEUE_SPACE_ID = 4;

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

const createSpace = (char: string, x: number, y: number): Space => {
  const isUpper = char === char.toUpperCase();
  switch (char) {
    case "W":
      return { type: BLANK_SPACE_ID, x, y };
    case "P":
    case "p":
      return { type: BATTERY_SPACE_ID, isPrimary: isUpper, x, y };
    case "A":
    case "a":
    case "B":
    case "b":
    case "C":
    case "c":
    case "D":
    case "d":
      return {
        type: QUEUE_SPACE_ID,
        isPrimary: isUpper,
        index: char.charCodeAt(0) - (isUpper ? "A" : "a").charCodeAt(0),
        x,
        y,
      };
    default:
      return { type: VOID_SPACE_ID, x, y };
  }
};

export const createMap = (boardFile: string): Map => {
  const lines = boardFile.split("\n");
  const [width, height] = lines[0]
    .trim()
    .split("")
    .map((s) => Number(s));
  const spaces = lines.slice(1).flatMap((line, y) => {
    const cells = line.trim().split(" ");
    return cells.map((cell, x) => createSpace(cell, x, y));
  });
  return {
    width,
    height,
    spaces,
    primaryDock: new Set(),
    secondaryDock: new Set(),
  };
};
export const NULL_VEC = { x: -1, y: -1 };
