import { useCallback, useState } from "react";
import { serviceApi } from "../api/serviceApi";
import type { Inventory, PowerUpType, User } from "../types";

/**
 * A custom hook that manages the authenticated user's state, inventory, and balance.
 * It provides methods for logging in, purchasing power-ups, and syncing inventory.
 * 
 * @returns An object containing user state, loading status, and mutation functions.
 */
export const useUser = () => {

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    /**
     * Login before starting any game session.
     * 
     * useCallback here to cache the function def between re-renders.
     */
    const login = useCallback(async (username: string) => {
        setLoading(true);

        try {
            const result = await serviceApi.login(username);
            const authenticatedUser = result.data;
            if (authenticatedUser) {
                setUser(authenticatedUser);
            }
            return result;
        } finally {
            setLoading(false);
        }

    }, []);

    /**
     * Purchase a PowerUpType.
     */
    const purchaseItem = useCallback(async (itemType: PowerUpType) => {
        if (!user) return false;

        const { data : updatedUser, error } = await serviceApi.purchasePowerUp(user.id, itemType);
        if (updatedUser) {
            setUser(prev => prev ? { ...prev, inventory: updatedUser.inventory } : null);
            return true
        } else {
            console.log("Purchase failed. Check your balalnce", error.message);
            return false;
        }

    }, [user]);

    /***
     * Update user's balance.
     */
    const updateBalance = useCallback((newBalance: number) => {
        setUser(prev => prev ? { ...prev, balance: newBalance } : null);
    }, []);

    const updateInventory = useCallback((updatedInventory: Inventory) => {
        if (updatedInventory) {
            setUser(prev => prev ? { ...prev, inventory: updatedInventory } : null);
        }
    }, []);

    return { user, loading, login, purchaseItem, updateBalance, updateInventory };

};