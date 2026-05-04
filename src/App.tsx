import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import appStyles from './App.module.css';

import Leaderboard from './pages/LeaderboardPage';
import SummaryPage from './features/SummaryPage/SummaryPage';
import Home from './components/Home';


import { useNavigate } from 'react-router-dom';
import type { AnswerResponse, GameSession, Question, User, PowerUpType, UsePowerUpResponse } from './types';
import { waitFor } from './utils/timer';
import { useTickingSound } from './hooks/useTickingSound';
import ShopPage from './pages/ShopPage';
import { useUser } from './hooks/useUser';
import QuizCardPage from './pages/QuizCardPage';
import { serviceApi } from './api/serviceApi';

type GameStatus = 'IDLE' | 'UNAUTHENTICATED' | 'LOGGING_IN' | 'STARTING_SESSION' | 'LOADING' | 'PLAYING' | 'VALIDATING_ANSWER' | 'SUMMARY';


const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>('IDLE');
  const [typedUsername, setTypedUsername] = useState("");
  const { user, loading, login, purchaseItem, updateBalance, updateInventory, isAuthenticated } = useUser();
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

    // Rename 'data' to 'gameSession' during destructuring 
    const { data: gameSession, error } = await serviceApi.getNewSession(user.id, questionLimit);
    if (gameSession) {
      setSessionData(gameSession);
      if (gameSession?.id) {
        getNextQuestion(gameSession.id);
        navigate('/quiz');
      }
    } else {
      // Display error message on the UI to inform the player.
    }

  };

  const onAnswerSent = () => {
    setAnswerSent(true);
    setIsTicking(false);
  }

  const getNextQuestion = async (currentSessionId: string) => {
    const { data: question, error } = await serviceApi.getQuestion(currentSessionId);
    if (question) {
      await waitFor(500);
      setCurrentQuestion(question);
      setAnswerSent(false);
      setIsTicking(true);
    } else {
      // Display error message on the UI to inform the player.
    }
  };

  const handleLogin = async (name: string) => {
    setGameStatus('LOGGING_IN');
    const { data: user, error } = await login(name);
    if (user) {
      setGameStatus('IDLE');
    } else {
      setGameStatus('UNAUTHENTICATED');
    }
  };

  const handleGameOver = () => {
    setCurrentQuestion(null);
    setCurrentIndex(0);
    setSessionData(null);
    setIsTicking(false);
  };

  const handleAnswer = (answerResponse: AnswerResponse) => {
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

  const handleUsePowerUp = async (type: PowerUpType): Promise<UsePowerUpResponse | null> => {
    if (!user || !sessionData || !sessionData.id) return null;

    const { data: powerUpResponse, error } = await serviceApi.usePowerUp(type, user.id, sessionData.id);

    if (powerUpResponse) {

      updateInventory(powerUpResponse.updatedUser.inventory); // This triggers a re-render of QuizCard with the new count
    }
    else {
      // Display error message on the UI to inform the player.
    }
    return powerUpResponse;
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
              <button onClick={() => handleLogin(typedUsername)} disabled={!typedUsername.trim()}>Play</button>
            </div>
            ) : (
              <Home hasActivateSession={hasSession} onStartNewGame={startNewGame} />
            )
        } />

        {user && (
          <>

            <Route path="/shop" element={
              <ShopPage user={user} onPurchase={purchaseItem} />
            } />

            <Route path="/quiz" element={
              currentQuestion ? (
                <QuizCardPage currentQuestion={currentQuestion} currentIndex={currentIndex} questionLimit={questionLimit} sessionData={sessionData} answerSent={answerSent}
                  onQuestionTimedout={onQuestionTimedout} handleAnswer={handleAnswer} inventory={user.inventory} handleUsePowerUp={handleUsePowerUp} updateBalance={updateBalance} onAnswerSent={onAnswerSent} />
              ) : "should show a loading screen if the question is being fetched from server"

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
