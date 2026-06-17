import { useGameStore } from "@/store/useGameStore";
import { GameStatus } from "@/types";

export const useGameSessionErrors = () => {
  const setGameStatus = useGameStore((state) => state.setGameStatus);
  const setGlobalUserMessage = useGameStore((state) => state.setGlobalErrorMessage);
  const setCurrentQuestion = useGameStore((state) => state.setCurrentQuestion);
  const setSessionData = useGameStore((state) => state.setSessionData);

  const triggerGlobalError = (message: string) => {
    setGameStatus(GameStatus.ERROR);
    setGlobalUserMessage(message);
  };

  const handleClearError = () => {
    setGameStatus(GameStatus.IDLE);
    setCurrentQuestion(null);
    setSessionData(null);
    setGlobalUserMessage('');
  };

  return { triggerGlobalError, handleClearError };
}

