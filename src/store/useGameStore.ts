import { GameStatus, type GameSession, type Question } from '@/types';
import {create } from 'zustand';

interface GameSessionState {
  gameStatus: GameStatus;
  currentQuestion: Question | null;
  sessionData: GameSession | null;
  answerSent: boolean;
  globalErrorMessage: string;
  isTicking: boolean;

  setGameStatus: (status: GameStatus) => void;
  setCurrentQuestion: (question: Question | null) => void;
  setSessionData: (session: GameSession | null) => void;
  setAnswerSent: (sent: boolean) => void;
  setGlobalErrorMessage: (message: string) => void;
  setIsTicking: (ticking: boolean) => void;
}

export const useGameStore = create<GameSessionState>()((set) => ({
  gameStatus: GameStatus.IDLE,
  currentQuestion: null,
  sessionData: null,
  answerSent: false,
  globalErrorMessage: '',
  isTicking: false,

  setGameStatus: (status) => set({gameStatus: status}),
  setCurrentQuestion: (question) => set({currentQuestion: question}),
  setSessionData: (session) => set({sessionData: session}),
  setAnswerSent: (sent) => set({answerSent: sent}),
  setGlobalErrorMessage: (message) => set({globalErrorMessage: message}),
  setIsTicking: (ticking) => set({isTicking: ticking}),
}));