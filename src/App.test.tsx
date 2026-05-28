import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll, afterEach } from 'vitest';
import App from './App';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import ShopPage from './pages/ShopPage';
import { serviceApi } from './api/serviceApi';

const mockInventory = { 'HAMMER': 5, 'FIFTY_FIFTY': 1, 'SWAP_QUESTION': 1 };

const validUser = { id: 2, username: "player1", createdAt: "2026-04-28T19:57:24.747338965", balance: 0, inventory: mockInventory };
const validQuestion = {
    id: 1428,
    questionText: "questionText", options: [{ content: "A", id: 5371, letter: "A", isAvailable: true }],
    powerUpDisabled: false,
    expiresInSecond: 15
}

const validSession = { id: 'session123', duration: 15 };

const restHandlers = [
    http.post('*/users/login', ({ request }) => {
        const url = new URL(request.url);
        const username = url.searchParams.get('username');
        return HttpResponse.json(validUser);
    }),
    http.post('*/start', () => {
        return HttpResponse.json(validSession);
    }),
    http.get('*/questions/next', ({ request }) => {
        const url = new URL(request.url);
        return HttpResponse.json(validQuestion);
    })
]

const server = setupServer(...restHandlers);

vi.mock('./components/QuestionTimer/QuestionTimer', () => {
    return {
        default: ({ onComplete }: any) => {
            return (
                <div data-testid="mock-timer">
                    <button onClick={onComplete}>Force Timeout</button>
                </div>
            )
        }
    }
});

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

    it('can handle question timeout correctly', async () => {
        const audioSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);

        const validateSpy = vi.spyOn(serviceApi, 'validateSelectedAnswer');

        server.use(
            http.post('*/sessions/*/answer', () => {
                return HttpResponse.json({
                    correctLetter: "A",
                    newBalance: 8,
                    isGameOver: false,
                    summary: { score: 1, correctAnswerCount: 1, incorrectAnswerCount: 2, skipQuestionCount: 3 },
                    isCorrect: false,
                    currentQuestionIndex: 0,
                    grantedItem: 'HAMMER',
                    updatedInventory: { 'HAMMER': 1, 'FIFTY_FIFTY': 0, 'SWAP_QUESTION': 0 }
                });
            })
        );

        render(
            <MemoryRouter initialEntries={['/']}>
                <App />
            </MemoryRouter>
        );

        // Type in username
        const input = screen.getByPlaceholderText(/Name/);
        await userEvent.type(input, 'player1');

        // Click the player button
        const loginButton = screen.getByRole('button', { name: /Play/ });
        await userEvent.click(loginButton);

        await waitFor(() => {
            expect(screen.getByText(/New Game/i)).toBeInTheDocument();
        });

        const newGameButton = screen.getByRole('button', { name: /New Game/ });
        await userEvent.click(newGameButton);

        await waitFor(() => {
            expect(screen.getByText(/Question:/i)).toBeInTheDocument();
        });

        expect(audioSpy).toHaveBeenCalled();

        // Trigger timeout manually
        const timeoutButton = screen.getByRole('button', { name: /Force Timeout/ });
        await userEvent.click(timeoutButton);

        await waitFor(() => {
            expect(validateSpy).toHaveBeenCalledWith('session123', null);
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