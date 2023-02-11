import { z } from "zod";
import { createWSRouter, protectedWSProcedure } from "../trpc";
import { addPlayerAnswerDTO } from "./dto.ts/addPlayerAnswerDTO";
import {
  addGame,
  addPlayerAnswer,
  enterGame,
  getActiveGames,
  getGameState,
  leaveGame,
  startGame,
  subscribeToGame,
} from "./gameService";

export const gameRouter = createWSRouter({
  getActiveGames: protectedWSProcedure.query(async ({ ctx }) => {
    return await getActiveGames();
  }),

  getGameState: protectedWSProcedure.input(z.number()).query(({ input }) => {
    const game = getGameState(input);
    return game;
  }),

  // host created a game
  create: protectedWSProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      const game = await addGame(input);
      return game.gameData.id;
    }),

  subcribeToGame: protectedWSProcedure
    .input(z.number())
    .subscription(async ({ input }) => {
      return await subscribeToGame(input);
    }),

  // player entered a game
  enter: protectedWSProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      const playerID = ctx.session.user.id;
      const players = await enterGame(input, playerID);
      ctx.req?.socket.on('close', () => leaveGame(input, playerID));
      return players;
    }),

  // host started a game
  start: protectedWSProcedure.input(z.number()).mutation(async ({ input }) => {
    return await startGame(input);
  }),

  answer: protectedWSProcedure
    .input(addPlayerAnswerDTO)
    .mutation(async ({ input, ctx }) => {
      return await addPlayerAnswer(input, ctx.session.user.id);
    }),

  disconnect: protectedWSProcedure.mutation(() => {
    console.log('disconnect');
  })
});
