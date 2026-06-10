import { GameStatus } from '@/types';
import { useState } from 'react';

import { serviceApi } from '@/api/serviceApi';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import type { AnswerResponse, PowerUpType, QuestionOption, QuestionPenaltyType } from '@/types';
import {
  playClickSound,
  playCorrectAnswerSound,
  playIncorrectAnswerSound,
  playQuestionStartSound,
} from '@/utils/sounds';
import HomeButton from '@/components/ui/HomeButton';

import hammerIcon from '@/assets/icons/suit_diamonds.png';
import { useGameContext } from '@/context/GameContext';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Card, CardContent } from '../ui/card';

/**
 * A map to find icon for a given PowerUpType.
 */
const POWER_UP_TYPE_ICON_MAP: Record<PowerUpType, string> = {
  HAMMER: hammerIcon,
  FIFTY_FIFTY: hammerIcon,
  SWAP_QUESTION: hammerIcon,
};

interface QuizCardProps { }

/**
 * Reander the quiz which includes question text and options for answers
 */
const QuizCard: React.FC<QuizCardProps> = () => {
  const {
    gameStatus,
    currentQuestion,
    sessionId,
    inventory,
    handleUsePoweUp,
    updateBalance,
    onAnswerSent,
    handleAnswerResponse,
    triggerGlobalError,
    handleAbandonSession,
  } = useGameContext();
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
    const usePowerUpResponse = await handleUsePoweUp(type);
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
      return "opacity-30 grayscale cursor-not-allowed";
    }
    if (!answerResponse) {
      // selected an answer option but hasn't submitted yet
      return selectedOptionId === option.id ? "bg-orange-600 text-white hover:bg-orange-700 hover:text-white border-orange-600" : "hover:bg-orange-600 hover:text-white hover:border-orange-600";
    }
    if (option.letter === answerResponse.correctLetter) // selected and submitted answer option is the correct one
    {
      return "bg-green-600 text-white border-green-600 dark:bg-green-500 dark:border-green-500";
    }
    if (option.letter !== answerResponse.correctLetter && selectedOptionId === option.id) {
      return "bg-red-700 text-white border-red-700";
    }
    return "opacity-50"; // "blur" incorrect answers
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

    handleAbandonSession();
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
    <div className="flex flex-col items-center relative w-full">
      <Card className="mx-auto w-full max-w-sm">
        <CardContent>
          <div className="w-full pt-5 text-xl">{questionText}</div>
        </CardContent>
      </Card>

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
    <nav className="fixed bottom-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 px-5 flex items-center justify-between h-[70px] bg-background/95 backdrop-blur border-t">
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
              variant="outline"
              className={`w-full h-auto py-6 whitespace-normal rounded-xl border-black border-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-100 ${optionButtonStyle}`}
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
