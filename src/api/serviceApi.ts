import type { AnswerResponse, GameSession, LederboardDTO, PowerUpType, Question, UsePowerUpResponse, User } from "../types";
import type { ServiceResponseResult } from "./serviceApiResult";

const SESSION_BASE_URL = 'http://localhost:8080';
const LEADERBOARD_BASE_URL = 'http://localhost:8081';

export const serviceApi = {
    async getNewSession(userId: number, questionLimit: number): Promise<ServiceResponseResult<GameSession>> {
        try {

            // In the case of a non 200 response such as 404, the errorCode and errorMessage is in the body of the response.
            const response = await fetch(`${SESSION_BASE_URL}/sessions/start?id=${userId}&limit=${questionLimit}`, { method: 'POST' });
            if (response.ok) {
                const data = await response.json();
                return { data, error: null };
            } else {
                const data = await response.json();
                return { data: null, error: new Error(data.errorMessage) };
            }
        }
        catch (error) {
            return {
                data: null,
                error: error instanceof Error ? error : new Error("Failed to get new session")
            };
        }
    },

    async getQuestion(sessionId: string): Promise<ServiceResponseResult<Question>> {
        try {
            const response = await fetch(`${SESSION_BASE_URL}/sessions/${sessionId}/questions/next`, { method: 'GET' });
            if (response.ok) {
                const data = await response.json() as Question;
                return { data, error: null };
            }
            return { data: null, error: new Error(response.statusText) };

        } catch (error) {
            return {
                data: null,
                error: error instanceof Error ? error : new Error("Failed to get new question")
            };
        }

    },

    async usePowerUp(type: PowerUpType, userId: number, sessionId: string): Promise<ServiceResponseResult<UsePowerUpResponse>> {
        try {
            const response = await fetch(`${SESSION_BASE_URL}/api/powerups/use?type=${type}&userId=${userId}&sessionId=${sessionId}`, { method: 'POST' });

            if (response.ok) {
                const data = await response.json();
                return { data, error: null };
            }
            return { data: null, error: new Error(response.statusText) };
        } catch (error) {
            return {
                data: null,
                error: error instanceof Error ? error : new Error("Failed to use power up")
            };
        }
    },

    async validateSelectedAnswer(sessionId: string, optionId: number): Promise<ServiceResponseResult<AnswerResponse>> {
        try {
            const response = await fetch(`${SESSION_BASE_URL}/sessions/${sessionId}/answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    selectedOptionId: optionId
                })
            });
            if (response.ok) {
                const data = await response.json();
                return { data, error: null };
            }
            return { data: null, error: new Error(response.statusText) };
        } catch (error) {
            return {
                data: null,
                error: error instanceof Error ? error : new Error("Failed to validate answer")
            };
        }
    },

    async login(username: string): Promise<ServiceResponseResult<User>> {
        try {
            const response = await fetch(`${SESSION_BASE_URL}/users/login?username=${username}`, {
                method: 'POST'
            });

            if (!response.ok) {
                return { data: null, error: new Error(`Login failed: ${response.statusText}`) };
            }

            const data = await response.json() as User;
            return { data, error: null };
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err : new Error("Failed to login")
            };
        }
    },

    async leaderboardPage(): Promise<ServiceResponseResult<LederboardDTO[]>> {
        try {
            const response = await fetch(`${LEADERBOARD_BASE_URL}/leaderboard`, {
                method: 'GET'
            });

            if (!response.ok) {
                return { data: null, error: new Error(`Failed to retrieve /leaderbard ${response.statusText}`) };
            }

            const data = await response.json();
            return { data, error: null };
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err : new Error("Failed to retrieve /leaderboard")
            };
        }
    },

    /**
     * Send a request to abandon the current game session.
     * @param sessionId 
     * @returns void
     */
    async abandon(sessionId: string): Promise<ServiceResponseResult<null>> {
        try {
            const response = await fetch(`${SESSION_BASE_URL}/sessions/${sessionId}/abandon`, { method: 'POST' });
            if (!response.ok) {
                return { data: null, error: new Error(`Failed to abandon session: ${response.statusText}`) };
            }
            return { data: null, error: null };
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err : new Error("Network error")
            };

        }
    },

    async swapQuestion(sessionId: string): Promise<ServiceResponseResult<Question>> {
        try {
            const response = await fetch(`${SESSION_BASE_URL}/sessions/${sessionId}/swap`, { method: 'POST' });
            if (!response.ok) {
                return { data: null, error: new Error(`Failed to swap question: ${response.statusText}`) };
            }
            const data = await response.json();
            return { data, error: null };
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err : new Error("Network error")
            };

        }
    },

    /**
     * Purchase a power-up item.
     * @param userId - id of the user
     * @param itemType - type of the power-up item
     * @returns a Promise<User>
     */
    async purchasePowerUp(userId: number, itemType: PowerUpType): Promise<ServiceResponseResult<User>> {
        try {
            const response = await fetch(`${SESSION_BASE_URL}/shop/buy?userId=${userId}&type=${itemType}`, { method: 'POST' });
            if (!response.ok) {
                return { data: null, error: new Error(`Error:`) };
            }
            const data = await response.json() as User;
            return { data: data, error: null };
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err : new Error("Network error")
            };
        }
    }
}