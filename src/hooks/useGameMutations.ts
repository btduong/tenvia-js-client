import { serviceApi } from "@/api/serviceApi";
import { useGameStore } from "@/store/useGameStore";
import type { AnswerResponse, Inventory, PowerUpType } from "@/types";
import { GameStatus } from "@/types";
import { useMutation } from "@tanstack/react-query";
import type { NavigateFunction } from "react-router-dom";

export const useNextQuestionMutation = () => {
  const triggerGlobalError = useGameStore((state) => state.setGlobalErrorMessage);
  const setIsTicking = useGameStore((state) => state.setIsTicking);
  const setCurrentQuestion = useGameStore((state) => state.setCurrentQuestion);
  const setGameStatus = useGameStore((state) => state.setGameStatus);
  const setAnswerSent = useGameStore((state) => state.setAnswerSent);

  return useMutation({
    mutationFn: serviceApi.getQuestion,
    onSuccess: (question) => {
      setCurrentQuestion(question);
      setGameStatus(GameStatus.PLAYING);
      setAnswerSent(false);
      setIsTicking(true);
    },
    onError: (error: Error) => {
      triggerGlobalError(error.message);
    }
  });
};

export const useStartSessionMutation = (navigate: NavigateFunction, getNextQuestion: (sessionId: string) => void) => {
  const triggerGlobalError = useGameStore((state) => state.setGlobalErrorMessage);
  const setSessionData = useGameStore((state) => state.setSessionData);
  const setGameStatus = useGameStore((state) => state.setGameStatus);

  return useMutation({
    mutationFn: ({ userId, questions }: { userId: number, questions: number }) => {
      return serviceApi.getNewSession(userId, questions)
    },
    onSuccess: (gameSession) => {
      setSessionData(gameSession)
      if (gameSession?.id) {
        setGameStatus(GameStatus.FETCHING_QUESTION);
        getNextQuestion(gameSession.id);
        navigate('/quiz');
      }
    },
    onError: (error: Error) => {
      triggerGlobalError(error.message);
    },
  });
};

export const useTimeoutMutation = (handleAnswerResponse: (response: AnswerResponse) => void) => {
  return useMutation({
    mutationFn: (sessionId: string) => {
      return serviceApi.validateSelectedAnswer(sessionId, null);
    },
    onSuccess: (answerResponse) => {
      handleAnswerResponse(answerResponse);
    }
  });
};

export const usePowerUpMutation = (updateInventory: (inventory: Inventory) => void) => {
  const setGameStatus = useGameStore((state) => state.setGameStatus);
  const setCurrentQuestion = useGameStore((state) => state.setCurrentQuestion);

  return useMutation({
    mutationFn: ({ type, userId, sessionId }: { type: PowerUpType, userId: number, sessionId: string }) => {
      return serviceApi.usePowerUp(type, userId, sessionId);
    },
    onSuccess: (powerUpResponse) => {
      updateInventory(powerUpResponse.updatedUser.inventory);
      setCurrentQuestion(powerUpResponse.effectResult.questionResponse);
    },
    onError: (error: Error) => setGameStatus(GameStatus.ERROR)
  });
};
