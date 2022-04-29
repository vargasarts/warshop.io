import createAPIGatewayProxyHandler from "aws-sdk-plus/dist/createAPIGatewayProxyHandler";
import getGames from "../../app/data/getGames.server";

export const handler = createAPIGatewayProxyHandler(getGames);
