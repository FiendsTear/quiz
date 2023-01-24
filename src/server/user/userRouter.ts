import { z } from "zod";
import { procedure, router } from "../trpc";
import { addUser } from "./services/userService";
export const userRouter = router({
  addUser: procedure.input(z.string()).mutation(({ input }) => addUser()),
});
// export type definition of API
