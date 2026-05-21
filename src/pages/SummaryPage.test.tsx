import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import SummaryPage from "./SummaryPage";

const mockSessionSummary = {
    score: 1,
    correctAnswerCount: 1,
    incorrectAnswerCount: 2,
    skipQuestionCount: 3,
};

// Need to explicitly  vi.hoisted because const make vi hoist doesn't happen immediately.
const mockLocation = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', () => ({
    useLocation: mockLocation,
    useNavigate: () => vi.fn()
}));


describe('SummaryPage', () => {

    it('can render default view with summary', () => {

        mockLocation.mockReturnValue(
            {
                state: { sessionSummary: mockSessionSummary },
                key: 'key',
                pathname: '/summary',
                search: 'summary',
                hash: '123',
            });

        render(
            <SummaryPage />
        );

        expect(screen.getByText(/Game Over!/i)).toBeInTheDocument();
        expect(screen.getByText(/Score: 1/i)).toBeInTheDocument();
        expect(screen.getByText(/Correct: 1/i)).toBeInTheDocument();
        expect(screen.getByText(/Incorrect: 2/i)).toBeInTheDocument();
        expect(screen.getByText(/Skip: 3/i)).toBeInTheDocument();
    });

    it('can render default view without summary', () => {

        mockLocation.mockReturnValue({ state: null });

        render(
            <SummaryPage />
        );

        expect(screen.queryByText(/Game Over!/i)).not.toBeInTheDocument();
    });
});