import { create } from 'zustand';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export type GameState = 'WAITING' | 'ACTIVE' | 'RESULTS' | 'FINISHED';

export interface Player {
    id: number;
    username: string;
    score: number;
    answeredCurrentQuestion: boolean;
}

export interface QuestionOption {
    id: number;
    content: string;
    letter: string;
}

export interface Question {
    id: number;
    questionText: string;
    options: QuestionOption[];
    correctOptionId: number;
    expiresInSeconds: number;
}

export interface Lobby {
    lobbyId: string;
    hostId: number;
    players: Player[];
    gameState: GameState;
    currentQuestionIndex: number;
    currentQuestion?: Question;
}

interface MultiplayerState {
    client: Client | null;
    lobby: Lobby | null;
    connected: boolean;
    lastAnswerCorrect: boolean | null;
    selectedOptionId: number | null;
    connect: (token: string) => void;
    disconnect: () => void;
    joinLobby: (lobbyId: string, username: string) => void;
    startGame: () => void;
    submitAnswer: (isCorrect: boolean, optionId: number) => void;
}

export const useMultiplayerStore = create<MultiplayerState>((set, get) => ({
    client: null,
    lobby: null,
    connected: false,
    lastAnswerCorrect: null,
    selectedOptionId: null,

    connect: (token: string) => {
        if (get().client) return;

        const baseUrl = import.meta.env.VITE_APP_API_URL || 'http://localhost:8080';
        const client = new Client({
            webSocketFactory: () => new SockJS(`${baseUrl}/ws`),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            onConnect: () => {
                set({ connected: true });
            },
            onDisconnect: () => {
                set({ connected: false, lobby: null });
            },
            debug: (msg) => console.log('STOMP:', msg)
        });

        client.activate();
        set({ client });
    },

    disconnect: () => {
        const { client } = get();
        if (client) {
            client.deactivate();
            set({ client: null, connected: false, lobby: null });
        }
    },

    joinLobby: (lobbyId: string, username: string) => {
        const { client } = get();
        if (!client || !client.connected) return;

        // Subscribe to lobby updates
        client.subscribe(`/topic/lobby/${lobbyId}`, (message) => {
            const lobbyState = JSON.parse(message.body);
            set({ lobby: lobbyState });
        });

        // Send join message
        client.publish({
            destination: `/app/lobby/${lobbyId}/join`,
            body: JSON.stringify({ username })
        });
    },

    startGame: () => {
        const { client, lobby } = get();
        if (!client || !client.connected || !lobby) return;

        set({ lastAnswerCorrect: null, selectedOptionId: null });

        client.publish({
            destination: `/app/lobby/${lobby.lobbyId}/start`
        });
    },

    submitAnswer: (isCorrect: boolean, optionId: number) => {
        const { client, lobby } = get();
        if (!client || !client.connected || !lobby) return;

        set({ lastAnswerCorrect: isCorrect, selectedOptionId: optionId });

        client.publish({
            destination: `/app/lobby/${lobby.lobbyId}/answer`,
            body: JSON.stringify({ isCorrect })
        });
    }
}));
