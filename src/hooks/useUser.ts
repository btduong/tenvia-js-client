import { useCallback, useState } from 'react';
import { serviceApi } from '@/api/serviceApi';
import type { Inventory, PowerUpType, User } from '@/types';
import { useMutation } from '@tanstack/react-query';

/**
 * A custom hook that manages the authenticated user's state, inventory, and balance.
 * It provides methods for logging in, purchasing power-ups, and syncing inventory.
 *
 * @returns An object containing user state, loading status, and mutation functions.
 */
export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);

  const loginMutation = useMutation({
    mutationFn: serviceApi.login,
    onSuccess: (authenticatedUser) => setUser(authenticatedUser)
  });

  const purchaseItemMutation = useMutation({
    mutationFn: (itemType: PowerUpType) => {
      if (!user) throw new Error('Not loggegd in');
      return serviceApi.purchasePowerUp(user.id, itemType);
    },
    onSuccess: (updatedUser) => {
      setUser((prev) => (prev ? { ...prev, inventory: updatedUser.inventory } : null));
    },
    onError: (error) => {
      console.log('Purchase failed. Check your balalnce', error.message);
    }
  });

  const login = async (username: string) => {
    loginMutation.mutateAsync(username);
  };

  const purchaseItem = async (itemType: PowerUpType) => {
    try {
      purchaseItemMutation.mutateAsync(itemType);
      return true;
    } catch {
      return false;
    }
  };

  /***
   * Update user's balance.
   */
  const updateBalance = useCallback((newBalance: number) => {
    setUser((prev) => (prev ? { ...prev, balance: newBalance } : null));
  }, []);

  const updateInventory = useCallback((updatedInventory: Inventory) => {
    if (updatedInventory) {
      setUser((prev) => (prev ? { ...prev, inventory: updatedInventory } : null));
    }
  }, []);

  return { user, loading: loginMutation.isPending, login, purchaseItem, updateBalance, updateInventory };
};
