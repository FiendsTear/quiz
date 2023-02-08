import { z } from "zod";
export const enterGameDTO = z.object({
  gameID: z.number(),
  plyaerID: z.number(),
});
export type EnterGameDTO = z.infer<typeof enterGameDTO>;
