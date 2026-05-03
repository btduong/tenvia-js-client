import type { GameSession, Question } from "../types";

const SESSION_BASE_URL = 'http://localhost:8080';
const LEADERBOARD_BASE_URL = 'http://localhost:8081';

export const serviceApi = {
    async getNewSession(userId: number, questionLimit: number): Promise<GameSession> {
        try {

            const response = await fetch(`SESSION_BASE_URLsessions/start?id=${userId}&limit=${questionLimit}`, { method: 'POST' });
            if (response.ok) {
                return await response.json() as GameSession;
            }
            throw new Error(`Fail to get new game sesision", ${response.statusText}`);
        }
        catch (error) {
            console.log("Fail to start new game session");
            throw error;
        }
    },

    async getQuestion(sessionId: string): Promise<Question> {
        try {
            const response = await fetch(`${SESSION_BASE_URL}/sessions/${sessionId}/questions/next`);
            if (response.ok) {
                return await response.json() as Question;
            }
            throw new Error(`Failed to fetch question: , ${response.statusText}`);

        } catch (error) {
            console.log('Failed to fetch question', error);
            throw error;
        }

    },
}