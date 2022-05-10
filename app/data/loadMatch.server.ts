import type { Robot } from "../../server/game";
import type { Map } from "../../server/map";

const loadMatch = (
  id: string
): {
  myTeam: Robot[];
  opponentTeam: Robot[];
  opponentName: string;
  isPrimary: boolean;
  board: Map;
} => {
  return {
    myTeam: [],
    opponentTeam: [],
    opponentName: id,
    isPrimary: false,
    board: {
      spaces: [],
      width: 4,
      height: 4,
      primaryDock: new Set(),
      secondaryDock: new Set(),
    },
  };
};

export default loadMatch;
