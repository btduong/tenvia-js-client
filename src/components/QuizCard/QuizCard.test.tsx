import { isFunctionTypeNode } from "typescript";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { useGameContext } from "../../context/GameContext";
import type { GameStatus } from "../../types";
import QuizCard from "./QuizCard";

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

/**
 * Needed for `vi.mocked(useGameContext).mockReturnValue(defaultGameContext)` to work in test.
 * This is due to vi 'hoisted' the vi.mock to the top of the file so vi.mocked...was never in the test.
 * Therefore this vi.mock here is mocking the 'module' GameContext and return a mock.
 * Then the vi.mocked...mockReturnValue can work as expected.
 */
vi.mock('../../context/GameContext');

const mockQuestion = {
    id: 1,
    questionText: 'who are you',
    options: [{ id: 10, letter: 'A', content: 'me', isAvailable: true },
    { id: 11, letter: 'B', content: 'you', isAvailable: true }],
    powerUpDisabled: false,
    expiresInSecond: 10,
    index: 0,
    potentialReward: null,
    potentialPenalty: null,
};

const inventory = {
    "HAMMER": 1,
    "FIFTY_FIFTY": 1,
    "SWAP_QUESTION": 0,
};

const mockHandleUsePowerUp = vi.fn();

const defaultGameContext = {
    gameStatus: 'PLAYING' as GameStatus,
    currentQuestion: mockQuestion,
    sessionId: '123',
    inventory: inventory,
    handleUsePoweUp: mockHandleUsePowerUp,
    updateBalance: vi.fn(),
    onAnswerSent: vi.fn(),
    handleAnswerResponse: vi.fn(),
    triggerGlobalError: vi.fn(),
    handleAbandonSession: vi.fn(),
};

describe('QuizCard', (() => {

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useGameContext).mockReturnValue(defaultGameContext);
    });

    it('can render default view when question is null', () => {
        vi.mocked(useGameContext).mockReturnValue({ ...defaultGameContext, currentQuestion: null });
        const { container } = render(<QuizCard />);
        expect(container).toBeEmptyDOMElement();
    });

    it('can render question', () => {
        render(<QuizCard />);
        expect(screen.getByText('who are you')).toBeInTheDocument();
    });

    it('disables options when gameStatus is VALIDATING_ANSWER', () => {
        vi.mocked(useGameContext).mockReturnValue({ ...defaultGameContext, gameStatus: 'VALIDATING_ANSWER' });
        render(<QuizCard />);
        
        const optionButtons = [
            screen.getByRole('button', { name: 'me' }),
            screen.getByRole('button', { name: 'you' })
        ];
        optionButtons.forEach(button => {
            expect(button).toBeDisabled();
        });
    });

    it('expect power-up bar to be hidden after used a power-up item ', async () => {
        render(<QuizCard />);

        const useHammerPowerUpResponse = {
            updateUser: {}, effectResult: {
                removeOptionIds: [1, 2],
                canUsePowerUps: false,
                appliedPowerUp: 'HAMMER',
            }
        };

        vi.mocked(mockHandleUsePowerUp).mockReturnValue(useHammerPowerUpResponse);

        expect(await screen.findByRole('button', { name: 'HAMMER' })).toBeInTheDocument();

        // The default power-up bar with a power-upitem in the inventory
        expect(screen.getByText(/Your Power-Ups:/i)).toBeInTheDocument();

        const hammerButton = screen.getByRole('button', { name: 'HAMMER' });
        await userEvent.click(hammerButton);

        expect(mockHandleUsePowerUp).toHaveBeenCalled();

        // The usage limit is reached for current question so hide the power-up bar
        expect(screen.queryByText(/Your Power-Ups:/i)).not.toBeInTheDocument();
    })
}));