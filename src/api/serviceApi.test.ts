import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { serviceApi } from '@/api/serviceApi';

const sessionId = '123';
const userId = 1;
const jwt_token = 'test_jwt_token';

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

vi.stubGlobal('localStorage', mockLocalStorage);

beforeEach(() => {
  mockLocalStorage.getItem.mockReturnValue(jwt_token);
});

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
      endTime: 'endTIme',
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSession,
      headers: new Headers({
        'content-type': 'application/json',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await serviceApi.getNewSession(userId, questionLimit);

    expect(mockLocalStorage.getItem).toHaveBeenCalled();
    expect(result).toBe(mockSession);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/sessions/start?id=${userId}&limit=${questionLimit}`),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + jwt_token }
      })
    );
  });

  it('expect error when response is not 200', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        statusText: '404',
        json: vi.fn().mockResolvedValue({
          errorCode: '404',
          errorMessage: 'userId: 1 not found',
        }),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      })
    );

    await expect(serviceApi.getNewSession(userId, questionLimit))
      .rejects
      .toThrow('404: userId: 1 not found');
  });
});

describe('serviceApi getQuestion', () => {
  it('can get new question', async () => {
    const question = {
      id: 1,
      questionText: 'question',
      options: ['a', 'b', 'c'],
      powerUpDisabled: false,
      expiresInSecond: 15,
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => question,
      headers: new Headers({
        'content-type': 'application/json',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await serviceApi.getQuestion(sessionId);

    expect(result).toBe(question);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/sessions/${sessionId}/questions/next`),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('expect error when response is not OK', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        statusText: '404',
        json: vi.fn().mockResolvedValue({
          errorCode: '404',
          errorMessage: 'question not found'
        }),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      })
    );

    await expect(serviceApi.getQuestion(sessionId))
      .rejects.
      toThrow('404: question not found');
  });
});

describe('serviceApi usePowerUp', () => {
  const powerUpType = 'HAMMER';

  it('can use power up', async () => {
    const powerUpResponse = {
      updateUser: { id: userId, sessionId: sessionId },
      powerUpEffect: { hiddenSelectionIds: [1, 2] },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => powerUpResponse,
      headers: new Headers({
        'content-type': 'application/json',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await serviceApi.usePowerUp(powerUpType, userId, sessionId);

    expect(result).toBe(powerUpResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(
        `/api/powerups/use?type=${powerUpType}&userId=${userId}&sessionId=${sessionId}`
      ),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('expect error when response is not 200', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        statusText: 403,
        json: vi.fn().mockResolvedValue({
          errorCode: 403,
          errorMessage: 'forbidden'
        }),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      })
    );

    await expect(serviceApi.usePowerUp(powerUpType, userId, sessionId))
      .rejects
      .toThrow('403: forbidden');
  });
});

describe('serviceAPI abandon session', () => {
  it('expect no data and error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        statusText: 200,
        headers: new Headers({
          'content-type': 'text/html',
        }),
      })
    );

    const result = await serviceApi.abandon(sessionId);
    expect(result).toBeNull();
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
      }),
    });

    const result = await serviceApi.swapQuestion(sessionId);
    expect(result).not.toBeNull();
    expect(result.id).toBe(1);
    expect(result.questionText).toBe('question_text');
  });
});

describe('serviceApi validateSelectedAnswer', () => {
  it('can receive valid response', async () => {
    const mockAnswerResponse = {
      correctLetter: 'A',
      newBalance: 8,
      isGameOver: false,
      summary: { score: 1, correctAnswerCount: 1, incorrectAnswerCount: 2, skipQuestionCount: 3 },
      isCorrect: false,
      currentQuestionIndex: 0,
      grantedItem: 'HAMMER',
      updatedInventory: { HAMMER: 1 },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockAnswerResponse,
      headers: new Headers({
        'content-type': 'application/json',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await serviceApi.validateSelectedAnswer(sessionId, 5);
    expect(result).not.toBeNull();
    expect(result.correctLetter).toBe('A');
  });
});

describe('serviceApi login', () => {

  it('can login without Authorization header', async () => {

    const validUser = {
      id: 2,
      username: 'player1',
      createdAt: '2026-04-28T19:57:24.747338965',
      balance: 0,
      inventory: { HAMMER: 5, FIFTY_FIFTY: 1, SWAP_QUESTION: 1 },
    };

    const mockLoginDTO = {
      userDTO: validUser,
      jwt: 'jwt_token'
    }

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockLoginDTO,
      headers: new Headers({
        'content-type': 'application/json',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await serviceApi.login('alice');

    expect(mockLocalStorage.getItem).not.toHaveBeenCalled();
    expect(result.jwt).not.toBeNull();
    expect(mockFetch).not.toHaveBeenCalledWith(
      expect.objectContaining({ headers: { 'Authorization': 'Bearer' } })
    );
  });
});
