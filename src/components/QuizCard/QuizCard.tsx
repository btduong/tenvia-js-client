import { GameStatus } from '@/types';
import { useState } from 'react';

import { serviceApi } from '@/api/serviceApi';
import HomeButton from '@/components/ui/HomeButton';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import type { AnswerResponse, PowerUpType, QuestionOption, QuestionPenaltyType, UsePowerUpResponse } from '@/types';
import {
  playClickSound,
  playCorrectAnswerSound,
  playIncorrectAnswerSound,
  playQuestionStartSound,
} from '@/utils/sounds';

import hammerIcon from '@/assets/icons/suit_diamonds.png';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { useGameStore } from '@/store/useGameStore';
import { useGameSessionErrors } from '@/hooks/useGameSessionErrors';
import { usePowerUp } from '@/hooks/usePowerUp';
import { useUser } from '@/hooks/useUser';
import { useGameManager } from '@/hooks/useGameManager';
import { useNavigate } from 'react-router-dom';

/**
 * A map to find icon for a given PowerUpType.
 */
const POWER_UP_TYPE_ICON_MAP: Record<PowerUpType, string> = {
  HAMMER: hammerIcon,
  FIFTY_FIFTY: hammerIcon,
  SWAP_QUESTION: hammerIcon,
};

/**
 * Reander the quiz which includes question text and options for answers
 */
const QuizCard: React.FC = () => {

  const gameStatus = useGameStore((state) => state.gameStatus);
  const inventory = useGameStore((state) => state.sessionData?.user?.inventory) || {};
  const sessionId = useGameStore((state) => state.sessionData?.id);
  const currentQuestion = useGameStore((state) => state.currentQuestion);

  const navigate = useNavigate();
  const { triggerGlobalError } = useGameSessionErrors();
  const { user, updateInventory, updateBalance } = useUser();
  const { handleAnswerResponse, onAnswerSent, handleGameOver } = useGameManager(user, updateInventory, navigate);
  const { handleUsePowerUp } = usePowerUp(user, updateInventory);
  const [selectedOptionId, setSelectedOptionId] = useState<number>(-1);
  const [answerResponse, setAnswerResponse] = useState<AnswerResponse | null>(null);
  const [canUsePowerUp, setCanUsePowerUp] = useState<boolean>(true);

  const handleSpaceKeyPressed = () => {
    if (answerResponse) {
      handleAnswerResponse(answerResponse);
    } else if (selectedOptionId > 0 && gameStatus !== GameStatus.VALIDATING_ANSWER) {
      // all answer option ids are positive
      handleVerify(selectedOptionId);
    }
  };

  useKeyboardShortcut(handleSpaceKeyPressed);

  /**
   * Activate a power-up item.
   *
   * @param type - the power up type ie hammer or 50-50
   */
  const handlePowerUpClick = async (type: PowerUpType) => {
    const usePowerUpResponse = await handleUsePowerUp(type);
    if (usePowerUpResponse) setCanUsePowerUp(usePowerUpResponse.effectResult.canUsePowerUps);
  };

  /**
   * Send a verification request with the selected option's id the server.
   * @param optionId - the id of the selected option
   */
  const handleVerify = async (optionId: number) => {
    // Stop the count down sound as soon as the answer is submitted.
    onAnswerSent();
    if (!sessionId) {
      triggerGlobalError('Cannot verify answer because sessionId is not valid');
      return;
    }

    try {
      const answerResponse = await serviceApi.validateSelectedAnswer(sessionId, optionId);
      if (answerResponse.isCorrect) {
        playCorrectAnswerSound();
      } else {
        playIncorrectAnswerSound();
      }
      setAnswerResponse(answerResponse);
      updateBalance(answerResponse.newBalance);
      if (answerResponse.isGameOver) {
        handleAnswerResponse(answerResponse);
      }
    } catch (error: any) {
      triggerGlobalError(error.message);
    }
  };

  /**
   * Decide a button style based on what selected answer option.
   * @param option - a question option button
   * @returns the style of the option button
   */
  const getOptionStyle = (option: QuestionOption) => {
    if (!option.isAvailable) {
      return "opacity-30 grayscale cursor-not-allowed bg-white text-black";
    }
    if (!answerResponse) {
      // selected an answer option but hasn't submitted yet
      return selectedOptionId === option.id
        ? "bg-orange-500 text-white hover:bg-orange-600 hover:text-white"
        : "bg-white text-black hover:bg-slate-100 hover:text-black";
    }
    if (option.letter === answerResponse.correctLetter) // selected and submitted answer option is the correct one
    {
      return "bg-green-500 text-white disabled:opacity-100";
    }
    if (option.letter !== answerResponse.correctLetter && selectedOptionId === option.id) {
      return "bg-red-500 text-white disabled:opacity-100";
    }
    return "bg-white text-black opacity-50 disabled:opacity-50"; // Dim unselected incorrect answers
  };

  const handleOptionSelect = (optionId: number) => {
    setSelectedOptionId(optionId);
    handleVerify(optionId);
  };

  const handlePowerUpActivate = (type: PowerUpType) => {
    handlePowerUpClick(type);
    playClickSound();
  };

  const handleNextQuestion = () => {
    if (answerResponse) {
      handleAnswerResponse(answerResponse);
      playQuestionStartSound();
    }
  };

  const onAbandonSession = async () => {
    if (sessionId) {
      const confirmLeave = window.confirm('Do you want to abandon current session?');
      if (!confirmLeave) {
        return false;
      }

      await serviceApi.abandon(sessionId);
    }

    handleGameOver();
    return true;
  };

  // Guard check to stop TS strict null check.
  if (!currentQuestion || !sessionId) return null;

  const activePowerUps =
    Object.keys(inventory).length === 0
      ? []
      : (Object.entries(inventory) as [PowerUpType, number][]).filter(([_, count]) => count > 0);
  const hasPowerUps = activePowerUps.length > 0;

  return (
    <div className="flex flex-col w-full px-4 pt-8 gap-5">
      {/* 1. Question Text*/}
      <QuestionHeader
        questionText={currentQuestion.questionText}
        potentialReward={currentQuestion.potentialReward}
        potentialPenalty={currentQuestion.potentialPenalty}
      />

      {/* 2. Options List */}
      <AnswerOptionList
        options={currentQuestion.options}
        answerResponse={answerResponse}
        isVerifying={gameStatus === GameStatus.VALIDATING_ANSWER}
        handleOptionSelect={handleOptionSelect}
        getOptionStyle={getOptionStyle}
      />
      {/* 3. PowerUpItems Section */}
      <PowerUpItemBar
        answerResponse={answerResponse}
        hasPowerUps={hasPowerUps}
        activePowerUps={activePowerUps}
        handlePowerUpActivate={handlePowerUpActivate}
        isDisabled={!canUsePowerUp}
      />
      {/* 4. Area for nav buttons ie home, next */}
      <ControlBar
        answerResponse={answerResponse}
        handleNextQuestion={handleNextQuestion}
        handleAbandonSession={onAbandonSession}
      />
    </div>
  );
};

