import type { AnswerResponse, GameSession, LeaderboardDTO, PowerUpType, Question, UsePowerUpResponse, User, ErrorResponseDTO } from "../types";
import type { ServiceResponseResult } from "./serviceApiResult";

const SESSION_BASE_URL = 'http://localhost:8080';
const LEADERBOARD_BASE_URL = 'http://localhost:8081';

/**
 * A generic helper to process API requests.
 * Handles the server's standard ErrorResponseDTO and data parsing.
 */
async function fetchWithHandling<T>(url: string, options?: RequestInit): Promise<ServiceResponseResult<T>> {
    try {
        const response = await fetch(url, options);

        // Handle error response
        if (!response.ok) {
            let errorMessage = response.statusText;
            const contentType = response.headers.get("content-type");

            // Extract ErrorResponseDTO (errorCode, errorMessage) from the response's body.
            if (contentType && contentType.includes("application/json")) {
                try {
                    const errorData = await response.json() as ErrorResponseDTO;
                    if (errorData && errorData.errorMessage) {
                        errorMessage = errorData.errorCode
                            ? `${errorData.errorCode}: ${errorData.errorMessage}`
                            : errorData.errorMessage;
                    }
                } catch (e) {
                    // Shouldn't get here otherwise it means the server has changed or updated the ErrorResponseDTO.
                }
            }
            return { data: null, error: new Error(errorMessage) };
        }

        // Handle OK response
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            return { data: data as T, error: null };
        }

        // Handle responses with empty body ie /abandon
        return { data: null as any, error: null };
    } catch (error) {
        return {
            data: null,
            error: error instanceof Error ? error : new Error("Network error")
        };
    }
}

export const serviceApi = {
    async getNewSession(userId: number, questionLimit: number): Promise<ServiceResponseResult<GameSession>> {
        return fetchWithHandling<GameSession>(`${SESSION_BASE_URL}/sessions/start?id=${userId}&limit=${questionLimit}`, { method: 'POST' });
    },

    async getQuestion(sessionId: string): Promise<ServiceResponseResult<Question>> {
        return fetchWithHandling<Question>(`${SESSION_BASE_URL}/sessions/${sessionId}/questions/next`, { method: 'GET' });
    },

    async usePowerUp(type: PowerUpType, userId: number, sessionId: string): Promise<ServiceResponseResult<UsePowerUpResponse>> {
        return fetchWithHandling<UsePowerUpResponse>(`${SESSION_BASE_URL}/api/powerups/use?type=${type}&userId=${userId}&sessionId=${sessionId}`, { method: 'POST' });
    },

    /**
     * Send a validate request to with a selected optionId. Wehen the optionId param is null, this indicates
     * to the server that the current question is skipped (ie when the question is timed out)
     * @param sessionId 
     * @param optionId 
     * @returns {@link AnswerResponse}
     */
    async validateSelectedAnswer(sessionId: string, optionId: number | null): Promise<ServiceResponseResult<AnswerResponse>> {
        return fetchWithHandling<AnswerResponse>(`${SESSION_BASE_URL}/sessions/${sessionId}/answer`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ selectedOptionId: optionId })
        });
    },

    async login(username: string): Promise<ServiceResponseResult<User>> {
        return fetchWithHandling<User>(`${SESSION_BASE_URL}/users/login?username=${username}`, { method: 'POST' });
    },

    async leaderboardPage(): Promise<ServiceResponseResult<LeaderboardDTO[]>> {
        return fetchWithHandling<LeaderboardDTO[]>(`${LEADERBOARD_BASE_URL}/leaderboard`, { method: 'GET' });
    },

    async abandon(sessionId: string): Promise<ServiceResponseResult<null>> {
        return fetchWithHandling<null>(`${SESSION_BASE_URL}/sessions/${sessionId}/abandon`, { method: 'POST' });
    },

    async swapQuestion(sessionId: string): Promise<ServiceResponseResult<Question>> {
        return fetchWithHandling<Question>(`${SESSION_BASE_URL}/sessions/${sessionId}/swap`, { method: 'POST' });
    },

    async purchasePowerUp(userId: number, itemType: PowerUpType): Promise<ServiceResponseResult<User>> {
        return fetchWithHandling<User>(`${SESSION_BASE_URL}/shop/buy?userId=${userId}&type=${itemType}`, { method: 'POST' });
    }
};