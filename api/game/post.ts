import createAPIGatewayProxyHandler from "aws-sdk-plus/dist/createAPIGatewayProxyHandler";
import createGame from "../../app/data/createGame.server";

export const handler = createAPIGatewayProxyHandler(createGame);
