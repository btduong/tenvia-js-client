import { serviceApi } from '@/api/serviceApi';
import { useUserStore } from '@/store/useUserStore';
import type { Inventory, PowerUpType } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useUserLoginMutation, useUserPurchaseMutation } from './useUserMutation';

/**
 * A custom hook that manages the authenticated user's state, inventory, and balance.
 * It provides methods for logging in, purchasing power-ups, and syncing inventory.
 *
 * @returns An object containing user state, loading status, and mutation functions.
 */
export const useUser = () => {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const updateBalance = useUserStore((state) => state.updateBalance);
  const updateInventory = useUserStore((state) => state.updateInventory);

  const loginMutation = useUserLoginMutation();
  const purchaseItemMutation = useUserPurchaseMutation();

  const login = async (username: string) => {
    return await loginMutation.mutateAsync(username);
  };

  const purchaseItem = async (itemType: PowerUpType) => {
    if (!user) return false;

    try {
      await purchaseItemMutation.mutateAsync({ itemType, userId: user.id });
      return true;
    } catch {
      return false;
    }
  };

  return { user, loading: loginMutation.isPending, login, purchaseItem, updateBalance, updateInventory };
};
