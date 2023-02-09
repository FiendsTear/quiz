import { z } from "zod";
import { GameStatus } from "@prisma/client";
export const updateGameDTO = z.object({
  id: z.number(),
  status: z.nativeEnum(GameStatus),
});
export type UpdateGameDTO = z.infer<typeof updateGameDTO>;
