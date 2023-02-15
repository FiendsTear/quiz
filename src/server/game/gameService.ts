import { EventEmitter } from "events";
import type { Question, Answer, User } from "@prisma/client";
import type { GameWithAnswers } from "./gameRepository";
import { createGame, getGamesByID } from "./gameRepository";
import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import type { AddPlayerAnswerDTO } from "./dto.ts/addPlayerAnswerDTO";
import { DefaultSession, Session } from "next-auth";

enum GameStatus {
  Created,
  Ongoing,
  Finished,
}

// enum GameEvents {
//   Started = "STARTED",
//   PlayerEntered = "PLAYER_ENTERED",
//   PlayerAnswered = "PLAYER_ANSWERED",
//   QuestionFinished = "QUESTION_FINISHED",
//   QuestionNext = "QUESTION_NEXT"
// }

enum GameEvents {
  Changed = "CHANGED",
}

type Player = {
  id: string;
  currentAnswerID?: number;
  score: number;
  name: string;
};

type GameState = {
  status: GameStatus;
  currentQuestion: Question & { answers: Answer[] };
  players: Player[];
  playersAnsweredCount: number;
  currentCorrectAnswers: Answer[];
  nextQuestionTimeout: NodeJS.Timeout | null;
};

interface IActiveGame {
  gameState: GameState;
  gameData: GameWithAnswers;
  emitter: EventEmitter;
}

const activeGames: Map<number, IActiveGame> = new Map();

export async function getActiveGames() {
  const availableGamesID: number[] = [];
  activeGames.forEach((game, id) => {
    if (game.gameState.status === GameStatus.Created) availableGamesID.push(id);
  });
  return await getGamesByID(availableGamesID);
}

export function getGameState(gameID: number) {
  const game = getGame(gameID);
  return game.gameState;
}

export async function addGame(input: number) {
  const gameData = await createGame(input);
  const gameState: GameState = {
    status: GameStatus.Created,
    players: [],
    currentQuestion: gameData.quiz.questions[0],
    playersAnsweredCount: 0,
    currentCorrectAnswers: [],
    nextQuestionTimeout: null,
  };
  const activeGame: IActiveGame = {
    emitter: new EventEmitter(),
    gameData,
    gameState,
  };
  activeGames.set(gameData.id, activeGame);
  return activeGame;
}

export function startGame(gameID: number) {
  const game = getGame(gameID);
  game.gameState.status = GameStatus.Ongoing;
  game.emitter.emit(GameEvents.Changed, game.gameState);
  return game.gameState;
}

export function subscribeToGame(gameID: number) {
  const game = getGame(gameID);

  const gameObservable = observable<GameState>((emit) => {
    function onChange(data: GameState) {
      emit.next(data);
    }
    game.emitter.on(GameEvents.Changed, onChange);
    return () => {
      game.emitter.off(GameEvents.Changed, onChange);
    };
  });
  return gameObservable;
}

export function enterGame(gameID: number, player: Session["user"]) {
  const game = getGame(gameID);
  const playerRegistered = game.gameState.players.find(
    (registeredPlayer) => registeredPlayer.id === player.id
  );
  // already registered, just give state in case player refreshed page
  if (playerRegistered) return game.gameState;
  game.gameState.players.push({
    id: player.id,
    score: 0,
    name: player.name as string,
  });
  game.emitter.emit(GameEvents.Changed, game.gameState);
  return game.gameState;
}

export function addPlayerAnswer(dto: AddPlayerAnswerDTO, playerID: string) {
  const game = getGame(dto.gameID);
  const player = getPlayer(game?.gameState, playerID);

  player.currentAnswerID = dto.answerID;
  game.emitter.emit(GameEvents.Changed, game.gameState);

  game.gameState.playersAnsweredCount++;
  if (game.gameState.playersAnsweredCount === game.gameState.players.length) {
    finishQuestion(game);
  }
}

export function leaveGame(gameID: number, playerID: string) {
  const game = getGame(gameID);
  const { players } = game.gameState;
  const playerIndex = players.findIndex((player) => (player.id = playerID));
  players.splice(playerIndex, 1);
}

export function getGame(gameID: number) {
  const game = activeGames.get(gameID);
  if (!game)
    throw new TRPCError({ code: "BAD_REQUEST", message: "Game not found" });
  return game;
}

function getPlayer(gameState: GameState, playerID: string) {
  const player = gameState.players.find((player) => (player.id = playerID));
  if (!player)
    throw new TRPCError({ code: "BAD_REQUEST", message: "Player not found" });
  return player;
}

function finishQuestion(game: IActiveGame) {
  const { gameState, gameData, emitter } = game;
  const questionIndex = gameState.currentQuestion.order;
  const currentQuestion = gameData.quiz.questions[questionIndex];
  const currentCorrectAnswers = currentQuestion.answers.filter(
    (answer) => answer.isCorrect === true
  );
  gameState.currentCorrectAnswers = currentCorrectAnswers;
  emitter.emit(GameEvents.Changed, game.gameState);
  gameState.players.forEach((player) => {
    currentCorrectAnswers.forEach((answer) => {
      if (answer.id === player.currentAnswerID) {
        player.score = player.score + currentQuestion.answerWeight;
      }
    });
  });
  gameState.nextQuestionTimeout = setTimeout(() => {
    nextQuestion(game);
  }, 2000);
}

export function nextQuestion(game: IActiveGame) {
  const { gameState, gameData, emitter } = game;
  const currentQuestionIndex = gameState.currentQuestion.order;
  if (gameState.nextQuestionTimeout) {
    clearTimeout(gameState.nextQuestionTimeout);
    gameState.nextQuestionTimeout = null;
  }

  gameState.currentCorrectAnswers = [];
  gameState.playersAnsweredCount = 0;
  gameState.currentQuestion = gameData.quiz.questions[currentQuestionIndex + 1];
  if (currentQuestionIndex + 1 === gameData.quiz.questions.length) {
    gameState.status = GameStatus.Finished;
    activeGames.delete(gameData.id);
  } else {
    gameState.currentQuestion =
      gameData.quiz.questions[currentQuestionIndex + 1];
  }
  emitter.emit(GameEvents.Changed, gameState);
}
