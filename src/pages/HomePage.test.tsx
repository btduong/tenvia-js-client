import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HomePage from './HomePage';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { renderWithClient } from '@/test/test-utils';
import { useGameSession } from '@/hooks/useGameSession';

vi.mock('@/hooks/useGameSession');
vi.mock('@/utils/sounds', () => ({
  playQuestionStartSound: vi.fn(),
}));

const mockOnStartNewGame = vi.fn();

describe('HomePage', () => {

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useGameSession).mockReturnValue({
      questionLimit: { current: 10 },
      startNewGame: mockOnStartNewGame,
      onAnswerSent: vi.fn(),
      handleAnswerResponse: vi.fn(),
      handleGameOver: vi.fn(),
    });
  });

  it('can render default view', () => {
    renderWithClient(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );


    const newGameButton = screen.getByRole('button', { name: 'New Game' });
    expect(newGameButton).toBeInTheDocument();

    const leaderboardButton = screen.getByRole('button', { name: /Leaderboard/ });
    expect(leaderboardButton).toBeInTheDocument();
  });

  it('can click Start button to start new game', async () => {
    renderWithClient(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    const newGameButton = screen.getByRole('button', { name: 'New Game' });
    expect(newGameButton).toBeInTheDocument();

    await userEvent.click(newGameButton);
    const startButton = screen.getByRole('button', { name: 'Start'});
    expect(startButton).toBeInTheDocument();
    await userEvent.click(startButton);

    expect(mockOnStartNewGame).toHaveBeenCalled();
  });

  it('expect no new game start when click Cancel button', async() => {

    renderWithClient(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    const newGameButton = screen.getByRole('button', { name: 'New Game' });
    expect(newGameButton).toBeInTheDocument();

    await userEvent.click(newGameButton);
    const cancelButton = screen.getByRole('button', { name: 'Cancel'});
    expect(cancelButton).toBeInTheDocument();
    await userEvent.click(cancelButton);

    expect(mockOnStartNewGame).not.toHaveBeenCalled();
  });
});
