import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './QuizCard.module.css';

export default function QuizCard({ question, onResult, sessionId, inventory, onUsePowerUp, onBalanceUpdated }) {
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [result, setResult] = useState(null);
  const [hiddenOptionIds, setHiddenOptionIds] = useState([]);
  const [correctLetter, setCorrectLetter] = useState(null);
  const [goldReward, setGoldReward] = useState(0);

  const isDisabled = question.powerUpDisabled;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && selectedOptionId !== null && result === null) {
        handleVerify();
      } else if (result !== null) {
        onResult();
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
      // const toHide = question.options
      //   .map(opt => opt.id)
      //   .filter(id => !toHideIds.includes(id));
      setHiddenOptionIds(toHideIds);
    } else if (effect && type === 'HAMMER') {
      const toHideIds = effect.hiddenSelectionsIds;
      // const toHide = question.options.map(opt => opt.id).filter(id => toHideIds.includes(id));
      setHiddenOptionIds(toHideIds);
    }

  };

  const handleVerify = async () => {
    try {
      const response = await fetch(`http://localhost:8080/sessions/${sessionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedOptionId: selectedOptionId
        })
      });
      const data = await response.json();
      setResult(data);
      onBalanceUpdated(data.newBalance);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
      {/* 1. Question Text stays visible */}
      <h2 className="{style.questionText}">{question.questionText}</h2>

      {/* 2. Options List */}
      <div className={styles.optionsContainer}>
        {question.options.map((option) => {
          // CHECK: Should we skip rendering this specific option?
          // if (hiddenOptionIds.includes(option.id)) {
          //   return null; // This option disappears, but the loop continues
          // }
          let optionButtonStyle = styles.optionBtn;
          if (result !== null && option.letter === result.correctLetter) {
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
                // style={{ 
                //   visibility: hiddenOptionIds.includes(option.id) ? 'hidden' : 'visible',
                //   pointerEvents: hiddenOptionIds.includes(option.id) ? 'none' : 'auto'
                // }}
                disabled={result !== null || hiddenOptionIds.includes(option.id)}
                onClick={() => setSelectedOptionId(option.id)}
              >
                <span className={styles.optionCircle}>{option.letter}</span> 
                <span className={styles.questionText}>{option.content}</span>
              </button>
            </div>
          );
        })}
      </div>
      {/* 3. Buttons Section */}
      <div style={{ marginTop: '10px' }}>
        {!result && (
          <>
            <button className={styles.submitBtn} onClick={handleVerify} disabled={!selectedOptionId}>
              Kiểm tra
            </button>

            {/* <button 
                  type="button" 
                  onClick={handleFiftyFifty} 
                  disabled={fiftyFiftyUsed} // Disable if already used
                  style={{ marginLeft: '10px' }}
                >
                  50/50 Lifeline
                </button> */}
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
          </>
        )}
      </div>

      {/* 4. Result Section stays at the bottom and next question button */}
      {result && (
        <div style={{ marginTop: '10px', color: result.correct ? 'green' : 'red' }}>
          <hr />
          {/* <p>{result.correct ? "ĐÚNG!" : "SAI!"}</p>
          <p>Giải thích: {result.explanation}</p> */}

          {/* Next question button */}
          <button
            className="next-btn"
            onClick={() => onResult()}
          >
            Next question
          </button>
        </div>
      )}
      <button onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );
}