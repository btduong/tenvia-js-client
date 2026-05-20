import { useCallback, useState } from "react";
import type { Inventory, PowerUpType, User } from "../types";
import { serviceApi } from "../api/serviceApi";
import { useGameContext } from "./GameContext";

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

        const result = await serviceApi.login(username);
        const authenticatedUser = result.data;
        if (authenticatedUser) {
            setUser(authenticatedUser);
            setLoading(false);
        }
        return result;
        
    }, []);

    /**
     * Purchase a PowerUpType.
     */
    const purchaseItem = useCallback(async (itemType: PowerUpType) => {
        if (!user) return false;
        const url = `http://localhost:8080/shop/buy?userId=${user.id}&type=${itemType}`;

        const res = await fetch(url, { method: 'POST' });
        try {
            if (res.ok) {
                const data = await res.json();
                setUser(prev => prev ? { ...prev, inventory: data.inventory } : null);
                return true;
            }

            return false;
        } catch (err) {
            console.log("Purchase ffailed. Check your balalnce", err);
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

    return { user, loading, login, purchaseItem, updateBalance, updateInventory, isAuthenticated: !user };

};