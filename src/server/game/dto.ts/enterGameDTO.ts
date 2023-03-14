import { z } from "zod";
export const enterGameDTO = z.object({
  gameID: z.number(),
  accessCode: z.string().optional(),
});
export type EnterGameDTO = z.infer<typeof enterGameDTO>;
