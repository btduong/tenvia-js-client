import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import appStyles from './App.module.css';

import QuizCard from './components/QuizCard';
import Leaderboard from './pages/LeaderboardPage';
import SummaryPage from './features/SummaryPage/SummaryPage';
import Home from './components/Home';
import ShopModal from './components/ShopModal';
import SessionTimer from './features/Quiz/SessionTimer';


import { useNavigate } from 'react-router-dom';
import type { AnswerResponse, GameSession, Question, User, PowerUpType, PowerUpEffect } from './types';
import { waitFor } from './utils/timer';
import { useTickingSound } from './hooks/useTickingSound';
import ShopPage from './pages/ShopPage';
import { useUser } from './hooks/useUser';


const App: React.FC = () => {
  const [typedUsername, setTypedUsername] = useState("");
  const { user, loading, login, purchaseItem, updateBalance, isAuthenticated} = useUser();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [questionLimit, setQuestionLimit] = useState<number>(10); // How many questions per game
  const [sessionData, setSessionData] = useState<GameSession | null>(null);
  const [answerSent, setAnswerSent] = useState<boolean>(false);

  // Sound hook
  const [isTicking, setIsTicking] = useState(false);
  useTickingSound(isTicking);

  const navigate = useNavigate();

  const startNewGame = async () => {
    if (!user) return;

    const res = await fetch(`http://localhost:8080/sessions/start?id=${user.id}&limit=${questionLimit}`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setSessionData(data);
      // Pass the data.id (sessionId) in here because
      // it is yet to be updated from setSessionId(data.id);
      getNextQuestion(data.id);
      navigate('/quiz');
    }
  };

  const onAnswerSent = () => {
    setAnswerSent(true);
    setIsTicking(false);
  }

  const getNextQuestion = async (currentSessionId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/sessions/${currentSessionId}/questions/next`);

      if (response.status == 410) {
        handleGameOver();
        return navigate('/'); //back to home
      }

      if (!response.ok) throw new Error('Failed to get next question');

      const questionData = await response.json();
      await waitFor(500);
      setCurrentQuestion(questionData);
      setAnswerSent(false);
      setIsTicking(true);

    } catch (error) {
      console.log("Fail to get next question");
    }
  };

  const handleGameOver = () => {
    setCurrentQuestion(null);
    setCurrentIndex(0);
    setSessionData(null);
    setIsTicking(false);
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

  const onQuestionTimedout = async () => {
    setIsTicking(false);

    if (sessionData?.id) {
      getNextQuestion(sessionData.id);
    }
  };

  const handleUsePowerUp = async (type: PowerUpType): Promise<PowerUpEffect | null> => {
    if (!user) return null;
    try {
      const response = await fetch(`http://localhost:8080/api/powerups/use?type=${type}&userId=${user.id}&sessionId=${sessionData.id}`, { method: 'POST' });

      if (response.ok) {
        const data = await response.json();
       // setUser(data.updatedUser); // This triggers a re-render of QuizCard with the new count
        return data.powerUpEffect;
      }
      return null;
    } catch (error) {
      console.error("Failed to use power-up", error);
      return null;
    }
  };

  const hasSession = Boolean(sessionData?.id);

  return (
    <div className={appStyles.mobileAppWrapper}>
      <Routes>
        <Route path="/" element={
          !user ?
            (<div className={appStyles.loginContainer}>
              <h2>Enter a name to play</h2>
              <input type='text' placeholder='Name' onChange={(e) => setTypedUsername(e.target.value)} />
              <button onClick={() => login(typedUsername)} disabled={!typedUsername.trim()}>Play</button>
            </div>
            ) : (
              <Home hasActivateSession={hasSession} onStartNewGame={startNewGame} />
            )
        } />

        {user && (
          <>

            <Route path="/shop" element={
              <ShopPage user={user} onPurchase={purchaseItem}/>
            } />

            <Route path="/quiz" element={
              currentQuestion ? (
                <>
                  <div className={appStyles.currentQuestionCount}>Question: {currentIndex + 1} / {questionLimit}</div>
                  {sessionData && sessionData.duration ?
                    (<SessionTimer
                      key={currentQuestion.id}
                      duration={currentQuestion.expiresInSecond}
                      isPause={answerSent}
                      onComplete={onQuestionTimedout} />)
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
                        onBalanceUpdated={updateBalance}
                        onAnswerSent={onAnswerSent} />
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
