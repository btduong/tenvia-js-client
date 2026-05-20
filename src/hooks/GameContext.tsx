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
    handleAnswerResponse: (response: AnswerResponse) => void;
    triggerGlobalError: (message: string) => void;
    handleAbandonSession: () => void;
}


/**
 * Create the context with a default value.
 * Ref: https://react.dev/learn/passing-data-deeply-with-context
 */
const GameContext = createContext<GameContextType | undefined>(undefined);

/**
 * GameProvider - children should be provided from a parent.
 */
export const GameProvider: React.FC<{ value: GameContextType, children: React.ReactNode }> = ({ value, children }) => {
    return (
        <GameContext.Provider value={value}> {children} </GameContext.Provider>
    );
};

/**
 * GameContext hook.
 * 
 * This hook should be used in a component that needs access to the GameContext.
 */
export const useGameContext = () => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error("useGame must ")
    }
    return context;
}