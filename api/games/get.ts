import createAPIGatewayProxyHandler from "@dvargas92495/app/backend/createAPIGatewayProxyHandler.server";
import getGames from "~/data/getGames.server";

export const handler = createAPIGatewayProxyHandler(getGames);
