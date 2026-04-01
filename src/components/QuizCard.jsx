import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function QuizCard({ question, onResult, sessionId, inventory, onUsePowerUp }) {
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [result, setResult] = useState(null);
  const [hiddenOptionIds, setHiddenOptionIds] = useState([]);

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
      <form>
        {question.options.map((option) => {
          // CHECK: Should we skip rendering this specific option?
          if (hiddenOptionIds.includes(option.id)) {
            return null; // This option disappears, but the loop continues
          }

          return (
            <div key={option.id}>
              <input
                type="radio"
                id={`opt-${option.id}`}
                name={`q-${question.id}`}
                disabled={result !== null}
                onChange={() => setSelectedOptionId(option.id)}
              />
              <label htmlFor={`opt-${option.id}`}> {option.content}</label>
            </div>
          );
        })}
      </form>

      {/* 3. Buttons Section */}
      <div style={{ marginTop: '10px' }}>
        {!result && (
          <>
            <button onClick={handleVerify} disabled={!selectedOptionId}>
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
            onClick={() => onResult(result.correct)}
          >
            Next question
          </button>
        </div>
      )}
      <button onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );
}