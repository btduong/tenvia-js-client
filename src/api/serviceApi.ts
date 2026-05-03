import type { GameSession, PowerUpType, Question, UsePowerUpResponse } from "../types";
import type { ServiceResponseResult } from "./serviceApiResult";

const SESSION_BASE_URL = 'http://localhost:8080';
const LEADERBOARD_BASE_URL = 'http://localhost:8081';

export const serviceApi = {
    async getNewSession(userId: number, questionLimit: number): Promise<ServiceResponseResult<GameSession>> {
        try {

            const response = await fetch(`${SESSION_BASE_URL}/sessions/start?id=${userId}&limit=${questionLimit}`, { method: 'POST' });
            if (response.ok) {
                const data = await response.json();
                return { data, error: null };
            }
            return { data: null, error: new Error(response.statusText) };
        }
        catch (error) {
            console.log("Fail to start new game session");
            return {
                data: null,
                error: error instanceof Error ? error : new Error("Failed to get new session")
            };
        }
    },

    async getQuestion(sessionId: string): Promise<ServiceResponseResult<Question>> {
        try {
            const response = await fetch(`${SESSION_BASE_URL}/sessions/${sessionId}/questions/next`);
            if (response.ok) {
                const data = await response.json() as Question;
                return { data, error: null };
            }
            return { data: null, error: new Error(response.statusText) };

        } catch (error) {
            console.log('Failed to fetch question', error);
            return {
                data: null,
                error: error instanceof Error ? error : new Error("Failed to get new session")
            };
        }

    },

    async usePowerUp(type: PowerUpType, userId: number, sessionId: string): Promise<ServiceResponseResult<UsePowerUpResponse>> {
        try {
            const response = await fetch(`http://localhost:8080/api/powerups/use?type=${type}&userId=${userId}&sessionId=${sessionId}`, { method: 'POST' });

            if (response.ok) {
                const data = await response.json();
                return { data, error: null };
            }
            return {data: null, error: new Error(response.statusText)};
        } catch (error) {
            console.error("Failed to use power-up", error);
            return {
                data: null,
                error: error instanceof Error ? error : new Error("Failed to get new session")
            };
        }
    }
}