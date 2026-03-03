import { useState } from 'react';

export default function QuizCard({ question }) {
    const [selectedOptionId, setSelectedOptionId] = useState(null);
    const [result, setResult] = useState(null);

    const [hiddenOptionIds, setHiddenOptionIds] = useState([]);

    const handleFiftyFifty = async () => {
        const response = await fetch(`http://localhost:8080/questions/${question.id}/fifty-fifty`, {
            method: 'POST'
        });
        const remainingIds = await response.json();

        // Find which IDs in our current question are NOT in the 'remaining' list
        const toHide = question.options
            .map(opt => opt.id)
            .filter(id => !remainingIds.includes(id));

        setHiddenOptionIds(toHide);
    };

    const handleVerify = async () => {
        try {
            const response = await fetch('http://localhost:8080/questions/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionId: question.id,
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
                
                <button 
                  type="button" 
                  onClick={handleFiftyFifty} 
                  disabled={hiddenOptionIds.length > 0} // Disable if already used
                  style={{ marginLeft: '10px' }}
                >
                  50/50 Lifeline
                </button>
              </>
            )}
          </div>
    
          {/* 4. Result Section stays at the bottom */}
          {result && (
            <div style={{ marginTop: '10px', color: result.correct ? 'green' : 'red' }}>
              <hr />
              <p>{result.correct ? "ĐÚNG!" : "SAI!"}</p>
              <p>Giải thích: {result.explanation}</p>
            </div>
          )}
        </div>
      );
}