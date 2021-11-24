import { Map } from "./map";
import { WebSocket } from "ws";

type Position = {
  x: number;
  y: number;
}

type Robot = {
  id: number,
  position: Position;
}

type Player = {
  joined: boolean;
  ws: WebSocket;
  name: string;
  ready: boolean;
  team: Robot[];
};

export type Game = {
  healthChecks: number;
  gameSessionId: string;
  board: Map;
  nextRobotId: 0;
  primary?: Player;
  secondary?: Player;
  turn?: number;
};

export const storeCommands = (p: Player, commands: unknown[]): void => {
  console.log(p, commands);
};

export const commandsToEvents = (game: Game): unknown[] => [game];

export const flipEvent = (event: unknown): unknown => event;

export const flip = (props: { events: unknown[] }): { events: unknown[] } =>
  ({
      ...props,
      events: props.events.map(e => flipEvent(e)),
  });
