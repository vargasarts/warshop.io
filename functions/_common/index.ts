import AWS from "aws-sdk";

const options =
  process.env.NODE_ENV === "development"
    ? {
        endpoint: "http://localhost:9080",
      }
    : {};

export const gamelift = new AWS.GameLift(options);
