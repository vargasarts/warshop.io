import { Map } from "./map";
import { WebSocket } from "ws";

type Player = {
  joined: boolean;
  ws: WebSocket;
  name: string;
  ready: boolean;
};

export type Game = {
  gameSessionId?: string;
  board?: Map;
  primary?: Player;
  secondary?: Player;
  turn?: number;
};

export const joinGame = (props: {
  game: Game;
  name: string;
  robots: unknown[];
  ws: WebSocket;
}): Game => {
  return props.game;
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
