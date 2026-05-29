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
    questions: Question[];
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
    skipQuestionCount: number;
}

export interface AnswerResponse {
    correctLetter: string;
    newBalance: number;
    isGameOver: boolean;
    summary: QuizSummary;
    isCorrect: boolean;
    currentQuestionIndex: number;
    grantedItem: PowerUpType;
    updatedInventory: Inventory;
}

export interface QuestionOption {
    content: string;
    id: number;
    letter: string;
    isAvailable: boolean;
}

export interface Question {
    id: number;
    questionText: string;
    options: QuestionOption[];
    powerUpDisabled: boolean;
    expiresInSecond: number;
    index: number;
    potentialReward: PowerUpType | null;
    potentialPenalty: QuestionPenaltyType | null;
}


export interface UsePowerUpResponse {
    updatedUser: User;
    effectResult: {
        canUsePowerUps: boolean;
        appliedPowerUp: PowerUpType;
        questionResponse: Question;
    };
}

export interface LeaderboardDTO {
    userName: string;
    score: number;
}

export interface ErrorResponseDTO {
    errorCode: string;
    errorMessage: string;
}


export enum GameStatus {
    IDLE = 'IDLE',
    UNAUTHENTICATED = 'UNAUTHENTICATED',
    LOGGING_IN = 'LOGGING_IN',
    STARTING_SESSION = 'STARTING_SESSION',
    FETCHING_QUESTION = 'FETCHING_QUESTION',
    LOADING = 'LOADING',
    PLAYING = 'PLAYING',
    VALIDATING_ANSWER = 'VALIDATING_ANSWER',
    ERROR = 'ERROR',
    GAME_OVER = 'GAME_OVER',
    SUMMARY = 'SUMMARY'
}



export type PowerUpType = "FIFTY_FIFTY" | "HAMMER" | "SWAP_QUESTION";
export type QuestionPenaltyType = "LOSE_GOLD" | "LOSE_TIME";