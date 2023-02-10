import { observable } from "@trpc/server/observable";
import { z } from "zod";
import { protectedProcedure, createWSRouter } from "../trpc";
import {
  addGame,
  enterGame,
  getActiveGames,
  getGameState,
  startGame,
  subscribeToGame,
} from "./gameService";

export const gameRouter = createWSRouter({
  getActiveGames: protectedProcedure.query(async ({ ctx }) => {
    return await getActiveGames();
  }),

  getGameState: protectedProcedure.input(z.number()).query(({ input }) => {
    const game = getGameState(input);
    return game;
  }),

  // host created a game
  create: protectedProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      const game = await addGame(input);
      return game.gameData.id;
    }),

  subcribeToGame: protectedProcedure
    .input(z.number())
    .subscription(async ({ input }) => {
      return await subscribeToGame(input);
    }),

  // player entered a game
  enter: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      const playerID = ctx.session.user.id;
      const players = await enterGame(input, playerID);
      return players;
    }),

  // host started a game
  start: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
    return await startGame(input);
  }),
});
