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
    newBalance: number;
    isGameOver: boolean;
    summary: QuizSummary;
    correct: boolean;
    currentQuestionIndex: number;
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
    index: number;

}

export interface UsePowerUpResponse {
    updatedUser: User;
    effectResult: {
        removeOptionIds: number[];
        canUsePowerUps: boolean;
        appliedPowerUp: PowerUpType;
    };
}

export interface LederboardDTO {
    userName: string;
    score: number;
}


export type GameStatus = 'IDLE'
    | 'UNAUTHENTICATED'
    | 'LOGGING_IN'
    | 'STARTING_SESSION'
    | 'FETCHING_QUESTION'
    | 'LOADING'
    | 'PLAYING'
    | 'VALIDATING_ANSWER'
    | 'ERROR'
    | 'GAME_OVER'
    | 'SUMMARY';



export type PowerUpType = "FIFTY_FIFTY" | "HAMMER";