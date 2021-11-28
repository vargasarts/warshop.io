type Space = { x: number; y: number, type: number };
/*
type Void = Space & { type: 0 };
type Blank = Space & { type: 1 };
type Battery = Space & { type: 2 | 3; isPrimary: boolean };
type Queue = Space & {
  type: 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
  isPrimary: boolean;
  index: 0 | 1 | 2 | 3;
};
*/
export type Map = { spaces: Space[]; width: number; height: number };

const VOID_ID = 0;
const BLANK_ID = 1;
const BATTERY_ID = 2;
const QUEUE_ID = 4;

const createSpace = (char: string) => {
  const isUpper = char === char.toUpperCase();
  const index = char.charCodeAt(0) - (isUpper ? "A" : "a").charCodeAt(0);
  switch (char) {
    case "W":
      return { type: BLANK_ID };
    case "P":
    case "p":
      return { type: BATTERY_ID + (isUpper ? 0 : 1), isPrimary: isUpper };
    case "A":
    case "a":
    case "B":
    case "b":
    case "C":
    case "c":
    case "D":
    case "d":
      return {
        type: QUEUE_ID * (isUpper ? 1 : 2) + index,
        isPrimary: isUpper,
        index,
      };
    default:
      return { type: VOID_ID };
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
    return cells.map((cell, x) => ({ ...createSpace(cell), x, y }));
  });
  return { width, height, spaces };
};
export const NULL_VEC = { x: -1, y: -1 };
