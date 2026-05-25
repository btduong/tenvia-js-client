import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useUser } from "./useUser";
import { serviceApi } from "../api/serviceApi";


vi.mock('../api/serviceApi');

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


});