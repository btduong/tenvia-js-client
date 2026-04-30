import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll, afterEach } from 'vitest';
import App from '../App';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const typedUsername = "player1";

const validUser = { id: 2, username: "player1", createdAt: "2026-04-28T19:57:24.747338965", balance: 0, inventory: {} };

const restHandlers = [
    http.post('*/users/login', ({ request }) => {
        const url = new URL(request.url);
        const username = url.searchParams.get('username');
        console.log('MSW intercepted login for: ', username);
        return HttpResponse.json(validUser);
    })
]

const server = setupServer(...restHandlers);

describe('App Login Logic', () => {

    beforeAll(() => {
        server.listen();
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

});