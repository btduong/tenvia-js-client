import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUser } from "./useUser";
import { serviceApi } from "@/api/serviceApi";


vi.mock('../api/serviceApi');

beforeEach(() => {
    vi.resetAllMocks();
});

describe('useUser', () => {

    it('can set default value', () => {
        const { result } = renderHook(() => useUser());
        expect(result.current.user).toBeNull();
    });

    it('can login successfully', async () => {

        const mockUser = {
            id: 1,
            username: 'alice',
            createdAt: 'tday',
            balance: 10,
            inventory: { HAMMER: 1, FIFTY_FIFTY: 0, SWAP_QUESTION: 0 }

        }

        vi.mocked(serviceApi.login).mockResolvedValue({ data: mockUser, error: null });

        const { result } = renderHook(() => useUser());

        let apiServicePromise;
        await act(async () => {
            apiServicePromise = result.current.login('alice');
        });

        expect(result.current.user).not.toBeNull();
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.loading).toBe(false);
    });

    it('expect loading to be false when login failed', async () => {
        vi.mocked(serviceApi.login).mockResolvedValue({ data: null, error: new Error('Network failure') });

        const { result } = renderHook(() => useUser());

        let apiServicePromise
        await act(async () => {
            apiServicePromise = result.current.login('alice');
        });

        expect(result.current.user).toBeNull();
        expect(result.current.loading).toBeFalsy();
    });

    it('logged in user can purchase item', async () => {
        const mockUser = {
            id: 1,
            username: 'alice',
            createdAt: 'today',
            balance: 10,
            inventory: { HAMMER: 0, FIFTY_FIFTY: 0, SWAP_QUESTION: 0 }
        };

        const mockUpdateduser = {
            id: 1,
            username: 'alice',
            createdAt: 'today',
            balance: 10,
            inventory: { HAMMER: 1, FIFTY_FIFTY: 0, SWAP_QUESTION: 0 }
        };

        vi.mocked(serviceApi.login).mockResolvedValue({ data: mockUser, error: null });
        vi.mocked(serviceApi.purchasePowerUp).mockResolvedValue({ data: mockUpdateduser, error: null });

        const { result } = renderHook(() => useUser());

        // login
        let apiServicePromise;
        await act(async () => {
            apiServicePromise = result.current.login('alice');
        });

        expect(result.current.user).not.toBeNull();
        expect(result.current.user).toEqual(mockUser);

        // purchase
        await act(async () => {
            apiServicePromise = result.current.purchaseItem('HAMMER');
        });

        const purchaseResult = await apiServicePromise;
        expect(purchaseResult).toBe(true);
        expect(result.current.user).toEqual(mockUpdateduser);
    });

    it('expect error when unauthenticated user to try to purchase item', async () => {

        const { result } = renderHook(() => useUser());
        expect(result.current.user).toBeNull();

        let apiServicePromise;
        await act(async () => {
            apiServicePromise = result.current.purchaseItem('HAMMER');
        });

        const purchaseResult = await apiServicePromise;
        expect(purchaseResult).toBe(false);
        expect(serviceApi.login).not.toHaveBeenCalled();
    });

});