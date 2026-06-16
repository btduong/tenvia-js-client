import { useGameStore } from '@/store/useGameStore';
import type { AnswerResponse, Inventory, PowerUpType, UsePowerUpResponse, User } from '@/types';
import { GameStatus } from '@/types';
import { useRef } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { useTickingSound } from './useTickingSound';
import { useStartSessionMutation, useNextQuestionMutation, useTimeoutMutation, usePowerUpMutation } from './useGameMutations';

export const useGameSession = (
  user: User | null,
  updateInventory: (inventory: Inventory) => void,
  navigate: NavigateFunction
) => {
  const questionLimit = useRef<number>(10);

  const setGameStatus = useGameStore((state) => state.setGameStatus);
  const setSessionData = useGameStore((state) => state.setSessionData);
  const setAnswerSent = useGameStore((state) => state.setAnswerSent);
  const setIsTicking = useGameStore((state) => state.setIsTicking);
  const setCurrentQuestion = useGameStore((state) => state.setCurrentQuestion);
  const setGlobalUserMessage = useGameStore((state) => state.setGlobalErrorMessage);
  
  const gameStatus = useGameStore((state) => state.gameStatus);
  const isTicking = useGameStore((state) => state.isTicking);
  const sessionData = useGameStore((state) => state.sessionData);
  const currentQuestion = useGameStore((state) => state.currentQuestion);
  const answerSent = useGameStore((state) => state.answerSent);
  const globalErrorMessage = useGameStore((state) => state.globalErrorMessage);

  useTickingSound(isTicking);

  const nextQuestionMutation = useNextQuestionMutation();
  const getNextQuestion = async (sessionId: string) => {
    nextQuestionMutation.mutate(sessionId);
  };

  const newSessionMutation = useStartSessionMutation(navigate, getNextQuestion);

  const startNewGame = async (questions: number) => {
    if (!user) return;
    questionLimit.current = questions;
    newSessionMutation.mutate({ userId: user.id, questions });
  };

  const onAnswerSent = () => {
    setGameStatus(GameStatus.VALIDATING_ANSWER);
    setAnswerSent(true);
    setIsTicking(false);
  };

  const handleGameOver = () => {
    setGameStatus(GameStatus.GAME_OVER);
    setCurrentQuestion(null);
    setSessionData(null);
    setIsTicking(false);
  };

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

  const timeoutMutation = useTimeoutMutation(handleAnswerResponse);

  const onQuestionTimedout = async () => {
    setIsTicking(false);
    if (sessionData?.id) {
      timeoutMutation.mutate(sessionData.id);
    }
  };

  const powerUpMutation = usePowerUpMutation(updateInventory);

  const handleUsePowerUp = async (type: PowerUpType): Promise<UsePowerUpResponse | null> => {
    if (!user || !sessionData || !sessionData.id) return null;
    try {
      return await powerUpMutation.mutateAsync({ type, userId: user.id, sessionId: sessionData.id });
    } catch {
      return null;
    }
  };

  const triggerGlobalError = (message: string) => {
    setGameStatus(GameStatus.ERROR);
    setGlobalUserMessage(message);
  };

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
