import {
  BatterySpace,
  Map,
  NULL_VEC,
  QueueSpace,
  Space,
} from "./map";
import { WebSocket } from "ws";
import { QUEUE_SPACE_ID, BATTERY_SPACE_ID } from "~/enums/spaces";

type Position = {
  x: number;
  y: number;
};

export type RobotStats = {
  priority: number;
  health: number;
  attack: number;
  name: string;
  uuid: string;
};

export type Robot = {
  id: number;
  position: Position;
  startingHealth: number;
} & RobotStats;

type Player = {
  joined: boolean;
  ws: WebSocket;
  name: string;
  ready: boolean;
  team: Robot[];
  battery: number;
};

const SPAWN_COMMAND_ID = 0;
const MOVE_COMMAND_ID = 1;
const ATTACK_COMMAND_ID = 2;
const SPECIAL_COMMAND_ID = 3;

const DEFAULT_SPAWN_POWER = 2;
const DEFAULT_MOVE_POWER = 2;
const DEFAULT_ATTACK_POWER = 2;
const DEFAULT_DEATH_MULTIPLIER = 16;
const MAX_PRIORITY = 8;
const DEFAULT_BATTERY_MULTIPLIER = 8;

export type Command = {
  robotId: number;
  commandId: number;
  direction: number;
};

const SPAWN_EVENT_ID = 1;
const MOVE_EVENT_ID = 2;
const ATTACK_EVENT_ID = 3;
const DEATH_EVENT_ID = 9;
const RESOLVE_EVENT_ID = 12;
const END_EVENT_ID = 13;

type GameEventBase = {
  priority: number;
  primaryBatteryCost: number;
  secondaryBatteryCost: number;
};

type SpawnEvent = GameEventBase & {
  type: typeof SPAWN_EVENT_ID;
  destinationPos: Position;
  robotId: number;
};

type MoveEvent = GameEventBase & {
  type: typeof MOVE_EVENT_ID;
  sourcePos: Position;
  destinationPos: Position;
  robotId: number;
};

type AttackEvent = GameEventBase & {
  type: typeof ATTACK_EVENT_ID;
  locs: ReadonlyArray<Position>;
  robotId: number;
};

type ResolveEvent = GameEventBase & {
  type: typeof RESOLVE_EVENT_ID;
  robotIdToSpawn: number[];
  robotIdToMove: number[];
  robotIdToHealth: number[];
  missedAttacks: number[];
  robotIdsBlocked: number[];
  myBatteryHit: boolean;
  opponentBatteryHit: boolean;
};

type DeathEvent = GameEventBase & {
  type: typeof DEATH_EVENT_ID;
  robotId: number;
  returnHealth: number;
};

type EndEvent = GameEventBase & {
  type: typeof END_EVENT_ID;
  primaryLost: boolean;
  secondaryLost: boolean;
  turnCount: number;
};

type GameEvent =
  | SpawnEvent
  | MoveEvent
  | AttackEvent
  | DeathEvent
  | ResolveEvent
  | EndEvent;

export type Game = {
  healthChecks: number;
  gameSessionId: string;
  board: Map;
  nextRobotId: 0;
  primary?: Player;
  secondary?: Player;
  turn: number;
  history: { [turn: number]: { [name: string]: Command[] } };
};

type LiveGame = Required<Game>;

export const storeCommands = (
  g: Game,
  p: Player,
  commands: Omit<Command, "owner">[]
): void => {
  g.history[g.turn] = {
    ...(g.history[g.turn] || {}),
    [p.name]: (commands || []).map((c) => ({ ...c, owner: p.name })),
  };
  p.ready = true;
};

const UP = 0;
const LEFT = 1;
const DOWN = 2;
const RIGHT = 3;
const directionToVector = (dir: number) => {
  switch (dir) {
    case UP:
      return { x: 0, y: 1 };
    case DOWN:
      return { x: 0, y: -1 };
    case LEFT:
      return { x: -1, y: 0 };
    case RIGHT:
      return { x: 1, y: 0 };
    default:
      return { x: 0, y: 0 };
  }
};
const posEquals = (l: Position, r: Position) => l.x === r.x && l.y === r.y;
const posPlus = (l: Position, r: Position) => ({ x: l.x + r.x, y: l.y + r.y });

