import { z } from "zod";
export const createGameDTO = z.object({
  quizID: z.number(),
  isPrivate: z.boolean().default(false),
});
export type CreateGameDTO = z.infer<typeof createGameDTO>;
