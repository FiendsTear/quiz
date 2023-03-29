import { z } from "zod";
export const addPlayerAnswerDTO = z.object({
  gameID: z.number(),
  answersID: z.array(z.number()),
});
export type AddPlayerAnswerDTO = z.infer<typeof addPlayerAnswerDTO>;
