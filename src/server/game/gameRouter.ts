import { observable } from "@trpc/server/observable";
import { EventEmitter } from "events";
import { object, z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { createGame, getGame, getGames, updateGame } from "./gameService";
import { gameDTO } from "./dto/createGameDTO";
import { TRPCError } from "@trpc/server";
import { updateGameDTO } from "./dto/updateGameDTO";
import { Question, Answer, User } from "@prisma/client";

enum GameStatus {
  Created,
  Ongoing,
  Finished,
}

enum GameEvents {
  Started = "STARTED",
  PlayerEntered = "PLAYER_ENTERED",
}

interface IGameState {
  status: GameStatus;
  currentQuestion: Question & { answers: Answer[] };
  participants: string[];
}
interface IGames {
  [key: string]: {
    emitter: EventEmitter;
    gameState: IGameState;
  };
}
const games: IGames = {};

export const gameRouter = createTRPCRouter({
  getGames: protectedProcedure.query(async () => {
    const activeGamesID = Object.keys(games);
    return await getGames(activeGamesID.map(Number));
  }),

  getGame: protectedProcedure.input(z.number()).query(({ input }) => {
    const game = getGame(input);
    return game;
  }),

  // host created a game
  create: protectedProcedure.input(gameDTO).mutation(async ({ input }) => {
    const game = await createGame(input);
    games[game.id] = {
      emitter: new EventEmitter(),
      gameState: {
        status: GameStatus.Created,
        currentQuestion: game.quiz.questions[0],
        participants: [],
      },
    };
    return game;
  }),

  // player entered a game
  enter: protectedProcedure.input(z.number()).mutation(({ ctx, input }) => {
    const game = games[input];
    if (!game) throw new TRPCError({ code: "BAD_REQUEST" });
    game.gameState.participants.push(ctx.session.user.id);
    game.emitter.emit(GameEvents.PlayerEntered, input);
    return "entered";
  }),

  onEnter: protectedProcedure.input(z.number()).subscription(({ input }) => {
    return observable<string>((emit) => {
      const onEnter = (data: string) => {
        emit.next(data);
      };
      games[input].emitter.on(GameEvents.PlayerEntered, onEnter);
      return () => {
        games[input].emitter.off(GameEvents.PlayerEntered, onEnter);
      };
    });
  }),

  // host started a game
  start: protectedProcedure.input(updateGameDTO).mutation(async ({ input }) => {
    const game = games[input.id];
    if (!game) throw new TRPCError({ code: "BAD_REQUEST" });
    game.emitter.emit(GameEvents.Started, game.gameState);
    return await updateGame(input);
  }),

  onStart: protectedProcedure.input(z.number()).subscription(({ input }) => {
    return observable<IGameState>((emit) => {
      const onStart = (data: IGameState) => {
        emit.next(data);
      };
      games[input].emitter.on(GameEvents.Started, onStart);
      return () => {
        games[input].emitter.off(GameEvents.Started, onStart);
      };
    });
  }),
});
