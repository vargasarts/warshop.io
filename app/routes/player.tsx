import React, { useState } from "react";
import { Outlet } from "@remix-run/react";
import WsContext from "../contexts/WsContext";

const PlayerPage = () => {
  const [ws, setWs] = useState<WebSocket>();
  return (
    <WsContext.Provider value={{ ws, setWs }}>
      <Outlet />
    </WsContext.Provider>
  );
};

export default PlayerPage;
