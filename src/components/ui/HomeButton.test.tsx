import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import LeaderboardPage from "@/pages/LeaderboardPage";
import SummaryPage from "@/pages/SummaryPage";


const mockNavigate = vi.fn();

// Need to partially mock a module because MemoryRouter doesn't change the page view.
vi.mock(import("react-router-dom"), async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
});

describe('HomeButton', () => {

    it('can render default view in LeaderboardPage', async () => {

        render(
            <MemoryRouter>
                <LeaderboardPage />
            </MemoryRouter>

        );
        const homeButton = screen.getByRole('button', { name: /To Home/i });
        expect(homeButton).toBeInTheDocument();

        await userEvent.click(homeButton);
        //expect(homeButton).not.toBeInTheDocument() - won't work because MemoryRouter doesn't change the view.
        expect(mockNavigate).toHaveBeenCalledWith('/');

    });

    it('can render default view SummaryPage', async () => {

        // No need to mock useLocation as it is provided by MemoryRouter. 
        // Simply provide the path and state via initialEntries.
        render(
            <MemoryRouter initialEntries={[
                {
                    pathname: '/summary',
                    state: { sessionSummary: { score: 1, correctAnswerCount: 2 } }
                }
            ]}>
                <SummaryPage />
            </MemoryRouter>
        )

        expect(screen.getByText(/Game Over/)).toBeInTheDocument();
        expect(screen.getByText(/Score: 1/)).toBeInTheDocument();
        expect(screen.getByText(/Correct: 2/)).toBeInTheDocument();

        const homeButton = screen.getByRole('button', { name: /To Home/i });
        expect(homeButton).toBeInTheDocument();

        await userEvent.click(homeButton);
        expect(mockNavigate).toHaveBeenCalledWith('/');

    });

});

