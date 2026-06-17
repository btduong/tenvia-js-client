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

  const isTicking = useGameStore((state) => state.isTicking);
  const sessionData = useGameStore((state) => state.sessionData);

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

  return {
    questionLimit,
    startNewGame,
    onAnswerSent,
    handleAnswerResponse,
    handleGameOver,
  };
};
