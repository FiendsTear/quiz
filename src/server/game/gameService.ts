import { EventEmitter } from "events";
import type { Question, Answer } from "@prisma/client";
import type { GameWithAnswers } from "./gameRepository";
import { createGame, getGamesByID } from "./gameRepository";
import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import type { AddPlayerAnswerDTO } from "./dto.ts/addPlayerAnswerDTO";
import type { Session } from "next-auth";
import type { CreateGameDTO } from "./dto.ts/createGameDTO";
import { customAlphabet } from "nanoid";
import type { EnterGameDTO } from "./dto.ts/enterGameDTO";
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
  currentAnswersID?: number[];
  score: number;
  name: string;
  image?: string | null;
};

type GameState = {
  status: GameStatus;
  currentQuestion: Question & {
    answers: Answer[];
    timerValue: number;
    hasMultipleCorrectAnswers: boolean;
  };
  players: Player[];
  playersAnsweredCount: number;
  currentCorrectAnswers: Answer[];
  correctAnswerTimeout: NodeJS.Timeout | null;
  isPrivate: boolean;
  accessCode: string | null;
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
    if (
      game.gameState.status === GameStatus.Created &&
      !game.gameState.isPrivate
    )
      availableGamesID.push(id);
  });
  return await getGamesByID(availableGamesID);
}

export function getGameState(gameID: number) {
  const game = getGame(gameID);
  return game.gameState;
}

export async function addGame(input: CreateGameDTO) {
  const gameData = await createGame(input.quizID);
  let accessCode = null;
  if (input.isPrivate) {
    const nanoid = customAlphabet("0123456789ABCDEFGHJKLMNPQRSTUVWXYZ", 5);
    accessCode = nanoid();
  }
  const gameState: GameState = {
    status: GameStatus.Created,
    players: [],
    currentQuestion: {
      ...gameData.quiz.questions[0],
      ...{ timerValue: 15 },
      ...{
        hasMultipleCorrectAnswers: calcMultiCorrectAnswers(
          gameData.quiz.questions[0].answers
        ),
      },
    },
    playersAnsweredCount: 0,
    currentCorrectAnswers: [],
    correctAnswerTimeout: null,
    isPrivate: input.isPrivate,
    accessCode,
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
  emitState(game);
  return game.gameState;
}

function calcMultiCorrectAnswers(answers: Answer[]) {
  let count = 0;
  for (let i = 0; i < answers.length; i++) {
    if (answers[i].isCorrect) count++;
  }
  return count > 1 ? true : false;
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

export function enterGame(input: EnterGameDTO, player: Session["user"]) {
  const game = getGame(input.gameID);
  if (game.gameState.isPrivate) {
    if (input.accessCode != game.gameState.accessCode)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Wrong acccess code",
      });
  }
  const playerRegistered = game.gameState.players.find(
    (registeredPlayer) => registeredPlayer.id === player.id
  );
  // already registered, just give state in case player refreshed page
  if (playerRegistered) return game.gameState;
  game.gameState.players.push({
    id: player.id,
    score: 0,
    name: player.name as string,
    image: player.image,
  });
  emitState(game);
  return game.gameState;
}

export function addPlayerAnswer(dto: AddPlayerAnswerDTO, playerID: string) {
  const game = getGame(dto.gameID);
  const player = getPlayer(game?.gameState, playerID);

  player.currentAnswersID = dto.answersID;
  emitState(game);

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
  const { gameState, gameData } = game;
  const questionIndex = gameState.currentQuestion.order;
  const currentQuestion = gameData.quiz.questions[questionIndex];
  const currentCorrectAnswers = currentQuestion.answers.filter(
    (answer) => answer.isCorrect === true
  );
  gameState.currentCorrectAnswers = currentCorrectAnswers;

  gameState.players.forEach((player) => {
    currentCorrectAnswers.forEach((answer) => {
      if (player.currentAnswersID?.includes(answer.id)) {
        player.score = player.score + currentQuestion.answerWeight;
      }
    });
  });

  emitState(game);

  gameState.correctAnswerTimeout = setTimeout(() => {
    nextQuestion(game);
  }, 2000);
}

export function nextQuestion(game: IActiveGame) {
  const { gameState, gameData } = game;
  const currentQuestionIndex = gameState.currentQuestion.order;
  if (gameState.correctAnswerTimeout) {
    clearTimeout(gameState.correctAnswerTimeout);
    gameState.correctAnswerTimeout = null;
  }

  gameState.currentCorrectAnswers = [];
  gameState.playersAnsweredCount = 0;
  if (currentQuestionIndex + 1 >= gameData.quiz.questions.length) {
    gameState.status = GameStatus.Finished;
    activeGames.delete(gameData.id);
  } else {
    gameState.currentQuestion = {
      ...gameData.quiz.questions[currentQuestionIndex + 1],
      ...{ timerValue: 15 },
      ...{
        hasMultipleCorrectAnswers: calcMultiCorrectAnswers(
          gameData.quiz.questions[currentQuestionIndex + 1].answers
        ),
      },
    };
  }
  emitState(game);
}

function emitState(game: IActiveGame) {
  const { emitter, gameState } = game;
  const cloneGameState: Partial<GameState> = Object.assign({}, gameState);
  delete cloneGameState.playersAnsweredCount;
  delete cloneGameState.correctAnswerTimeout;
  emitter.emit(GameEvents.Changed, cloneGameState);
}
