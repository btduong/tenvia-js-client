import { isFunctionTypeNode } from "typescript";
import { beforeEach, describe, expect, it, vi } from "vitest";
import QuizCard from "../components/QuizCard";
import { render, screen } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

const mockQuestion = {
    id: 1,
    questionText: 'who are you',
    options: [{ id: 10, letter: 'A', content: 'me' },
            { id: 11, letter: 'B', content: 'you' }],
    powerUpDisabled: false,
    expiresInSecond: 10,
};

const inventory = {
    "HAMMER": 1,
    "FIFTY_FIFTY": 0,
};

const defaultGameContext = {
    currentQuestion:  mockQuestion,
    sessionId: '123',
    inventory: inventory,
    handleUsePoweUp: vi.fn(),
    updateBalance: vi.fn(),
    onAnswerSent: vi.fn(),
    handleAnswerResponse: vi.fn(),
    triggerGlobalError: vi.fn(),
};

vi.mock('../context/GameContext', () => ({
    useGame: vi.fn(),
}));


describe('QuizCard', (() => {

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useGame).mockReturnValue(defaultGameContext);
    });

    it('can render default view when question is null', () => {
        vi.mocked(useGame).mockReturnValue({...defaultGameContext, currentQuestion: null});
        const {container } = render(<QuizCard />);
        expect(container).toBeEmptyDOMElement();
    });

    it('can render question', () => {
        render(<QuizCard />);
        expect(screen.getByText('who are you')).toBeInTheDocument();
    });
}));