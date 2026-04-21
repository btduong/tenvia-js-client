import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './QuizCard.module.css';

import { playClick, playCorrect, playIncorrectAnswer, playQuestionStart } from '../utils/sounds';
import HomeButton from './ui/HomeButton';

const NextButton = () => {

}

export default function QuizCard({ question, onResult, sessionId, inventory, onUsePowerUp, onBalanceUpdated }) {
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [result, setResult] = useState(null);
  const [hiddenOptionIds, setHiddenOptionIds] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [goldReward, setGoldReward] = useState(0);

  const isDisabled = question.powerUpDisabled;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Space' && selectedOptionId !== null && result === null) {
        handleVerify(selectedOptionId);
      } else if (result !== null) {
        onResult(result);
      }
    }

    // Listener to the window
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedOptionId, result]);

  // Use nagivator to different path ie /leaderboard, /home
  const navigate = useNavigate();

  const handlePowerUpClick = async (type) => {

    const effect = await onUsePowerUp(type);
    if (effect && type === 'FIFTY_FIFTY') {
      const toHideIds = effect.hiddenSelectionsIds;
      setHiddenOptionIds(toHideIds);
    } else if (effect && type === 'HAMMER') {
      const toHideIds = effect.hiddenSelectionsIds;
      setHiddenOptionIds(toHideIds);
    }

  };

  const handleVerify = async (optionId) => {
    try {
      const response = await fetch(`http://192.168.1.43:8080/sessions/${sessionId}/answer`, {
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
      setResult(data);
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
        {question.options.map((option) => {
          // CHECK: Should we skip rendering this specific option?
          // if (hiddenOptionIds.includes(option.id)) {
          //   return null; // This option disappears, but the loop continues
          // }
          let optionButtonStyle = styles.optionBtn;
          if (hiddenOptionIds.includes(option.id)) {
            optionButtonStyle = `${styles.optionDisabled}`;
          }
          else if (result !== null && option.letter === result.correctLetter) {
            optionButtonStyle = `${styles.optionCorrectBtn}`;
          }
          else if (result === null && selectedOptionId !== null && selectedOptionId === option.id) {
            optionButtonStyle = `${styles.optionSelected}`;
          }
          else if (result !== null && option.letter !== result.correctLetter && selectedOptionId === option.id) {
            optionButtonStyle = `${styles.optionIncorrectBtn}`;
          }

          return (
            <div className={styles.container} key={option.id}>
              <button className={`${optionButtonStyle} `}
                disabled={result !== null || hiddenOptionIds.includes(option.id)}
                onClick={() => {
                  setSelectedOptionId(option.id);
                  handleVerify(option.id);
                }
                }
              >
                {/* <span className={styles.optionCircle}>{option.letter}</span> */}
                <span className={styles.optionText}>{option.content}</span>
              </button>
            </div>
          );
        })}
      </div>
      {/* 3. Buttons Section */}
      <div style={{ marginTop: '10px' }}>
        {!result && (
          <>
            {Object.keys(inventory).length > 0 ?
              <div className="inventory-bar">
                <h4>Your Power-Ups:</h4>
                {Object.entries(inventory).map(([type, count]) => (
                  <button
                    key={type}
                    className="powerup-btn"
                    disabled={count <= 0 || isDisabled}
                    onClick={() => handlePowerUpClick(type)}
                  >
                    {type}: {count}
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
            disabled={!result}
            onClick={() => {
              onResult(result);
              playQuestionStart();
            }}>Next</button>
        </div>

      </nav>
      

    </div>
  );
}