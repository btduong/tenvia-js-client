import { afterEach, describe, expect, it, vi } from "vitest";
import { serviceApi } from "@/api/serviceApi";

const sessionId = '123';
const userId = 1;

afterEach(() => {
    vi.resetAllMocks();
});

describe('serviceApi getNewSession', () => {

    const questionLimit = 10;

    it('can get new session', async () => {
        const mockSession = {
            id: 'session_123',
            questions: [],
            currentQuestionIndex: 0,
            score: 0,
            user: null,
            duration: 15,
            endTime: 'endTIme'
        };

        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockSession,
            headers: new Headers({
                'content-type': 'application/json',
            })
        });
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
                errorCode: '404',
                errorMessage: 'userId: 1 not found'
            }),
            headers: new Headers({
                'content-type': 'application/json',
            })
        }));

        const { data, error } = await serviceApi.getNewSession(userId, questionLimit);
        expect(data).toBeNull();
        expect(error?.message).toBe('404: userId: 1 not found');
    });
});

describe('serviceApi getQuestion', () => {


    it('can get new question', async () => {
        const question = { id: 1, questionText: 'question', options: ['a', 'b', 'c'], powerUpDisabled: false, expiresInSecond: 15 };

        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => question,
            headers: new Headers({
                'content-type': 'application/json',
            })
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
            statusText: '404',
            headers: new Headers({
                'content-type': 'application/json',
            })
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
            headers: new Headers({
                'content-type': 'application/json',
            })
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
            headers: new Headers({
                'content-type': 'application/json',
            })
        }));

        const { data, error } = await serviceApi.usePowerUp(powerUpType, userId, sessionId);
        expect(data).toBeNull();
        expect(error?.message).toBe('404');
    });
});

describe('serviceAPI abandon session', () => {

    it('expect no data and error', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            statusTex: 200,
            headers: new Headers({
                'content-type': 'text/html',
            })
        }));

        const { data, error } = await serviceApi.abandon(sessionId);
        expect(data).toBeNull();
        expect(error).toBeNull();
    });
});

describe('serviceApi swap question', () => {
    it('expect no data when response is 200', async () => {
        const mockSwapQuestion = {
            id: 1,
            questionText: 'question_text',
            options: [{}],
            powerUpDisabled: false,
            expiresInSeconds: 15,
            index: 0,
            potentialReward: null,
            potentialPenalty: null,
        };

        const mockFetch = vi.fn();
        vi.stubGlobal('fetch', mockFetch);
        const mockData = mockFetch.mockResolvedValue({
            ok: true,
            statusText: 200,
            json: async () => mockSwapQuestion,
            headers: new Headers({
                'content-type': 'application/json',
            })
        });

        const { data: question, error } = await serviceApi.swapQuestion(sessionId);
        expect(error).toBeNull();
        expect(question?.id).toBe(1);
        expect(question?.questionText).toBe('question_text');
    });
});

describe('serviceApi validateSelectedAnswer', () => {

    it('can receive valid response', async () => {

        const mockAnswerResponse = {
            correctLetter: "A",
            newBalance: 8,
            isGameOver: false,
            summary: { score: 1, correctAnswerCount: 1, incorrectAnswerCount: 2, skipQuestionCount: 3 },
            isCorrect: false,
            currentQuestionIndex: 0,
            grantedItem: 'HAMMER',
            updatedInventory: { 'HAMMER': 1 }
        }

        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockAnswerResponse,
            headers: new Headers({
                'content-type': 'application/json',
            })
        });
        vi.stubGlobal('fetch', mockFetch);

        const { data: answerResponse, error } = await serviceApi.validateSelectedAnswer(sessionId, 5);
        expect(answerResponse).not.toBeNull();
        expect(answerResponse?.correctLetter).toBe("A");
    });
});
