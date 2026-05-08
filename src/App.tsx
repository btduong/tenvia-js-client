import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import appStyles from './App.module.css';

import Leaderboard from './pages/LeaderboardPage';
import SummaryPage from './features/SummaryPage/SummaryPage';
import Home from './components/Home';
import { GameProvider } from './context/GameContext';


import { useNavigate } from 'react-router-dom';
import type { AnswerResponse, GameSession, Question, User, PowerUpType, UsePowerUpResponse, GameStatus } from './types';
import { waitFor } from './utils/timer';
import { useTickingSound } from './hooks/useTickingSound';
import ShopPage from './pages/ShopPage';
import { useUser } from './hooks/useUser';
import QuizCardPage from './pages/QuizCardPage';
import { serviceApi } from './api/serviceApi';
import { StatusMessage } from './components/common/StatusMessage';

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>('IDLE');
  const [typedUsername, setTypedUsername] = useState("");
  const { user, loading, login, purchaseItem, updateBalance, updateInventory, isAuthenticated } = useUser();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [questionLimit, setQuestionLimit] = useState<number>(10); // How many questions per game
  const [sessionData, setSessionData] = useState<GameSession | null>(null);
  const [answerSent, setAnswerSent] = useState<boolean>(false);
  const [globalErrorMessage, setGlobalUserMessage] = useState<string>('');

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
        setGameStatus("PLAYING");
        getNextQuestion(gameSession.id);
        navigate('/quiz');
      }
    } else {
      setGameStatus('ERROR');
      triggerGlobalError(error.message);
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
      setGameStatus('ERROR');
    }
  };

  const handleLogin = async (name: string) => {
    setGameStatus('LOGGING_IN');
    const { data: user, error } = await login(name);
    if (user) {
      setGameStatus('IDLE');
    } else {
      triggerGlobalError(error.message);
      setGameStatus('UNAUTHENTICATED');
    }
  };

  const handleGameOver = () => {
    setGameStatus('GAME_OVER');
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
      setGameStatus('ERROR')
    }
    return powerUpResponse;
  };

  /**
   * Displaying a message on UI in case of an event failure ie fail to get a question from the server.
   * @returns a message
   */
  const UIMessage = () => {
    if (gameStatus == 'LOGGING_IN') return { message: "Logging in ...." };
    if (gameStatus == 'UNAUTHENTICATED') return { message: "Login failed ...." };
    // Placeholder error. Need to propagate the error message up from the ApiService layer to here.
    if (gameStatus == 'ERROR') return { message: 'Error..' };
    return null;
  }

  const triggerGlobalError = (message: string) => {
    setGameStatus('ERROR');
    setGlobalUserMessage(message);
  };

  const handleClearError = () => {
    setGameStatus('IDLE');
    setCurrentQuestion(null);
    setSessionData(null);
    setGlobalUserMessage('');
    navigate('/');
  }

  const statusMessageUI = UIMessage();

  const hasSession = Boolean(sessionData?.id);

  return (
    <div className={appStyles.mobileAppWrapper}>
      {statusMessageUI && (<StatusMessage status={gameStatus} message={globalErrorMessage} onClose={handleClearError} />)}
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
              currentQuestion && sessionData?.id ?
                (<GameProvider value={{
                  sessionId: sessionData.id,
                  inventory: user.inventory,
                  currentQuestion: currentQuestion,
                  handleUsePoweUp: handleUsePowerUp,
                  updateBalance: updateBalance,
                  onAnswerSent: onAnswerSent,
                  handleAnswer: handleAnswer,
                  triggerGlobalError: triggerGlobalError,
                }}>
                  <QuizCardPage answerSent={answerSent} sessionData={sessionData} currentQuestion={currentQuestion} currentIndex={currentIndex} questionLimit={questionLimit} onQuestionTimedout={onQuestionTimedout} />
                </GameProvider>)
                : <StatusMessage status={'LOGGING_IN'} message={'Fetching question...'} onClose={handleClearError} />
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
