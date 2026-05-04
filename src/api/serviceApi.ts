import type { AnswerResponse, GameSession, PowerUpType, Question, UsePowerUpResponse, User } from "../types";
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
            return {data: null, error: new Error(response.statusText)};
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
            return {data: null, error: new Error(response.statusText)};
        } catch (error) {
            return {
                data: null,
                error: error instanceof Error ? error : new Error("Failed to validate answer")
            };
        }
    },

    async login(username: string): Promise<ServiceResponseResult<User>> {
        try {
          const res = await fetch(`${SESSION_BASE_URL}/users/login?username=${username}`, { 
            method: 'POST' 
          });
          
          if (!res.ok) {
            return { data: null, error: new Error(`Login failed: ${res.statusText}`) };
          }
    
          const data = await res.json();
          return { data, error: null };
        } catch (err) {
          return { 
            data: null, 
            error: err instanceof Error ? err : new Error("Failed to login") 
          };
        }
      }
}