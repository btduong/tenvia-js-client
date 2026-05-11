import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './QuizCard.module.css';

import { playClickSound, playCorrectAnswerSound, playIncorrectAnswerSound, playQuestionStartSound } from '../utils/sounds';
import HomeButton from './ui/HomeButton';
import type { AnswerResponse, Inventory, PowerUpType, QuestionOption, Question, UsePowerUpResponse } from '../types';
import { serviceApi } from '../api/serviceApi';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';

import hammerIcon from '../assets/icons/suit_diamonds.png';
import { useGame } from '../context/GameContext';

/**
 * A map to find icon for a given PowerUpType.
 */
const POWER_UP_TYPE_ICON_MAP: Record<PowerUpType, string> = {
  HAMMER: hammerIcon,
  FIFTY_FIFTY: hammerIcon,
};

interface QuizCardProps {
}

type QuizCardStatus = 'IDLE' | 'WAITING_VERIFY' | 'FETCH_NEXT_QUESTION';

/**
 * Reander the quiz which includes question text and options for answers
 */
const QuizCard: React.FC<QuizCardProps> = () => {
  // Use nagivator to different path ie /leaderboard, /home
  const navigate = useNavigate();

  const { currentQuestion, sessionId, inventory, handleUsePoweUp, updateBalance, onAnswerSent, handleAnswerResponse, triggerGlobalError } = useGame();
  const [selectedOptionId, setSelectedOptionId] = useState<number>(-1);
  const [answerResponse, setAnswerResponse] = useState<AnswerResponse | null>(null);
  const [hiddenOptionIds, setHiddenOptionIds] = useState<number[]>([]);
  const [status, setStatus] = useState<QuizCardStatus>('IDLE');
  const [canUsePowerUp, setCanUsePowerUp] = useState<boolean>(true);

  useEffect(() => {
    setStatus('IDLE');
  }, [currentQuestion]);

  const handleSpaceKeyPressed = () => {
    if (answerResponse) {
      handleAnswerResponse(answerResponse);
    } else if (selectedOptionId > 0 && status !== 'WAITING_VERIFY') { // all answer option ids are positive
      setStatus('WAITING_VERIFY');
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
    if (usePowerUpResponse?.effectResult?.removeOptionIds) {
      setHiddenOptionIds(usePowerUpResponse.effectResult.removeOptionIds);
      setCanUsePowerUp(usePowerUpResponse.effectResult.canUsePowerUps);
    }
  };

  /**
   * Send a verification request with the selected option's id the server.
   * @param optionId - the id of the selected option
   */
  const handleVerify = async (optionId: number) => {
    // Stop the count down sound as soon as the answer is submitted.
    onAnswerSent();
    if (!sessionId) {
      triggerGlobalError("Cannot verify answer because sessionId is not valid");
      return;
    }

    const { data: answerResponse, error } = await serviceApi.validateSelectedAnswer(sessionId, optionId);
    if (answerResponse) {
      if (answerResponse.correct) {
        playCorrectAnswerSound();
      } else {
        playIncorrectAnswerSound();
      }
      setAnswerResponse(answerResponse);
      updateBalance(answerResponse.newBalance);
      if (answerResponse.isGameOver) {
        handleAnswerResponse(answerResponse);
        navigate('/summary', { state: { sessionSummary: answerResponse.summary } });
      }
    } else if (error) {
      triggerGlobalError(error.message);
    }
  };

  /**
   * Decide a button style based on what selected answer option.
   * @param option - a question option button
   * @returns the style of the option button
   */
  const getOptionStyle = (option: QuestionOption) => {
    if (hiddenOptionIds.includes(option.id)) {
      return styles.optionDisabled;
    }
    if (!answerResponse) { // selected an answer option but hasn't submitted yet
      return selectedOptionId === option.id ? styles.optionSelected : styles.optionBtn;
    }
    if (option.letter === answerResponse.correctLetter) // selected and submitted answer option is the correct one
    {
      return styles.optionCorrectBtn;
    }
    if (option.letter !== answerResponse.correctLetter && selectedOptionId === option.id) {
      return styles.optionIncorrectBtn;
    }
    return styles.optionBtn;
  }

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

  // Guard check to stop TS strict null check.
  if (!currentQuestion || !sessionId) return null;

  const activePowerUps = (Object.entries(inventory) as [PowerUpType, number][]).filter(([_, count]) => count > 0);
  const hasPowerUps = activePowerUps.length > 0;
  const isDisabled = currentQuestion.powerUpDisabled;

  return (
    <div className={styles.mainQuestionContainer}>
      {/* 1. Question Text*/}
      <div className={styles.questionText}>{currentQuestion.questionText}</div>
      {/* 2. Options List */}
      <AnswerOptionList options={currentQuestion.options} answerResponse={answerResponse} hiddenOptionIds={hiddenOptionIds} handleOptionSelect={handleOptionSelect} getOptionStyle={getOptionStyle} />
      {/* 3. PowerUpItems Section */}
      <PowerUpItemBar answerResponse={answerResponse} hasPowerUps={hasPowerUps} activePowerUps={activePowerUps} handlePowerUpActivate={handlePowerUpActivate} isDisabled={!canUsePowerUp} />
      {/* 4. Area for nav buttons ie home, next */}
      <ControlBar answerResponse={answerResponse} handleNextQuestion={handleNextQuestion} />
    </div>
  );
};

/**
 * Component at the bottm of the screen showing buttons like home or next button.
 */
const ControlBar = ({ answerResponse, handleNextQuestion }: { answerResponse: AnswerResponse | null, handleNextQuestion: () => void }) => {
  return (
    <nav className={styles.controlBar}>
      <hr />
      {/* left space */}
      <div className={styles.navSpacer}></div>
      {/* center space*/}
      <div className={styles.homeBtn}>

        <HomeButton />
      </div>
      {/* rigth space */}
      <div className={styles.navRight}>

        <button
          className={styles.nextBtn}
          disabled={!answerResponse}
          onClick={() => {
            if (answerResponse) {
              handleNextQuestion();
            }
          }}>Next</button>
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
  hiddenOptionIds,
  handleOptionSelect,
  getOptionStyle
}: {
  options: QuestionOption[],
  answerResponse: AnswerResponse | null,
  hiddenOptionIds: number[],
  handleOptionSelect: (id: number) => void,
  getOptionStyle: (option: QuestionOption) => string | undefined
}) => {
  return (
    <div className={styles.optionsContainer}>
      {options.map((option: QuestionOption) => {
        const optionButtonStyle = getOptionStyle(option);
        return (
          <div className={styles.container} key={option.id}>
            <button className={`${optionButtonStyle}`}
              disabled={answerResponse !== null || hiddenOptionIds.includes(option.id)}
              onClick={() => { handleOptionSelect(option.id); }}>
              {/* <span className={styles.optionCircle}>{option.letter}</span> */}
              <span className={styles.optionText}>{option.content}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};

/**
 * The component to display power-up items owned by the players, if any.
 */
const PowerUpItemBar = ({ answerResponse,
  hasPowerUps,
  activePowerUps,
  handlePowerUpActivate,
  isDisabled }:
  {
    answerResponse: AnswerResponse | null,
    hasPowerUps: boolean,
    activePowerUps: [PowerUpType, number][],
    handlePowerUpActivate: (type: PowerUpType) => void,
    isDisabled: boolean
  }) => {
  if (answerResponse || !hasPowerUps || isDisabled) return null;

  return (
    <div style={{ marginTop: '10px' }}>
      <>
        {<div className="inventory-bar">
          <h4>Your Power-Ups:</h4>
          {activePowerUps.map(([type, _]) => (
            <button
              key={type}
              className={styles.powerUpBtn}
              data-tooltip={type}
              onClick={() => { handlePowerUpActivate(type); }}
            >
              <img src={POWER_UP_TYPE_ICON_MAP[type]} className={styles.powerUpBtnIcon} alt={type} />
            </button>
          ))}
        </div>
        }
      </>
    </div>
  );
};

export default QuizCard;