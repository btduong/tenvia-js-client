/**
 * Using record here to map to backend Map<K,V> Map<PowerUpType, Integer> inventory.
 * Partial (instead of Record) is probbaly a better as it allows 0 if the Map is empty.
 * Otherwise it will show undefined.
 */
export type Inventory = Record<PowerUpType, number>;

export interface User {
    id: number;
    username: string;
    createdAt: string;
    balance: number;
    inventory: Inventory;
}

export interface GameSession {
    questions: any;
    fiftyFiftyUsed: boolean;
    currentQuestionIndex: number;
    score: number;
    id: string | null;
    user: User;
    duration: number;
    endTime: string;
}

export interface QuizSummary {
    score: number;
    correctAnswerCount: number;
    incorrectAnswerCount: number;
}

export interface AnswerResponse {
    correctLetter: string;
    explanation: string;
    newBalance: number;
    isGameOver: boolean;
    summary: QuizSummary;
    correct: boolean;
}

export interface QuestionOption {
    content: string;
    id: number;
    letter: string;
}

export interface Question {
    id: number;
    questionText: string;
    options: QuestionOption[];
    powerUpDisabled: boolean;
    expiresInSecond: number;

}

export interface PowerUpEffect {
    hiddenSelectionsIds: number[];
}

export type PowerUpType = "FIFTY_FIFTY" | "HAMMER";