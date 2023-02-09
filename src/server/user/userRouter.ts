import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../trpc";
import { addUser } from "./services/userService";
// export const userRouter = createTRPCRouter({
//   addUser: protectedProcedure.input().mutation(({ input }) => addUser()),
// });
// export type definition of API
