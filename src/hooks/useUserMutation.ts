import { serviceApi } from "@/api/serviceApi";
import { useUserStore } from "@/store/useUserStore";
import type { PowerUpType, User } from "@/types";
import { useMutation } from "@tanstack/react-query";


/**
 * A mutation for logging user in.
 * @returns an authenticated user
 */
export const useUserLoginMutation = () => {
  const setUser = useUserStore((state) => state.setUser);

  return useMutation({
    mutationFn: serviceApi.login,
    onSuccess: (loginResponse) => {
      localStorage.setItem('jwt_token', loginResponse.jwt);
      setUser(loginResponse.userDTO);
    }
  });
};

/**
 * A mutation for purchasing an item.
 * @returns a user with updated inventory
 */
export const useUserPurchaseMutation = () => {
  const updatedInventory = useUserStore((state) => state.updateInventory);
  return useMutation({
    mutationFn: ({ itemType, userId }: { itemType: PowerUpType, userId: number }) => {
      return serviceApi.purchasePowerUp(userId, itemType);
    },
    onSuccess: (updatedUser) => {
      updatedInventory(updatedUser.inventory);
    },
    onError: (error) => {
      console.log('Purchase failed. Check your balalnce', error.message);
    }
  });
};
