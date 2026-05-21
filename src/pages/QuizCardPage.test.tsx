import { beforeEach, describe, expect, it, vi } from "vitest";
import QuizCardPage from "../pages/QuizCardPage";
import { render, screen } from "@testing-library/react";

/**
 * default is needed because vitest use ESM.
 * export default QuizCard => {default : function QuizCard()...}
 * so import QuizCard from './QuizCard' => const QuizCard = imporrtedModule.default
 * If it was export const QuizCard... then simply do:
 * return {QuizCard: function someFunction() }
 */
vi.mock('../components/QuizCard/QuizCard', () => {
    return {
        default: function Dummy() {
            return <div data-testid="mock-quiz-data-id" />; // data-* is needed as that's what RTL is looking for when use with getByTestId
        }
    }
});

vi.mock("../components/QuestionTimer/QuestionTimer", () => {
    return {
        default: function QuestionTimer() {
            return <div data-testid="mock-question-timer" />
        }
    }
});

describe('QuizCardPage', () => {

    const mockQuestion = {
        id: 1,
        questionText: 'text',
        options: [{ content: 'x', id: 1, letter: 'B', isAvailable: true }],
        powerUpDisabled: false,
        expiresInSecond: 15,
        index: 0,
        potentialReward: null,
        potentialPenalty: null
    };
    const mockOnQuestionTimedout = vi.fn();

    const defaultProps = {
        currentQuestion: mockQuestion,
        currentIndex: 1,
        questionLimit: 10,
        sessionData: { duration: 1 } as any,
        answerSent: false,
        onQuestionTimedout: mockOnQuestionTimedout,
    }

    beforeEach(() => { vi.resetAllMocks(); });

    it('can reander', () => {
        render(<QuizCardPage {...defaultProps} />);

        expect(screen.getByText('Question: 2/10')).toBeInTheDocument();
        expect(screen.getByTestId('mock-quiz-data-id')).toBeInTheDocument();
        expect(screen.getByTestId('mock-question-timer')).toBeInTheDocument();
    });

    it('does not render QuestionTimer if sessionData is null', () => {
        render(<QuizCardPage {...defaultProps} sessionData={null} />);
        expect(screen.queryByTestId('mock-question-timer')).not.toBeInTheDocument();
    });


});