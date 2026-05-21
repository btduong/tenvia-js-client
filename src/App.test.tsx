import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll, afterEach } from 'vitest';
import App from './App';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import ShopPage from './pages/ShopPage';

const typedUsername = "player1";

const mockInventory = { 'HAMMER': 5, 'FIFTY_FIFTY': 1, 'SWAP_QUESTION': 1 };

const validUser = { id: 2, username: "player1", createdAt: "2026-04-28T19:57:24.747338965", balance: 0, inventory: mockInventory };
const validQuestion = {
    id: 1428,
    questionText: "questionText", options: [{ 0: { content: "A", id: 5371, letter: "A" } }],
    powerUpDisabled: false,
    expiresInSecond: 15
}

const validSession = {};

const restHandlers = [
    http.post('*/users/login', ({ request }) => {
        const url = new URL(request.url);
        const username = url.searchParams.get('username');
        return HttpResponse.json(validUser);
    }),
    http.post('*/start', () => {
        return HttpResponse.json(validQuestion);
    }),
    http.get('*/questions/next', ({ request }) => {
        const url = new URL(request.url);
        return HttpResponse.json(validQuestion);
    })
]

const server = setupServer(...restHandlers);

describe('App Login', () => {

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'warn' });

        // Mock the audio functionlities
        window.HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve());
        window.HTMLMediaElement.prototype.pause = vi.fn(() => Promise.resolve());
    });

    afterAll(() => {
        server.close();
    });

    beforeEach(() => {
    });

    afterEach(() => {
        server.resetHandlers();
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
        render(
            <MemoryRouter initialEntries={['/']}>
                <App />
            </MemoryRouter>
        );

        expect(screen.getByPlaceholderText(/Name/i)).toBeInTheDocument();

        // Type in username
        const input = screen.getByPlaceholderText(/Name/);
        await userEvent.type(input, 'player1');

        // Click the player button
        const loginButton = screen.getByRole('button', { name: /Play/ });
        await userEvent.click(loginButton);


        // Verify a new game session is created and new game button is there
        // for player to start playing
        await waitFor(() => {
            expect(screen.getByText(/New Game/i)).toBeInTheDocument();
        });
    });

    it('can get first question', async () => {
        const audioSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);

        render(
            <MemoryRouter initialEntries={['/']}>
                <App />
            </MemoryRouter>
        );

        expect(screen.getByPlaceholderText(/Name/i)).toBeInTheDocument();

        // Type in username
        const input = screen.getByPlaceholderText(/Name/);
        await userEvent.type(input, 'player1');

        // Click the player button
        const loginButton = screen.getByRole('button', { name: /Play/ });
        await userEvent.click(loginButton);


        // Verify a new game session is created and new game button is there
        // for player to start playing
        await waitFor(() => {
            expect(screen.getByText(/New Game/i)).toBeInTheDocument();
        });

        const newGameButton = screen.getByRole('button', { name: /New Game/ });
        await userEvent.click(newGameButton);

        await waitFor(() => {
            expect(audioSpy).toHaveBeenCalled();
            expect(screen.getByText(/Question:/i)).toBeInTheDocument();
        });
    });

});

describe('can render /shop', () => {

    it('can click buy button', async () => {
        const mockPurchase = vi.fn();

        render(
            <MemoryRouter>
                <ShopPage user={validUser} onPurchase={mockPurchase} />
            </MemoryRouter>
        );

        const buyButtons = screen.getAllByRole('button', { name: /Buy/i });

        expect(screen.getByText(/Balance/i)).toBeInTheDocument();
        expect(buyButtons).toHaveLength(3);

        // Buy Hammer button
        await userEvent.click(buyButtons[0]!);
        expect(mockPurchase).toHaveBeenCalledWith(
            expect.stringContaining('HAMMER')
        );

        // Buy 50-50 button
        await userEvent.click(buyButtons[1]!);
        expect(mockPurchase).toHaveBeenCalledWith(
            expect.stringContaining('FIFTY_FIFTY')
        )
        expect(mockPurchase).toHaveBeenCalledTimes(2);

        // Buy Swap button
        await userEvent.click(buyButtons[2]!);
        expect(mockPurchase).toHaveBeenCalledWith(
            expect.stringContaining('SWAP_QUESTION')
        )
        expect(mockPurchase).toHaveBeenCalledTimes(3);
    });
});