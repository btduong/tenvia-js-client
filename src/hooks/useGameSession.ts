import { useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { serviceApi } from '@/api/serviceApi';
import type {
  AnswerResponse,
  GameSession,
  Inventory,
  PowerUpType,
  Question,
  UsePowerUpResponse,
  User,
} from '@/types';
import { GameStatus } from '@/types';
import { waitFor } from '@/utils/timer';
import { useTickingSound } from './useTickingSound';

/**
 * A custom hook that encapsulates the states and logic of a game session. It manages the current question, the user's progress,
 * and handles server interactions for validation and power-ups.
 *
 * @param user - The currently authenticated User object, or null.
 * @param updateInventory - Callback to synchronize inventory changes up to the user state.
 * @param navigate - React Router navigation function for redirects.
 * @returns An object containing the session state variables and all game loop handlers.
 */
export const useGameSession = (
  user: User | null,
  updateInventory: (inventory: Inventory) => void,
  navigate: NavigateFunction
) => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionLimit, setQuestionLimit] = useState<number>(10); // How many questions per game
  const [sessionData, setSessionData] = useState<GameSession | null>(null);
  const [answerSent, setAnswerSent] = useState<boolean>(false);
  const [globalErrorMessage, setGlobalUserMessage] = useState<string>('');
  const [isTicking, setIsTicking] = useState(false);
  useTickingSound(isTicking);

  /**
   * Start a new game session for a logged in user
   * @returns a new GameSession
   */
  const startNewGame = async () => {
    if (!user) return;

    // Rename 'data' to 'gameSession' during destructuring
    const { data: gameSession, error } = await serviceApi.getNewSession(user.id, questionLimit);

    if (gameSession) {
      setSessionData(gameSession);
      if (gameSession?.id) {
        setGameStatus(GameStatus.FETCHING_QUESTION);
        getNextQuestion(gameSession.id);
        navigate('/quiz');
      }
    } else {
      triggerGlobalError(error.message);
    }
  };

  /**
   * Called when an answer is submitted.
   * This also stops any looping sounds.
   */
  const onAnswerSent = () => {
    setGameStatus(GameStatus.VALIDATING_ANSWER);
    setAnswerSent(true);
    setIsTicking(false);
  };

  /**
   * Get the next question.
   * @param sessionId
   */
  const getNextQuestion = async (sessionId: string) => {
    const { data: question, error } = await serviceApi.getQuestion(sessionId);
    if (question) {
      await waitFor(500);
      setCurrentQuestion(question);
      setGameStatus(GameStatus.PLAYING);
      setAnswerSent(false);
      setIsTicking(true);
    } else {
      triggerGlobalError(error.message);
    }
  };

  /**
   * Reset the game state when the current game session is finished.
   */
  const handleGameOver = () => {
    setGameStatus(GameStatus.GAME_OVER);
    setCurrentQuestion(null);
    setSessionData(null);
    setIsTicking(false);
  };

  /**
   * Handles a received response after submitted an answer.
   * This needs to fetch the next question.
   * @param answerResponse
   */
  const handleAnswerResponse = (answerResponse: AnswerResponse) => {
    if (!answerResponse.isGameOver && sessionData?.id) {
      if (answerResponse.updatedInventory) {
        updateInventory(answerResponse.updatedInventory);
      }
      setGameStatus(GameStatus.FETCHING_QUESTION);
      getNextQuestion(sessionData.id);
    } else {
      navigate('/summary', { state: { sessionSummary: answerResponse.summary } });
      handleGameOver();
    }
  };

  /**
   * When a question is timed out, a validate request with null option Id is sent to the server
   * to indicate that the current question was skipped.
   */
  const onQuestionTimedout = async () => {
    setIsTicking(false);

    if (sessionData?.id) {
      const { data: answerResponse, error } = await serviceApi.validateSelectedAnswer(
        sessionData.id,
        null
      );
      if (answerResponse) {
        handleAnswerResponse(answerResponse);
      }
    }
  };

  const handleUsePowerUp = async (type: PowerUpType): Promise<UsePowerUpResponse | null> => {
    if (!user || !sessionData || !sessionData.id) return null;

    const { data: powerUpResponse, error } = await serviceApi.usePowerUp(
      type,
      user.id,
      sessionData.id
    );

    if (powerUpResponse) {
      updateInventory(powerUpResponse.updatedUser.inventory); // This triggers a re-render of QuizCard with the new count
      setCurrentQuestion(powerUpResponse.effectResult.questionResponse);
    } else {
      setGameStatus(GameStatus.ERROR);
    }
    return powerUpResponse;
  };

  const triggerGlobalError = (message: string) => {
    setGameStatus(GameStatus.ERROR);
    setGlobalUserMessage(message);
  };

  /**
   * Handles any unrecoverable errors that force the game session to finish.
   * This automtically reset the game state and move the player back to the main page.
   */
  const handleClearError = () => {
    setGameStatus(GameStatus.IDLE);
    setCurrentQuestion(null);
    setSessionData(null);
    setGlobalUserMessage('');
    navigate('/');
  };

  return {
    gameStatus,
    setGameStatus,
    currentQuestion,
    sessionData,
    answerSent,
    questionLimit,
    globalErrorMessage,
    startNewGame,
    onAnswerSent,
    handleAnswerResponse,
    onQuestionTimedout,
    handleUsePowerUp,
    triggerGlobalError,
    handleClearError,
    handleGameOver,
  };
};
