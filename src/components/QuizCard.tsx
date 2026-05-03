import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './QuizCard.module.css';

import { playClick, playCorrect, playIncorrectAnswer, playQuestionStart } from '../utils/sounds';
import HomeButton from './ui/HomeButton';
import type { AnswerResponse, Inventory, PowerUpEffect, PowerUpType, QuestionOption, Question } from '../types';

interface QuizCardProps {
  question: Question;
  onResult: (result: AnswerResponse) => void;
  sessionId: string;
  inventory: Inventory;
  onUsePowerUp: (powerUpType: PowerUpType) => Promise<PowerUpEffect | null>;
  onBalanceUpdated: (newBalance: number) => void;
  onAnswerSent: () => void;
}

const QuizCard: React.FC<QuizCardProps> = ({ question, onResult, sessionId, inventory, onUsePowerUp, onBalanceUpdated, onAnswerSent }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<number>(-1);
  const [answerResponse, setAnswerResponse] = useState<AnswerResponse | null>(null);
  const [hiddenOptionIds, setHiddenOptionIds] = useState<number[]>([]);

  const isDisabled = question.powerUpDisabled;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Space' && selectedOptionId !== null && answerResponse === null) {
        handleVerify(selectedOptionId);
      } else if (answerResponse !== null) {
        onResult(answerResponse);
      }
    }

    // Listener to the window
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedOptionId, answerResponse]);

  // Use nagivator to different path ie /leaderboard, /home
  const navigate = useNavigate();

  const handlePowerUpClick = async (type: PowerUpType) => {

    const effect = await onUsePowerUp(type);
    if (effect && type === 'FIFTY_FIFTY') {
      const toHideIds = effect.hiddenSelectionsIds;
      setHiddenOptionIds(toHideIds);
    } else if (effect && type === 'HAMMER') {
      const toHideIds = effect.hiddenSelectionsIds;
      setHiddenOptionIds(toHideIds);
    }

  };

  const handleVerify = async (optionId: number) => {
    try {
      onAnswerSent();
      const response = await fetch(`http://localhost:8080/sessions/${sessionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedOptionId: optionId
        })
      });
      const data = await response.json();
      if (data.correct) {
        playCorrect();
      } else {
        playIncorrectAnswer();
      }
      setAnswerResponse(data);
      onBalanceUpdated(data.newBalance);
      if (data.isGameOver) {
        onResult(data);
        navigate('/summary', { state: { sessionSummary: data.summary } });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className={styles.mainQuestionContainer}>
      {/* 1. Question Text stays visible */}
      <div className={styles.questionText}>{question.questionText}</div>

      {/* 2. Options List */}
      <div className={styles.optionsContainer}>
        {question.options.map((option: QuestionOption) => {
          let optionButtonStyle = styles.optionBtn;
          if (hiddenOptionIds.includes(option.id)) {
            optionButtonStyle = `${styles.optionDisabled}`;
          }
          else if (answerResponse !== null && option.letter === answerResponse.correctLetter) {
            optionButtonStyle = `${styles.optionCorrectBtn}`;
          }
          else if (answerResponse === null && selectedOptionId !== null && selectedOptionId === option.id) {
            optionButtonStyle = `${styles.optionSelected}`;
          }
          else if (answerResponse !== null && option.letter !== answerResponse.correctLetter && selectedOptionId === option.id) {
            optionButtonStyle = `${styles.optionIncorrectBtn}`;
          }

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