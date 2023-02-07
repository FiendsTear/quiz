import { z } from "zod";
import { publicProcedure, createTRPCRouter } from "../trpc";
import { addUser } from "./services/userService";
// export const userRouter = createTRPCRouter({
//   addUser: publicProcedure.input().mutation(({ input }) => addUser()),
// });
// export type definition of API
