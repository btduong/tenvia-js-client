import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import { MemoryRouter } from 'react-router-dom';

describe('App Login Logic', () => {


  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('renders default user login page without crashing', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    
    // Verify default user login is there
    expect(screen.getByPlaceholderText(/Name/i)).toBeInTheDocument();
  });

  it('successfully logs in and sets the user', async () => {
    const mockUser = { id: '123', username: 'player1', sessionId: 'abc-789' };

    // Setup the mock response for fetch
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockUser,
    });

    render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );

    // Type in username
    const input = screen.getByPlaceholderText(/Name/i);
    await userEvent.type(input, 'player1');

    // Click the player button
    const loginButton = screen.getByRole('button', { name: /play/i });
    await userEvent.click(loginButton);

    // Verify fetch request url
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('username=player1'),
      expect.objectContaining({ method: 'POST' })
    );


    // Verify a new game session is created and new game button is there
    // for player to start playing
    await waitFor(() => {
      expect(screen.getByText(/New Game/i)).toBeInTheDocument();
    });
  });
});