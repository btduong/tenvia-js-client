import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import appStyles from './App.module.css';

import QuizCard from './components/QuizCard';
import Leaderboard from './components/Leaderboard';
import SummaryPage from './features/SummaryPage/SummaryPage';
import Home from './components/Home';
import ShopModal from './components/ShopModal';
import SessionTimer from './features/Quiz/SessionTimer';


import { useNavigate } from 'react-router-dom';
import type { AnswerResponse, GameSession, Question, User, PowerUpType, PowerUpEffect } from './types';


const App: React.FC = () => {
  const [typedUsername, setTypedUsername] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [questionLimit, setQuestionLimit] = useState<number>(10); // How many questions per game
  const [sessionData, setSessionData] = useState<GameSession | null>(null);

  const navigate = useNavigate();

  const startNewGame = async () => {
    if (!user) return;

    const res = await fetch(`http://localhost:8080/sessions/start?id=${user.id}&limit=${questionLimit}`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setSessionData(data);
      setLoading(false);
      // Pass the data.id (sessionId) in here because
      // it is yet to be updated from setSessionId(data.id);
      getNextQuestion(data.id);
      navigate('/quiz');
    }

  };

  const handleLogin = async () => {

    const res = await fetch(`http://localhost:8080/users/login?username=${typedUsername}`, { method: 'POST' });
    const data = await res.json();
    setUser(data);
  };


  const getNextQuestion = async (currentSessionId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/sessions/${currentSessionId}/questions/next`);

      if (response.ok) {
        const questionData = await response.json();
        setCurrentQuestion(questionData);
      }

    } catch (error) {
      console.log("Fail to get next question");
    }
  };

  const handleGameOver = () => {
    setCurrentQuestion(null);
    setCurrentIndex(0);
    setSessionData(null);
  };

  const handleAnswer = (answerResponse: AnswerResponse) => {
    // Progress to the next question
    // if (isCorrect) {
    if (!answerResponse.isGameOver && sessionData?.id) {

      setCurrentIndex(prev => prev + 1);
      getNextQuestion(sessionData.id);
    } else {
      handleGameOver();
    }
  };

  const handlePurchase = async (itemType: PowerUpType) => {
    if (!user) return;
    try {
      const url = `http://localhost:8080/shop/buy?userId=${user.id}&type=${itemType}`;

      const response = await fetch(url, {
        method: 'POST'
        // No 'body' or 'headers' needed because we are using @RequestParam
      });

      if (response.ok) {
        // 2. Fetch the updated user data to refresh the balance and inventory
        // Since the controller returns 'Void', we have to do a separate fetch 
        // or modify the controller to return the UserDTO.
        // refreshUserData();
        const newData = await response.json();
        setUser(previous => {
          if (!previous) return null;
          return ({ ...previous, inventory: newData.inventory })
        }
        );
      } else {
        alert("Purchase failed. Check your gold balance!");
      }
    } catch (err) {
      console.error("Connection error:", err);
    }
  };

  const handleBalanceUpdate = (newBalance: number) => {
    setUser(previous => {
      if (!previous) return null;
      return ({ ...previous, balance: newBalance })
    });
  };

  const handleUsePowerUp = async (type: PowerUpType): Promise<PowerUpEffect | null> => {
    if (!user) return null;
    try {
      const response = await fetch(`http://localhost:8080/api/powerups/use?type=${type}&userId=${user.id}&sessionId=${sessionId}`, { method: 'POST' });

      if (response.ok) {
        const data = await response.json();
        setUser(data.updatedUser); // This triggers a re-render of QuizCard with the new count
        return data.powerUpEffect;
      }
      return null;
    } catch (error) {
      console.error("Failed to use power-up", error);
      return null;
    }
  };

  let hasSession = false;
  if (sessionData?.id) {
    hasSession = true;
  } else {
    hasSession = false;
  }

  return (
    <div className={appStyles.mobileAppWrapper}>
      <Routes>
        <Route path="/" element={
          !user ?
            (<div className={appStyles.loginContainer}>
              <h2>Enter a name to play</h2>
              <input type='text' placeholder='Name' onChange={(e) => setTypedUsername(e.target.value)} />
              <button onClick={handleLogin} disabled={!typedUsername.trim()}>Play</button>
            </div>
            ) : (
              <Home hasActivateSession={hasSession} onStartNewGame={startNewGame} />
            )
        } />

        {user && (
          <>

            <Route path="/shop" element={
              <ShopModal
                user={user}
                onPurchase={(item: PowerUpType) => handlePurchase(item)} />
            } />

            <Route path="/quiz" element={


              currentQuestion ? (
                <>
                  <div className={appStyles.currentQuestionCount}>Question: {currentIndex + 1} / {questionLimit}</div>
                  {sessionData && sessionData.duration ?
                    (<SessionTimer
                      key={sessionData.duration}
                      duration={sessionData.duration} />)
                    : (<div></div>)
                  }
                  <div className={appStyles.quizPage}>
                    {sessionData && sessionData.id ?
                      <QuizCard
                        key={currentQuestion.id}
                        question={currentQuestion}
                        onResult={handleAnswer}
                        sessionId={sessionData.id}
                        inventory={user.inventory}
                        onUsePowerUp={handleUsePowerUp}
                        onBalanceUpdated={handleBalanceUpdate} />
                      : "Loading neq quiz card"}
                  </div>
                </>
              ) : "No question fetched"

            } />

            <Route path="/summary" element={<SummaryPage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />

          </>
        )}

      </Routes>
    </div>
  );
}
export default App
