import { createContext, useContext } from "react";
import type {
    Inventory,
    PowerUpType,
    UsePowerUpResponse,
    AnswerResponse,
    Question
} from "../types";

interface GameContextType {
    sessionId: string | null;
    inventory: Inventory;
    currentQuestion: Question | null;
    handleUsePoweUp: (type: PowerUpType) => Promise<UsePowerUpResponse | null>;
    updateBalance: (newBalance: number) => void;
    onAnswerSent: () => void;
    handleAnswer: (response: AnswerResponse) => void;
}

// https://react.dev/learn/passing-data-deeply-with-context
// Create the context with a default value.
const GameContext = createContext<GameContextType | undefined>(undefined);

// GameProvider
export const GameProvider: React.FC<{ value: GameContextType, children: React.ReactNode }> = ({ value, children }) => {
    return (
        <GameContext.Provider value={value}> { children } </GameContext.Provider>
    );
};

/**
 * useGame hook.
 */
export const useGame = () => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error("useGame must ")
    }
    return context;
}