const QuestionHeader = ({
  questionText,
  potentialReward,
  potentialPenalty,
}: {
  questionText: string;
  potentialReward: PowerUpType | null;
  potentialPenalty: QuestionPenaltyType | null;
}) => {
  return (
    <div className="flex flex-col items-start relative w-full px-2 mb-4">
      <div className="w-full text-2xl font-extrabold text-white tracking-tight leading-snug text-left drop-shadow-sm">{questionText}</div>

      {potentialReward && (
        <div className="flex flex-row items-center content-center gap-2 p-2">
          {<span className="text-black bg-amber-200"> {potentialReward}</span>}
        </div>
      )}

      {potentialPenalty && (
        <div className="flex flex-row items-center content-center gap-2 p-2">
          {<span className="bg-red-400 text-white"> {potentialPenalty}</span>}
        </div>
      )}
    </div>
  );
};

/**
 * Component at the bottm of the screen showing buttons like home or next button.
 */
const ControlBar = ({
  answerResponse,
  handleNextQuestion,
  handleAbandonSession,
}: {
  answerResponse: AnswerResponse | null;
  handleNextQuestion: () => void;
  handleAbandonSession: () => Promise<boolean> | boolean;
}) => {
  return (
    <nav className="fixed bottom-0 left-1/2 w-full -translate-x-1/2 px-5 flex items-center justify-between bg-background/95 backdrop-blur border-t">
      {/* left space */}
      <div className="flex-1"></div>
      {/* center space*/}
      <div className="flex-1 flex justify-center">
        <HomeButton handleAbandonSession={handleAbandonSession} />
      </div>
      {/* rigth space */}
      <div className="flex-1 flex justify-end">
        <Button
          variant="secondary"
          className="font-bold"
          disabled={!answerResponse}
          onClick={() => {
            if (answerResponse) {
              handleNextQuestion();
            }
          }}
        >
          Next
        </Button>
      </div>
    </nav>
  );
};

/**
 * The answer options of a question ie true/false or 4 options.
 */
const AnswerOptionList = ({
  options,
  answerResponse,
  isVerifying,
  handleOptionSelect,
  getOptionStyle,
}: {
  options: QuestionOption[];
  answerResponse: AnswerResponse | null;
  isVerifying: boolean;
  handleOptionSelect: (id: number) => void;
  getOptionStyle: (option: QuestionOption) => string | undefined;
}) => {
  return (
    <div className="grid grid-cols-1 gap-3 w-full mx-auto">
      {options.map((option: QuestionOption) => {
        const optionButtonStyle = getOptionStyle(option);
        return (
          <div className="w-full" key={option.id}>
            <Button
              className={`w-full h-auto py-5 whitespace-normal rounded-2xl border-none transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md ${optionButtonStyle}`}
              disabled={answerResponse !== null || !option.isAvailable || isVerifying}
              onClick={() => {
                handleOptionSelect(option.id);
              }}
            >
              <span className="text-center font-semibold text-base">{option.content}</span>
            </Button>
          </div>
        );
      })}
    </div>
  );
};

/**
 * The component to display power-up items owned by the players, if any.
 */
const PowerUpItemBar = ({
  answerResponse,
  hasPowerUps,
  activePowerUps,
  handlePowerUpActivate,
  isDisabled,
}: {
  answerResponse: AnswerResponse | null;
  hasPowerUps: boolean;
  activePowerUps: [PowerUpType, number][];
  handlePowerUpActivate: (type: PowerUpType) => void;
  isDisabled: boolean;
}) => {
  if (answerResponse || !hasPowerUps || isDisabled) return null;

  return (
    <div className="mt-4 flex flex-col items-center border-t pt-4">
      <h4 className="text-sm text-muted-foreground font-medium mb-3">Your Power-Ups</h4>
      <div className="flex gap-4">
        {activePowerUps.map(([type, _]) => (
          <Tooltip key={type}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="w-12 h-12 rounded-full border-2 hover:bg-primary/10 transition-colors"
                onClick={() => {
                  handlePowerUpActivate(type);
                }}
              >
                <img
                  src={POWER_UP_TYPE_ICON_MAP[type]}
                  className="block w-6 h-6"
                  alt={type}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{type}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default QuizCard;