const spawn = (
  r: Robot,
  pos: Position,
  isPrimary: boolean,
  priority: number
): GameEvent[] => {
  if (!posEquals(r.position, NULL_VEC)) return [];
  const evt = {
    destinationPos: pos,
    robotId: r.id,
    type: SPAWN_EVENT_ID,
    primaryBatteryCost: isPrimary ? DEFAULT_SPAWN_POWER : 0,
    secondaryBatteryCost: isPrimary ? 0 : DEFAULT_SPAWN_POWER,
    priority,
  } as const;
  return [evt];
};
const move = (
  r: Robot,
  dir: number,
  isPrimary: boolean,
  priority: number
): GameEvent[] => {
  if (posEquals(r.position, NULL_VEC)) return [];
  const evt = {
    sourcePos: r.position,
    destinationPos: posPlus(r.position, directionToVector(dir)),
    robotId: r.id,
    type: MOVE_EVENT_ID,
    primaryBatteryCost: isPrimary ? DEFAULT_MOVE_POWER : 0,
    secondaryBatteryCost: isPrimary ? 0 : DEFAULT_MOVE_POWER,
    priority,
  } as const;
  return [evt];
};
const attack = (
  r: Robot,
  dir: number,
  isPrimary: boolean,
  priority: number
): GameEvent[] => {
  if (posEquals(r.position, NULL_VEC)) return [];
  const evt = {
    locs: [posPlus(r.position, directionToVector(dir))],
    robotId: r.id,
    type: ATTACK_EVENT_ID,
    primaryBatteryCost: isPrimary ? DEFAULT_ATTACK_POWER : 0,
    secondaryBatteryCost: isPrimary ? 0 : DEFAULT_ATTACK_POWER,
    priority,
  } as const;
  return [evt];
};
const damage = (attacker: Robot /*victim: Robot*/) => attacker.attack;
const spaceToId = (board: Map, p: Position) => p.y * board.width + p.x;
const vecToSpace = (board: Map, p: Position) => {
  if (p.y < 0 || p.y >= board.height || p.x < 0 || p.x >= board.width)
    return null;
  return board.spaces[spaceToId(board, p)];
};

const getQueuePosition = (
  board: Map,
  i: number,
  isPrimary: boolean
): Position => {
  const queueSpaces: QueueSpace[] = board.spaces.filter(
    (s): s is QueueSpace => s.type == QUEUE_SPACE_ID
  );
  const queueSpace = queueSpaces.find(
    (s) => s.index === i && s.isPrimary === isPrimary
  );
  return {
    x: typeof queueSpace?.x === "number" ? queueSpace.x : -1,
    y: typeof queueSpace?.y === "number" ? queueSpace.y : -1,
  };
};

