import { z } from "zod";
export const createUserDTO = z.object({
  username: z.string(),
  password: z.string(),
});
export type CreateUserDTO = z.infer<typeof createUserDTO>;
