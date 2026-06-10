import { serviceApi } from '@/api/serviceApi';
import LeaderboardPage from '@/pages/LeaderboardPage';
import SummaryPage from '@/pages/SummaryPage';
import { renderWithClient } from '@/test/test-utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const mockNavigate = vi.fn();

vi.mock('@/api/serviceApi');

vi.mock(import('react-router-dom'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('HomeButton', () => {
  it('can render default view in LeaderboardPage', async () => {
    // 1. Mock the underlying API call so React Query resolves instantly
    vi.mocked(serviceApi.leaderboardPage).mockResolvedValue([
      { userName: 'Alice', score: 100 }
    ]);

    renderWithClient(
      <MemoryRouter>
        <LeaderboardPage />
      </MemoryRouter>
    );

    const homeButton = await screen.findByRole('button', { name: /To Home/i });
    expect(homeButton).toBeInTheDocument();

    await userEvent.click(homeButton);
    //expect(homeButton).not.toBeInTheDocument() - won't work because MemoryRouter doesn't change the view.
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('can render default view SummaryPage', async () => {
    // No need to mock useLocation as it is provided by MemoryRouter.
    // Simply provide the path and state via initialEntries.
    renderWithClient(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/summary',
            state: { sessionSummary: { score: 2, correctAnswerCount: 2 } },
          },
        ]}
      >
        <SummaryPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Game Over/)).toBeInTheDocument();
    expect(screen.getByText(/Final Score/i).nextElementSibling).toHaveTextContent('2');
    expect(screen.getByText(/^Correct$/i).previousElementSibling).toHaveTextContent('2');

    const homeButton = screen.getByRole('button', { name: /To Home/i });
    expect(homeButton).toBeInTheDocument();

    await userEvent.click(homeButton);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
