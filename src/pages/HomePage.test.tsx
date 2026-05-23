import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HomePage from "./HomePage";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";

const mockOnStartNewGame = vi.fn();

describe('HomePage', () => {

    it('can render default view', () => {
        render(
            <MemoryRouter>
                < HomePage onStartNewGame={mockOnStartNewGame} />
            </MemoryRouter>
        );

        expect(screen.getByText(/Quiz Game/i)).toBeInTheDocument();

        const newGameButton = screen.getByRole('button', { name: 'New Game' });
        expect(newGameButton).toBeInTheDocument();

        const leaderboardButton = screen.getByRole('button', { name: /Leaderboard/ });
        expect(leaderboardButton).toBeInTheDocument();
        

    });

    it('can click button start new game', async () => {
        render(
            <MemoryRouter>
                < HomePage onStartNewGame={mockOnStartNewGame} />
            </MemoryRouter>
        );

        expect(screen.getByText(/Quiz Game/i)).toBeInTheDocument();
        const newGameButton = screen.getByRole('button', { name: 'New Game' });
        expect(newGameButton).toBeInTheDocument();

        await userEvent.click(newGameButton);
        expect(mockOnStartNewGame).toHaveBeenCalled();
    });
});