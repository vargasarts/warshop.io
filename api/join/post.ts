import createAPIGatewayProxyHandler from "@dvargas92495/app/backend/createAPIGatewayProxyHandler.server";
import joinGame from "~/data/joinGame.server";

export const handler = createAPIGatewayProxyHandler(joinGame);
