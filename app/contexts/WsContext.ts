import { createContext } from "react";

export default createContext<{
  ws?: WebSocket;
  setWs: (ws: WebSocket) => void;
}>({ ws: undefined, setWs: () => undefined });
