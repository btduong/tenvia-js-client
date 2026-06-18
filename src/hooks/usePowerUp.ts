import type { GameSession, Inventory, PowerUpType, UsePowerUpResponse, User } from "@/types";
import { usePowerUpMutation } from "./useGameMutations";
import { useGameStore } from "@/store/useGameStore";

export const usePowerUp = (user: User | null, updateInventory: (inventory: Inventory) => void) => {

  const sessionData = useGameStore((state) => state.sessionData);

  const powerUpMutation = usePowerUpMutation(updateInventory);

  const handleUsePowerUp = async (type: PowerUpType): Promise<UsePowerUpResponse | null> => {
    if (!user || !sessionData || !sessionData.id) return null;
    try {
      return await powerUpMutation.mutateAsync({ type, userId: user.id, sessionId: sessionData.id });
    } catch {
      return null;
    }
  };
  return { handleUsePowerUp };
};