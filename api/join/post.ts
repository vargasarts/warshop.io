import createAPIGatewayProxyHandler from "aws-sdk-plus/dist/createAPIGatewayProxyHandler";
import joinGame from "../../app/data/joinGame.server";

export const handler = createAPIGatewayProxyHandler(joinGame);
