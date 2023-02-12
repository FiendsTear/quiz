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

// enum GameEvents {
//   Started = "STARTED",
//   PlayerEntered = "PLAYER_ENTERED",
//   PlayerAnswered = "PLAYER_ANSWERED",
//   QuestionFinished = "QUESTION_FINISHED",
//   QuestionNext = "QUESTION_NEXT"
// }

enum GameEvents {
  Changed = 'CHANGED'
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
  currentCorrectAnswers: Answer[];
};

interface IActiveGame {
  gameState: GameState;
  gameData: GameWithAnswers;
  emitter: EventEmitter;
}

const activeGames: Map<number, IActiveGame> = new Map();

export async function updateGameState() { }

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
  const gameState = {
    status: GameStatus.Created,
    players: [],
    currentQuestion: gameData.quiz.questions[0],
    playersAnsweredCount: 0,
    currentCorrectAnswers: []
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
  game.emitter.emit(GameEvents.Changed, game.gameState);
  return game.gameState;
}

export async function subscribeToGame(gameID: number) {
  const game = getGame(gameID);

  return observable<GameState>((emit) => {
    function onChange(data: GameState) {
      emit.next(data);
    }
    game.emitter.on(GameEvents.Changed, onChange);
    return () => {
      game.emitter.off(GameEvents.Changed, onChange);
    };
  });
}


export async function enterGame(gameID: number, playerID: string) {
  const game = getGame(gameID);
  const playerRegistered = game.gameState.players.findIndex(player => player.id = playerID);
  if (playerRegistered != -1) return 'alreadyRegistered';
  game.gameState.players.push({ id: playerID });
  game.emitter.emit(GameEvents.Changed, game.gameState);
  return game.gameState.players;
}

export async function addPlayerAnswer(
  dto: AddPlayerAnswerDTO,
  playerID: string
) {
  const game = getGame(dto.gameID);
  const player = getPlayer(game?.gameState, playerID);

  player.currentAnswerID = dto.answerID;
  game.emitter.emit(GameEvents.Changed, game.gameState);

  game.gameState.playersAnsweredCount++;
  if (game.gameState.playersAnsweredCount === game.gameState.players.length) {
    finishQuestion(game);
  }
}

export async function leaveGame(gameID: number, playerID: string) {
  const game = getGame(gameID);
  const { players } = game.gameState;
  const playerIndex = players.findIndex((player) => (player.id = playerID));
  players.splice(playerIndex, 1);
}

function getGame(gameID: number) {
  const game = activeGames.get(gameID);
  if (!game) throw new TRPCError({ code: "BAD_REQUEST", message: 'Game not found' });
  return game;
}

function getPlayer(gameState: GameState, playerID: string) {
  const player = gameState.players.find((player) => (player.id = playerID));
  if (!player) throw new TRPCError({ code: "BAD_REQUEST", message: 'Player not found' });
  return player;
}

function getPlayerByGameID(gameID: number, playerID: string) {
  const game = getGame(gameID);
  return getPlayer(game.gameState, playerID);
}

function finishQuestion(game: IActiveGame) {
  const questionIndex = game.gameData.quiz.questions.findIndex(question => question.id === game.gameState.currentQuestion.id);
  const currentQuestion = game.gameData.quiz.questions[questionIndex];
  game.gameState.currentCorrectAnswers = currentQuestion.answers.filter(answer => answer.isCorrect === true);
  game.emitter.emit(GameEvents.Changed, game.gameState);
  setTimeout(() => {
    game.gameState.currentCorrectAnswers = [];
    game.gameState.playersAnsweredCount = 0;
    game.gameState.currentQuestion = game.gameData.quiz.questions[questionIndex + 1];
    game.emitter.emit(GameEvents.Changed, game.gameState);
  }, 2000);
}
