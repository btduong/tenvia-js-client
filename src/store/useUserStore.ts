import type { Inventory, User } from "@/types";
import { create } from "zustand";

interface UserState {
  user: User | null;
  setUser: (use: User | null) => void;
  updateBalance: (value: number) => void;
  updateInventory: (updatedInventory: Inventory) => void;
}

/**
 * Store for {@link User} data.
 */
export const useUserStore = create<UserState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  updateBalance: (value) => set((state) => (
    state.user ? { user: { ...state.user, balance: value } } : {}
  )),
  updateInventory: (updatedInventory) => set((state) => (
    state.user ? { user: { ...state.user, inventory: updatedInventory } } : {}
  )),
}));