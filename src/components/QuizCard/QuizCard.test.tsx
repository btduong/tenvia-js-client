import { serviceApi } from '@/api/serviceApi';
import { useGameStore } from '@/store/useGameStore';
import type { PowerUpType } from '@/types';
import { GameStatus } from '@/types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { TooltipProvider } from '../ui/tooltip';
import QuizCard from './QuizCard';
import { renderWithClient } from '@/test/test-utils';
import { usePowerUp } from '@/hooks/usePowerUp';
import { useUser } from '@/hooks/useUser';
import { useGameManager } from '@/hooks/useGameManager';
import { useGameSessionErrors } from '@/hooks/useGameSessionErrors';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

/**
 * Needed for `vi.mocked(useGameStore).mockReturnValue(defaultGameContext)` to work in test.
 * This is due to vi 'hoisted' the vi.mock to the top of the file so vi.mocked...was never in the test.
 * Therefore this vi.mock here is mocking the 'module' GameContext and return a mock.
 * Then the vi.mocked...mockReturnValue can work as expected.
 */
vi.mock('@/store/useGameStore');
vi.mock('@/api/serviceApi');
vi.mock('@/hooks/usePowerUp');
vi.mock('@/hooks/useUser');
vi.mock('@/hooks/useGameManager');
vi.mock('@/hooks/useGameSessionErrors');

const mockQuestion = {
  id: 1,
  questionText: 'who are you',
  options: [
    { id: 10, letter: 'A', content: 'me', isAvailable: true },
    { id: 11, letter: 'B', content: 'you', isAvailable: true },
  ],
  powerUpDisabled: false,
  expiresInSecond: 10,
  index: 0,
  potentialReward: null,
  potentialPenalty: null,
};

const inventory = {
  HAMMER: 1,
  FIFTY_FIFTY: 1,
  SWAP_QUESTION: 0,
};

const mockHandleUsePowerUp = vi.fn();

const mockUpdateBalance = vi.fn();
const mockHandleAnswerResponse = vi.fn();
const mockOnAnswerSent = vi.fn();
const mockTriggerGlobalError = vi.fn();
const mockHandleGameOver = vi.fn();

const mockStoreState = {
  gameStatus: GameStatus.IDLE,
  currentQuestion: mockQuestion,
  sessionData: { id: '123', user: { inventory: inventory } },
  answerSent: false,
};

describe('QuizCard', () => {
  beforeAll(() => {
    window.HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve());
    window.HTMLMediaElement.prototype.pause = vi.fn(() => Promise.resolve());
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      return selector(mockStoreState);
    });

    vi.mocked(usePowerUp).mockReturnValue({
      handleUsePowerUp: mockHandleUsePowerUp
    } as any);

    vi.mocked(useUser).mockReturnValue({
      user: { id: '1', inventory },
      updateInventory: vi.fn(),
      updateBalance: mockUpdateBalance
    } as any);

    vi.mocked(useGameManager).mockReturnValue({
      handleAnswerResponse: mockHandleAnswerResponse,
      onAnswerSent: mockOnAnswerSent,
      handleGameOver: mockHandleGameOver
    } as any);

    vi.mocked(useGameSessionErrors).mockReturnValue({
      triggerGlobalError: mockTriggerGlobalError
    } as any);
  });

  it('can render default view when question is null', () => {
    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      return selector({ ...mockStoreState, currentQuestion: null })
    });

    const { container } = renderWithClient(<TooltipProvider><QuizCard /></TooltipProvider>);
    expect(container).toBeEmptyDOMElement();
  });

  it('can render question', () => {
    renderWithClient(<TooltipProvider><QuizCard /></TooltipProvider>);
    expect(screen.getByText('who are you')).toBeInTheDocument();
  });

  it('disables options when gameStatus is VALIDATING_ANSWER', () => {
    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      return selector({ ...mockStoreState, gameStatus: GameStatus.VALIDATING_ANSWER });
    });
    renderWithClient(<TooltipProvider><QuizCard /></TooltipProvider>);

    const optionButtons = [
      screen.getByRole('button', { name: 'me' }),
      screen.getByRole('button', { name: 'you' }),
    ];
    optionButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('expect power-up bar to be hidden after used a power-up item ', async () => {
    renderWithClient(<TooltipProvider><QuizCard /></TooltipProvider>);

    const useHammerPowerUpResponse = {
      updateUser: {},
      effectResult: {
        removeOptionIds: [1, 2],
        canUsePowerUps: false,
        appliedPowerUp: 'HAMMER',
      },
    };

    vi.mocked(mockHandleUsePowerUp).mockReturnValue(useHammerPowerUpResponse);

    expect(await screen.findByRole('button', { name: 'HAMMER' })).toBeInTheDocument();

    // The default power-up bar with a power-upitem in the inventory
    expect(screen.getByText(/Your Power-Ups/i)).toBeInTheDocument();

    const hammerButton = screen.getByRole('button', { name: 'HAMMER' });
    await userEvent.click(hammerButton);

    expect(mockHandleUsePowerUp).toHaveBeenCalled();

    // The usage limit is reached for current question so hide the power-up bar
    expect(screen.queryByText(/Your Power-Ups/i)).not.toBeInTheDocument();
  });

  it('can send validate request', async () => {
    renderWithClient(<TooltipProvider><QuizCard /></TooltipProvider>);

    const mockAnswerResponse = {
      correctLetter: 'A',
      newBalance: 8,
      isGameOver: false,
      summary: { score: 1, correctAnswerCount: 1, incorrectAnswerCount: 2, skipQuestionCount: 3 },
      isCorrect: false,
      currentQuestionIndex: 0,
      grantedItem: 'HAMMER' as PowerUpType,
      updatedInventory: { HAMMER: 1, FIFTY_FIFTY: 0, SWAP_QUESTION: 0 },
    };

    vi.mocked(serviceApi.validateSelectedAnswer).mockResolvedValue(mockAnswerResponse);

    const optionButton1 = screen.getByRole('button', { name: 'me' });

    const optionButtons = [
      screen.getByRole('button', { name: 'me' }),
      screen.getByRole('button', { name: 'you' }),
    ];
    optionButtons.forEach((button) => {
      expect(button).not.toBeDisabled();
      expect(button).toBeInTheDocument();
    });

    await userEvent.click(optionButton1);
    expect(serviceApi.validateSelectedAnswer).toHaveBeenCalledWith('123', 10);

    await waitFor(() => {
      expect(mockUpdateBalance).toHaveBeenCalledWith(8);
      expect(optionButton1).toBeDisabled();
    });
  });
});
