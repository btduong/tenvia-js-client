import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import appStyles from './App.module.css';

import HomePage from './pages/HomePage';
import { GameProvider } from './context/GameContext';
import LeaderboardPage from './pages/LeaderboardPage';


import { useNavigate } from 'react-router-dom';
import { serviceApi } from './api/serviceApi';
import { StatusMessage } from './components/ui/StatusMessage';
import { useTickingSound } from './hooks/useTickingSound';
import { useUser } from './hooks/useUser';
import QuizCardPage from './pages/QuizCardPage';
import ShopPage from './pages/ShopPage';
import type { AnswerResponse, GameSession, GameStatus, PowerUpType, Question, UsePowerUpResponse } from './types';
import { waitFor } from './utils/timer';
import SummaryPage from './pages/SummaryPage';
import { LoginPage } from './pages/LoginPage';

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>('IDLE');

  const { user, loading, login, purchaseItem, updateBalance, updateInventory } = useUser();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionLimit, setQuestionLimit] = useState<number>(10); // How many questions per game
  const [sessionData, setSessionData] = useState<GameSession | null>(null);
  const [answerSent, setAnswerSent] = useState<boolean>(false);
  const [globalErrorMessage, setGlobalUserMessage] = useState<string>('');

  // Sound hook
  const [isTicking, setIsTicking] = useState(false);
  useTickingSound(isTicking);

  const navigate = useNavigate();

  /**
   * Logging in the game with a username.
   * @param name - name to display in the game
   */
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

  /**
   * Start a new game session for a logged in user
   * @returns a new GameSession
   */
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

  /**
   * Called when an answer is submitted.
   * This also stops any looping sounds.
   */
  const onAnswerSent = () => {
    setAnswerSent(true);
    setIsTicking(false);
  };

  /**
   * Get the next question.
   * @param sessionId 
   */
  const getNextQuestion = async (sessionId: string) => {
    const { data: question, error } = await serviceApi.getQuestion(sessionId);
    if (question) {
      await waitFor(500);
      setCurrentQuestion(question);
      setAnswerSent(false);
      setIsTicking(true);
    } else {
      setGameStatus('ERROR');
    }
  };

  /**
   * Reset the game state when the current game session is finished.
   */
  const handleGameOver = () => {
    setGameStatus('GAME_OVER');
    setCurrentQuestion(null);
    setSessionData(null);
    setIsTicking(false);
  };

  /**
   * Handles a received response after submitted an answer.
   * This needs to fetch the next question.
   * @param answerResponse
   */
  const handleAnswerResponse = (answerResponse: AnswerResponse) => {
    if (!answerResponse.isGameOver && sessionData?.id) {
      if (answerResponse.updatedInventory) {
        updateInventory(answerResponse.updatedInventory);
      }
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
      setCurrentQuestion(powerUpResponse.effectResult.questionResponse);
    }
    else {
      setGameStatus('ERROR')
    }
    return powerUpResponse;
  };

  const triggerGlobalError = (message: string) => {
    setGameStatus('ERROR');
    setGlobalUserMessage(message);
  };

  /**
   * Handles any unrecoverable errors that force the game session to finish.
   * This automtically reset the game state and move the player back to the main page.
   */
  const handleClearError = () => {
    setGameStatus('IDLE');
    setCurrentQuestion(null);
    setSessionData(null);
    setGlobalUserMessage('');
    navigate('/');
  };

  /**
   * Displaying a message on UI in case of an event failure ie fail to get a question from the server.
   * @returns a message
   */
  const UIMessage = () => {
    if (gameStatus == 'LOGGING_IN') return { message: "Logging in ...." };
    if (gameStatus == 'UNAUTHENTICATED') return { message: "Login failed ...." };
    if (gameStatus == 'ERROR') return { message: 'Error..' };
    return null;
  };

  const statusMessageUI = UIMessage();

  return (
    <div className={appStyles.mobileAppWrapper}>
      {statusMessageUI && (<StatusMessage status={gameStatus} message={statusMessageUI.toString() || globalErrorMessage} onClose={handleClearError} />)}
      <Routes>
        <Route path="/" element={
          !user ?
            (
              <LoginPage handleLogin={handleLogin} />
            ) : (
              <HomePage onStartNewGame={startNewGame} />
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
                  handleAnswerResponse: handleAnswerResponse,
                  triggerGlobalError: triggerGlobalError,
                  handleAbandonSession: handleGameOver,
                }}>
                  <QuizCardPage answerSent={answerSent} sessionData={sessionData} currentQuestion={currentQuestion} currentIndex={currentQuestion.index} questionLimit={questionLimit} onQuestionTimedout={onQuestionTimedout} />
                </GameProvider>)
                : <StatusMessage status={'LOGGING_IN'} message={'Fetching question...'} onClose={handleClearError} />
            } />

            <Route path="/summary" element={<SummaryPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />

          </>
        )}

      </Routes>
    </div>
  );
}
export default App
