import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './QuizCard.module.css';

export default function QuizCard({ question, onResult, sessionId, inventory, onUsePowerUp }) {
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [result, setResult] = useState(null);
  const [hiddenOptionIds, setHiddenOptionIds] = useState([]);

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
      const remainingIds = effect.hiddenSelectionsIds;
      // Find which IDs in our current question are NOT in the 'remaining' list
      const toHide = question.options
        .map(opt => opt.id)
        .filter(id => !remainingIds.includes(id));

      setHiddenOptionIds(toHide);
    } else if (effect && type === 'HAMMER') {
      const toHideIds = effect.hiddenSelectionsIds;
      const toHide = question.options.map(opt => opt.id).filter(id => toHideIds.includes(id));
      console.log('toHide:' + toHide);
      setHiddenOptionIds(toHide);
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
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
      {/* 1. Question Text stays visible */}
      <p><strong>{question.questionText}</strong></p>

      {/* 2. Options List */}
        {question.options.map((option) => {
          // CHECK: Should we skip rendering this specific option?
          if (hiddenOptionIds.includes(option.id)) {
            return null; // This option disappears, but the loop continues
          }

          return (
            <div className={styles.container} key={option.id}>
              <button className={`${styles.optionBtn} ${selectedOptionId === option.id ? styles.selected : ''}`}
              style={{ 
                visibility: hiddenOptionIds.includes(option.id) ? 'hidden' : 'visible',
                pointerEvents: hiddenOptionIds.includes(option.id) ? 'none' : 'auto'
              }}
                // id={`opt-${option.id}`}
                // name={`q-${question.id}`}
                disabled={result !== null}
                onClick={() => setSelectedOptionId(option.id)}
              >
              {option.content}
              </button>
            </div>
          );
        })}

      {/* 3. Buttons Section */}
      <div style={{ marginTop: '10px' }}>
        {!result && (
          <>
            <button className='submitBtn' onClick={handleVerify} disabled={!selectedOptionId}>
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
                  disabled={count <= 0}
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
          <p>{result.correct ? "ĐÚNG!" : "SAI!"}</p>
          <p>Giải thích: {result.explanation}</p>

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