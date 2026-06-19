import type {
  AnswerResponse,
  GameSession,
  LeaderboardDTO,
  PowerUpType,
  Question,
  UsePowerUpResponse,
  User,
  ErrorResponseDTO,
  LoginDTO,
} from '@/types';

const SESSION_BASE_URL = import.meta.env.VITE_APP_API_URL;
const LEADERBOARD_BASE_URL = import.meta.env.VITE_LEADERBOARD_API_URL;

/**
 * A fetch with the provided JwT token from the server.
 * This is needed to communicate with the backend server as all endpoints (except /login)
 * required the Authorization header.
 *
 * @param url 
 * @param options 
 * @returns a promise of T
 */
async function fetchWithToken<T>(
  url: string,
  options?: RequestInit
): Promise<T> {

  const token = localStorage.getItem('jwt_token');
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetchPublic<T>(url, {...options, headers});
}

/**
 * A generic fetch helper to process API requests.
 * This does not attach a token to the Authorization header as it is supposed to communicate to 
 * the endpoints on server without a token like /login.
 * For all other endpoints that needed a token, use #fetchWithToken
 *
 * Handles the server's standard ErrorResponseDTO and data parsing.
 */
async function fetchPublic<T>(
  url: string,
  options?: RequestInit
): Promise<T> {

  const response = await fetch(url, options);

  // Handle error response
  if (!response.ok) {
    let errorMessage = response.statusText;
    const contentType = response.headers.get('content-type');

    // Extract ErrorResponseDTO (errorCode, errorMessage) from the response's body.
    if (contentType && contentType.includes('application/json')) {
      try {
        const errorData = (await response.json()) as ErrorResponseDTO;
        if (errorData && errorData.errorMessage) {
          errorMessage = errorData.errorCode
            ? `${errorData.errorCode}: ${errorData.errorMessage}`
            : errorData.errorMessage;
        }
      } catch (e) {
        // Shouldn't get here otherwise it means the server has changed or updated the ErrorResponseDTO.
      }
    }
    throw new Error(errorMessage);
  }

  // Handle OK response
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    // return { data: data as T, error: null };
    return data as T;
  }

  // Handle responses with empty body ie /abandon
  return null as unknown as T;

}

export const serviceApi = {
  async getNewSession(
    userId: number,
    questionLimit: number
  ): Promise<GameSession> {
    return fetchWithToken<GameSession>(
      `${SESSION_BASE_URL}/sessions/start?id=${userId}&limit=${questionLimit}`,
      { method: 'POST' }
    );
  },

  async createMultiplayerLobby(limit: number = 10): Promise<{ lobbyId: string }> {
    return fetchWithToken<{ lobbyId: string }>(
      `${SESSION_BASE_URL}/api/multiplayer/lobby?limit=${limit}`,
      { method: 'POST' }
    );
  },

  async getQuestion(sessionId: string): Promise<Question> {
    return fetchWithToken<Question>(`${SESSION_BASE_URL}/sessions/${sessionId}/questions/next`, {
      method: 'GET',
    });
  },

  async usePowerUp(
    type: PowerUpType,
    userId: number,
    sessionId: string
  ): Promise<UsePowerUpResponse> {
    return fetchWithToken<UsePowerUpResponse>(
      `${SESSION_BASE_URL}/api/powerups/use?type=${type}&userId=${userId}&sessionId=${sessionId}`,
      { method: 'POST' }
    );
  },

  /**
   * Send a validate request to with a selected optionId. Wehen the optionId param is null, this indicates
   * to the server that the current question is skipped (ie when the question is timed out)
   * @param sessionId
   * @param optionId
   * @returns {@link AnswerResponse}
   */
  async validateSelectedAnswer(
    sessionId: string,
    optionId: number | null
  ): Promise<AnswerResponse> {
    return fetchWithToken<AnswerResponse>(`${SESSION_BASE_URL}/sessions/${sessionId}/answer`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ selectedOptionId: optionId }),
    });
  },

  async login(username: string): Promise<LoginDTO> {
    return fetchPublic<LoginDTO>(`${SESSION_BASE_URL}/users/login?username=${username}`, {
      method: 'POST',
    });
  },

  async leaderboardPage(): Promise<LeaderboardDTO[]> {
    return fetchWithToken<LeaderboardDTO[]>(`${LEADERBOARD_BASE_URL}/leaderboard`, {
      method: 'GET',
    });
  },

  async abandon(sessionId: string): Promise<null> {
    return fetchWithToken<null>(`${SESSION_BASE_URL}/sessions/${sessionId}/abandon`, {
      method: 'POST',
    });
  },

  async swapQuestion(sessionId: string): Promise<Question> {
    return fetchWithToken<Question>(`${SESSION_BASE_URL}/sessions/${sessionId}/swap`, {
      method: 'POST',
    });
  },

  async purchasePowerUp(
    userId: number,
    itemType: PowerUpType
  ): Promise<User> {
    return fetchWithToken<User>(
      `${SESSION_BASE_URL}/shop/buy?userId=${userId}&type=${itemType}`,
      { method: 'POST' }
    );
  },
};
