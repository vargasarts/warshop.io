import { z } from "zod";

const robotInstance = z.object({
  uuid: z.string().uuid().describe("primary"),
  address: z.string().max(64).describe("unique"),
  network: z.number().describe("unique"),
  version: z.string().max(17),
  userId: z.string().max(32),
  modelUuid: z.string().uuid(),
});

const schema = { robotInstance };

export default schema;
