import { z } from "zod";
export const gameDTO = z.object({
  quizID: z.number(),
});
export type GameDTO = z.infer<typeof gameDTO>;
