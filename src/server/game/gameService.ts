import { EventEmitter } from "events";
import { Question, Answer } from "@prisma/client";
import { createGame, GameWithAnswers, getGamesByID } from "./gameRepository";
import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { AddPlayerAnswerDTO } from "./dto.ts/addPlayerAnswerDTO";

enum GameStatus {
  Created,
  Ongoing,
  Finished,
}

enum GameEvents {
  Started = "STARTED",
  PlayerEntered = "PLAYER_ENTERED",
  PlayerAnswered = "PLAYER_ANSWERED",
  QuestionFinished = "QUESTION_FINISHED",
}

type Player = {
  id: string;
  currentAnswerID?: number;
};

type GameState = {
  status: GameStatus;
  currentQuestion: Question & { answers: Answer[] };
  players: Player[];
  playersAnsweredCount: number;
};

interface IActiveGame {
  gameState: GameState;
  gameData: GameWithAnswers;
  emitter: EventEmitter;
}

const activeGames: Map<number, IActiveGame> = new Map();

export async function updateGameState() {}

export async function getActiveGames() {
  const gamesID = [...activeGames.keys()];
  return await getGamesByID(gamesID);
}

export async function getGameState(gameID: number) {
  const game = getGame(gameID);
  return game.gameState;
}

export async function addGame(input: number) {
  const gameData = await createGame(input);
  console.log(gameData.quiz);
  const gameState = {
    status: GameStatus.Created,
    players: [],
    currentQuestion: gameData.quiz.questions[0],
    playersAnsweredCount: 0,
  };
  const activeGame = {
    emitter: new EventEmitter(),
    gameData,
    gameState,
  };
  activeGames.set(gameData.id, activeGame);
  return activeGame;
}

export async function startGame(gameID: number) {
  const game = getGame(gameID);
  game.gameState.status = GameStatus.Ongoing;
  game.emitter.emit(GameEvents.Started, game.gameState);
  return game.gameState;
}

export async function subscribeToGame(gameID: number) {
  const game = getGame(gameID);

  return observable<string>((emit) => {
    const onChange = (data: string) => {
      emit.next(data);
    };
    game.emitter.on(GameEvents.Started, onChange);
    game.emitter.on(GameEvents.PlayerEntered, onChange);
    game.emitter.on(GameEvents.QuestionFinished, onChange);
    return () => {
      game.emitter.off(GameEvents.Started, onChange);
      game.emitter.off(GameEvents.PlayerEntered, onChange);
      game.emitter.off(GameEvents.QuestionFinished, onChange);
    };
  });
}

export async function enterGame(gameID: number, playerID: string) {
  const game = getGame(gameID);
  game.gameState.players.push({ id: playerID });
  game.emitter.emit(GameEvents.PlayerEntered, playerID);
  return game.gameState.players;
}

export async function addPlayerAnswer(
  dto: AddPlayerAnswerDTO,
  playerID: string
) {
  const game = getGame(dto.gameID);
  const player = getPlayer(game?.gameState, playerID);

  player.currentAnswerID = dto.answerID;
  game.emitter.emit(GameEvents.PlayerAnswered, player.id);

  game.gameState.playersAnsweredCount++;
  if (game.gameState.playersAnsweredCount === game.gameState.players.length) {
    finishQuestion(game);
  }
}

function getGame(gameID: number) {
  const game = activeGames.get(gameID);
  if (!game) throw new TRPCError({ code: "BAD_REQUEST" });
  return game;
}

function getPlayer(gameState: GameState, playerID: string) {
  const player = gameState.players.find((player) => (player.id = playerID));
  if (!player) throw new TRPCError({ code: "BAD_REQUEST" });
  return player;
}

function finishQuestion(game: IActiveGame) {
  game.emitter.emit(GameEvents.QuestionFinished, "NEXT QUESTION");
}
