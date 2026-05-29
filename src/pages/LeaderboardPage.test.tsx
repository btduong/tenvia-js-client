import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import LeaderboardPage from '@/pages/LeaderboardPage';

const mockData = [
  { userName: 'A', score: 1 },
  { userName: 'B', score: 2 },
];

const server = setupServer(
  http.get('*/leaderboard', () => {
    return HttpResponse.json(mockData);
  })
);

describe('leaderboard', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  beforeEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('can display table', async () => {
    render(
      <MemoryRouter>
        <LeaderboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Top 10 High Score/i)).toBeInTheDocument();

    const player1 = await screen.findByText('A');
    const player2 = await screen.findByText('B');

    expect(player1).toBeInTheDocument();
    expect(player2).toBeInTheDocument();
  });
});
