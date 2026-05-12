import { test, vi, it, expect, afterEach, describe } from "vitest";
import { serviceApi } from "../api/serviceApi";

const sessionId = '123';
const userId = 1;

afterEach(() => {
    vi.resetAllMocks();
});

describe('serviceApi getNewSession', () => {

    const questionLimit = 10;

    it('can get new session', async () => {
        const mockSession = { id: 'session_123', questions: [] };

        const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockSession });
        vi.stubGlobal('fetch', mockFetch);

        const { data: gameSession, error } = await serviceApi.getNewSession(userId, questionLimit);

        expect(gameSession).toBe(mockSession);
        expect(error).toBeNull();
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining(`/sessions/start?id=${userId}&limit=${questionLimit}`),
            expect.objectContaining({ method: 'POST' })
        );
    });

    it('expect error when response is not 200', async () => {

        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            statusText: '404',
            json: vi.fn().mockResolvedValue({
                errorCode: 'user-id not found',
                errorMessage: 'userId: 1 not found'
            }),
        }));

        const { data, error } = await serviceApi.getNewSession(userId, questionLimit);
        expect(data).toBeNull();
        expect(error?.message).toBe('userId: 1 not found');
    });
});

describe('serviceApi getQuestion', () => {


    it('can get new question', async () => {
        const question = { id: 1, questionText: 'question', options: ['a', 'b', 'c'], powerUpDisabled: false, expiresInSecond: 15 };

        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => question
        });
        vi.stubGlobal('fetch', mockFetch);

        const { data, error } = await serviceApi.getQuestion(sessionId);

        expect(data).toBe(question);
        expect(error).toBeNull();
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining(`/sessions/${sessionId}/questions/next`),
            expect.objectContaining({ method: 'GET' })
        );
    });

    it('expect error when response is not OK', async () => {

        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            statusText: '404'
        }))

        const { data, error } = await serviceApi.getQuestion(sessionId);
        expect(data).toBeNull();
        expect(error?.message).toBe('404');
    });
});

describe('serviceApi usePowerUp', () => {
    const powerUpType = 'HAMMER';

    it('can use power up', async () => {

        const powerUpResponse = { updateUser: { id: userId, sessionId: sessionId }, powerUpEffect: { hiddenSelectionIds: [1, 2] } };

        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => powerUpResponse,
        });
        vi.stubGlobal('fetch', mockFetch);

        const { data, error } = await serviceApi.usePowerUp(powerUpType, userId, sessionId);

        expect(error).toBeNull();
        expect(data).toBe(powerUpResponse);
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining(`/api/powerups/use?type=${powerUpType}&userId=${userId}&sessionId=${sessionId}`),
            expect.objectContaining({ method: 'POST' })
        );

    });

    it('expect error when response is not 200', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            statusText: 404,
        }));

        const { data, error } = await serviceApi.usePowerUp(powerUpType, userId, sessionId);
        expect(data).toBeNull();
        expect(error?.message).toBe('404');
    });
});

describe('serviceAPI abandon session', () => {

    it('expect no data and error', async() => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            statusTex: 200,
        }));

        const {data, error} = await serviceApi.abandon(sessionId);
        expect(data).toBeNull();
        expect(error).toBeNull();
    });
});
