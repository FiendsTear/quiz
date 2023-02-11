import { z } from "zod";
export const addPlayerAnswerDTO = z.object({
  gameID: z.number(),
  answerID: z.number(),
});
export type AddPlayerAnswerDTO = z.infer<typeof addPlayerAnswerDTO>;
