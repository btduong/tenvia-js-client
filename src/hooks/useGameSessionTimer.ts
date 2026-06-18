import { useGameStore } from "@/store/useGameStore";
import { useTimeoutMutation } from "./useGameMutations";
import type { AnswerResponse } from "@/types";

export const useGameSessionTimer = (handleAnswerResponse: (response: AnswerResponse) => void) => {

  const setIsTicking = useGameStore((state) => state.setIsTicking);
  const sessionData = useGameStore((state) => state.sessionData);

  const timeoutMutation = useTimeoutMutation(handleAnswerResponse);


  const onQuestionTimedout = async () => {
    setIsTicking(false);
    if (sessionData?.id) {
      timeoutMutation.mutate(sessionData.id);
    }
  };

  return { onQuestionTimedout };
};