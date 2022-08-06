import createAPIGatewayProxyHandler from "@dvargas92495/app/backend/createAPIGatewayProxyHandler.server";
import createGame from "~/data/createGame.server";

export const handler = createAPIGatewayProxyHandler(createGame);