export const commandsToEvents = (game: LiveGame): GameEvent[] => {
  const { primary, secondary, history, board, turn } = game;
  const commands = [
    ...history[game.turn][game.primary.name],
    ...history[game.turn][game.secondary.name],
  ];
  const allRobots = [...primary.team, ...secondary.team];
  const getRobot = Object.fromEntries(allRobots.map((r) => [r.id, r]));
  const robotIdToTurnObject = Object.fromEntries(
    allRobots.map((r) => [
      r.id,
      {
        robotId: r.id,
        priority: r.priority,
        num: {
          [SPAWN_COMMAND_ID]: 0,
          [MOVE_COMMAND_ID]: 0,
          [ATTACK_COMMAND_ID]: 0,
          [SPECIAL_COMMAND_ID]: 0,
        },
        isActive: true,
      },
    ])
  );
  const events: GameEvent[] = [];
  for (let p = MAX_PRIORITY; p > 0; p--) {
    const currentCmds = new Set<Command>(
      Object.values(robotIdToTurnObject)
        .filter(
          (rto) =>
            rto.priority === p && commands.some((c) => c.robotId == rto.robotId)
        )
        .map((rto) => {
          rto.priority--;
          const commandIndex = commands.findIndex(
            (c) => c.robotId === rto.robotId
          );
          return commands.splice(commandIndex, 1)[0];
        })
    );
    const priorityEvents: GameEvent[] = [];
    currentCmds.forEach((c) => {
      if (
        !robotIdToTurnObject[c.robotId].isActive &&
        !(c.commandId === SPAWN_COMMAND_ID)
      ) {
        currentCmds.delete(c);
      }
    });
    currentCmds.forEach((c) => {
      const primaryRobot = getRobot[c.robotId];
      const isPrimary = primary.team.includes(primaryRobot);
      if (c.commandId === SPAWN_COMMAND_ID) {
        priorityEvents.push(
          ...spawn(
            primaryRobot,
            getQueuePosition(board, c.direction, isPrimary),
            isPrimary,
            p
          )
        );
      } else if (c.commandId === MOVE_COMMAND_ID) {
        priorityEvents.push(...move(primaryRobot, c.direction, isPrimary, p));
      } else if (c.commandId === ATTACK_COMMAND_ID) {
        priorityEvents.push(...attack(primaryRobot, c.direction, isPrimary, p));
      }
    });

    if (priorityEvents.length > 0) {
      const resolveEvent = {
        robotIdToSpawn: Object.fromEntries(
          priorityEvents
            .filter((e): e is SpawnEvent => e.type === SPAWN_EVENT_ID)
            .map((e) => [e.robotId, e.destinationPos])
        ),
        robotIdToMove: Object.fromEntries(
          priorityEvents
            .filter((e): e is MoveEvent => e.type === MOVE_EVENT_ID)
            .map((e) => [e.robotId, e.destinationPos])
        ),
        robotIdToHealth: {} as Record<number, number>,
        robotIdsBlocked: new Set<number>(),
        missedAttacks: new Set<Position>(),
        primaryBatteryCost: 0,
        secondaryBatteryCost: 0,
        priority: p,
        myBatteryHit: false,
        opponentBatteryHit: false,
      };

      priorityEvents
        .filter((e): e is AttackEvent => e.type === ATTACK_EVENT_ID)
        .forEach((e) => {
          const attacker = getRobot[e.robotId];
          allRobots
            .filter((robot) => e.locs.some((l) => posEquals(l, robot.position)))
            .forEach((r) => {
              const dmg = damage(attacker /*r*/);
              resolveEvent.robotIdToHealth[r.id] =
                (resolveEvent.robotIdToHealth[r.id] || r.health) - dmg;
            });
          const locSpaces = e.locs.map((p) => vecToSpace(board, p));
          locSpaces
            .filter((p): p is BatterySpace => p?.type === BATTERY_SPACE_ID)
            .forEach((v) => {
              const drain = DEFAULT_BATTERY_MULTIPLIER * attacker.attack;
              resolveEvent.primaryBatteryCost += v.isPrimary ? drain : 0;
              resolveEvent.secondaryBatteryCost += v.isPrimary ? 0 : drain;
              resolveEvent.myBatteryHit =
                resolveEvent.myBatteryHit || v.isPrimary;
              resolveEvent.opponentBatteryHit =
                resolveEvent.opponentBatteryHit || !v.isPrimary;
            });
          locSpaces
            .filter(
              (v): v is Space =>
                !!v &&
                v?.type !== BATTERY_SPACE_ID &&
                !allRobots.some((r) => posEquals(r.position, v))
            )
            .forEach((v) => {
              resolveEvent.missedAttacks.add(v);
            });
          if (locSpaces.some((v) => v === null))
            resolveEvent.robotIdsBlocked.add(attacker.id);
        });

      let valid = false;
      while (!valid) {
        valid = true;

        // Move x Move
        const spacesToRobotIds: {
          [space: number]: { id: number; isSpawn: boolean }[];
        } = {};
        Object.entries(resolveEvent.robotIdToSpawn).forEach(
          ([robotId, space]) => {
            const id = Number(robotId);
            spacesToRobotIds[spaceToId(board, space)] = [
              ...(spacesToRobotIds[spaceToId(board, space)] || []),
              { id, isSpawn: true },
            ];
          }
        );
        Object.entries(resolveEvent.robotIdToMove).forEach(
          ([robotId, space]) => {
            const id = Number(robotId);
            spacesToRobotIds[spaceToId(board, space)] = [
              ...(spacesToRobotIds[spaceToId(board, space)] || []),
              { id, isSpawn: true },
            ];
          }
        );
        Object.values(spacesToRobotIds)
          .filter((robotIds) => robotIds.length > 1)
          .forEach((robotIds) =>
            robotIds.forEach((r) => {
              if (r.isSpawn) delete resolveEvent.robotIdToSpawn[r.id];
              else delete resolveEvent.robotIdToMove[r.id];
              resolveEvent.robotIdsBlocked.add(r.id);
              valid = false;
            })
          );

        // Spawn x Still
        const spawnsToBlock = Object.entries(
          resolveEvent.robotIdToSpawn
        ).filter(([, space]) => {
          const other = allRobots.find((r) => posEquals(r.position, space));
          if (other == null) return false;
          return !Object.keys(resolveEvent.robotIdToMove).some(
            (m) => other.id === Number(m)
          );
        });
        spawnsToBlock.forEach(([robotId]) => {
          const id = Number(robotId);
          delete resolveEvent.robotIdToSpawn[id];
          resolveEvent.robotIdsBlocked.add(id);
          valid = false;
        });

        // Move x Still/Swap
        const movesToBlock = Object.entries(resolveEvent.robotIdToMove).filter(
          ([robotId, pos]) => {
            const space = vecToSpace(board, pos);
            if (!space || space.type === BATTERY_SPACE_ID) return true;
            const self = getRobot[robotId];
            const other = allRobots.find((r) => posEquals(r.position, pos));
            if (other == null) return false;
            return !Object.entries(resolveEvent.robotIdToMove).some(
              (m) =>
                other.id === Number(m[0]) && !posEquals(self.position, m[1])
            );
          }
        );
        movesToBlock.forEach(([robotId]) => {
          const id = Number(robotId);
          delete resolveEvent.robotIdToMove[id];
          resolveEvent.robotIdsBlocked.add(id);
          valid = false;
        });
      }
      priorityEvents.push({
        ...resolveEvent,
        type: RESOLVE_EVENT_ID,
        robotIdToSpawn: Object.entries(resolveEvent.robotIdToSpawn).flatMap(
          ([k, p]) => [Number(k), p.x, p.y]
        ),
        robotIdToMove: Object.entries(resolveEvent.robotIdToMove).flatMap(
          ([k, p]) => [Number(k), p.x, p.y]
        ),
        robotIdToHealth: Object.entries(resolveEvent.robotIdToHealth).flatMap(
          ([k, v]) => [Number(k), v]
        ),
        robotIdsBlocked: Array.from(resolveEvent.robotIdsBlocked),
        missedAttacks: Array.from(resolveEvent.missedAttacks).flatMap((p) => [
          p.x,
          p.y,
        ]),
      });

      const delayResolved = Object.keys(resolveEvent.robotIdToHealth).filter(
        (h) =>
          Object.keys(resolveEvent.robotIdToMove).some((m) => m === h) ||
          Object.keys(resolveEvent.robotIdsBlocked).some((b) => b === h)
      );
      if (delayResolved.length > 0) {
        const delayedRobotIdToHealth = Object.fromEntries(
          delayResolved.map((robotId) => {
            const id = Number(robotId);
            const health = resolveEvent.robotIdToHealth[id];
            delete resolveEvent.robotIdToHealth[id];
            return [id, health];
          })
        );
        const delayResolveEvent: ResolveEvent = {
          type: RESOLVE_EVENT_ID,
          robotIdToSpawn: [],
          robotIdToMove: [],
          robotIdToHealth: Object.entries(delayedRobotIdToHealth).flatMap(
            ([k, p]) => [Number(k), p]
          ),
          robotIdsBlocked: [],
          missedAttacks: [],
          primaryBatteryCost: 0,
          secondaryBatteryCost: 0,
          priority: p,
          myBatteryHit: false,
          opponentBatteryHit: false,
        };
        priorityEvents.push(delayResolveEvent);
      }
      Object.entries(resolveEvent.robotIdToSpawn).forEach(([id, pos]) => {
        getRobot[id].position = pos;
      });
      Object.entries(resolveEvent.robotIdToMove).forEach(([id, pos]) => {
        getRobot[id].position = pos;
      });
      Object.entries(resolveEvent.robotIdToHealth).forEach(([id, health]) => {
        getRobot[id].health = health;
      });
    }
    Object.entries(robotIdToTurnObject).forEach(
      ([id, obj]) =>
        (obj.isActive = !posEquals(getRobot[id].position, NULL_VEC))
    );

    const processPriorityFinish = (team: Robot[], isPrimary: boolean) => {
      const evts: GameEvent[] = [];
      team.forEach((r) => {
        if (r.health <= 0) {
          (isPrimary ? board.primaryDock : board.secondaryDock).add(r.id);
          r.health = r.startingHealth;
          r.position = NULL_VEC;
          evts.push({
            type: DEATH_EVENT_ID,
            returnHealth: r.startingHealth,
            robotId: r.id,
            primaryBatteryCost: isPrimary ? DEFAULT_DEATH_MULTIPLIER : 0,
            secondaryBatteryCost: isPrimary ? 0 : DEFAULT_DEATH_MULTIPLIER,
            priority: p,
          });
        }
      });
      return evts;
    };
    priorityEvents.push(...processPriorityFinish(primary.team, true));
    priorityEvents.push(...processPriorityFinish(secondary.team, false));

    priorityEvents.forEach((e) => {
      primary.battery -= e.primaryBatteryCost;
      secondary.battery -= e.secondaryBatteryCost;
    });
    events.push(...priorityEvents);
    if (primary.battery <= 0 || secondary.battery <= 0) {
      events.push({
        type: END_EVENT_ID,
        primaryLost: primary.battery <= 0,
        secondaryLost: secondary.battery <= 0,
        primaryBatteryCost: Math.max(primary.battery, 0),
        secondaryBatteryCost: Math.max(secondary.battery, 0),
        priority: p,
        turnCount: turn,
      });
      break;
    }
  }

  game.primary.ready = false;
  game.secondary.ready = false;
  return events;
};
