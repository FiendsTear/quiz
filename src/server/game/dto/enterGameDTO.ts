import { z } from "zod";
export const enterGameDTO = z.object({
  gameID: z.number(),
  playerID: z.number(),
});
export type EnterGameDTO = z.infer<typeof enterGameDTO>;
