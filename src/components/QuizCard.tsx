import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './QuizCard.module.css';

import { playClick, playCorrect, playIncorrectAnswer, playQuestionStart } from '../utils/sounds';
import HomeButton from './ui/HomeButton';
import type { AnswerResponse, Inventory, PowerUpType, QuestionOption, Question, UsePowerUpResponse } from '../types';
import { serviceApi } from '../api/serviceApi';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';

interface QuizCardProps {
  question: Question;
  onResult: (result: AnswerResponse) => void;
  sessionId: string;
  inventory: Inventory;
  onUsePowerUp: (powerUpType: PowerUpType) => Promise<UsePowerUpResponse | null>;
  onBalanceUpdated: (newBalance: number) => void;
  onAnswerSent: () => void;
}

const QuizCard: React.FC<QuizCardProps> = ({ question, onResult, sessionId, inventory, onUsePowerUp, onBalanceUpdated, onAnswerSent }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<number>(-1);
  const [answerResponse, setAnswerResponse] = useState<AnswerResponse | null>(null);
  const [hiddenOptionIds, setHiddenOptionIds] = useState<number[]>([]);

  const isDisabled = question.powerUpDisabled;


  // Use nagivator to different path ie /leaderboard, /home
  const navigate = useNavigate();

  const handleSpaceKeyPressed = () => {
    if (answerResponse) {
      onResult(answerResponse);
    } else if (selectedOptionId < 0) { // all answer option ids are positive
      handleVerify(selectedOptionId);
    }
  }

  useKeyboardShortcut(handleSpaceKeyPressed);

  const handlePowerUpClick = async (type: PowerUpType) => {
    const effect = await onUsePowerUp(type);
    if (effect && type === 'FIFTY_FIFTY') {
      const toHideIds = effect.powerUpEffect.hiddenSelectionsIds;
      setHiddenOptionIds(toHideIds);
    } else if (effect && type === 'HAMMER') {
      const toHideIds = effect.powerUpEffect.hiddenSelectionsIds;
      setHiddenOptionIds(toHideIds);
    }
  };

  const handleVerify = async (optionId: number) => {
    // Stop the count down sound as soon as the answer is submitted.
    onAnswerSent();
    const { data: answerResponse, error } = await serviceApi.validateSelectedAnswer(sessionId, optionId);
    if (answerResponse) {
      if (answerResponse.correct) {
        playCorrect();
      } else {
        playIncorrectAnswer();
      }
      setAnswerResponse(answerResponse);
      onBalanceUpdated(answerResponse.newBalance);
      if (answerResponse.isGameOver) {
        onResult(answerResponse);
        navigate('/summary', { state: { sessionSummary: answerResponse.summary } });
      }
    } else if (error) {
      // Display error message on the UI to inform the player.
    }
  };

  /**
   * Decide a button style based on what selected answer option.
   * @param option
   * @returns 
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

  return (
    <div className={styles.mainQuestionContainer}>
      {/* 1. Question Text stays visible */}
      <div className={styles.questionText}>{question.questionText}</div>

      {/* 2. Options List */}
      <div className={styles.optionsContainer}>
        {question.options.map((option: QuestionOption) => {
          const optionButtonStyle = getOptionStyle(option);

          return (
            <div className={styles.container} key={option.id}>
              <button className={`${optionButtonStyle} `}
                disabled={answerResponse !== null || hiddenOptionIds.includes(option.id)}
                onClick={() => {
                  setSelectedOptionId(option.id);
                  handleVerify(option.id);
                }}>
                {/* <span className={styles.optionCircle}>{option.letter}</span> */}
                <span className={styles.optionText}>{option.content}</span>
              </button>
            </div>
          );
        })}
      </div>
      {/* 3. Buttons Section */}
      <div style={{ marginTop: '10px' }}>
        {!answerResponse && (
          <>
            {Object.keys(inventory).length > 0 ?
              <div className="inventory-bar">
                <h4>Your Power-Ups:</h4>
                {(Object.entries(inventory) as [PowerUpType, number][]).map(([type, count]) => (
                  <button
                    key={type}
                    className="powerup-btn"
                    disabled={count <= 0 || isDisabled}
                    onClick={() => handlePowerUpClick(type)}>{type}: {count}
                  </button>
                ))}
              </div>
              : <></>
            }

          </>
        )}
      </div>

      {/* 4. Result Section stays at the bottom and next question button */}
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
                onResult(answerResponse);
              }
              playQuestionStart();
            }}>Next</button>
        </div>
      </nav>
    </div>
  );
}

export default QuizCard;