import { GameStatus } from '@/types';
import { useMemo } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import appStyles from './App.module.css';
import { StatusMessage } from './components/ui/StatusMessage';
import { GameProvider } from './context/GameContext';
import { useGameSession } from './hooks/useGameSession';
import { useUser } from './hooks/useUser';
import HomePage from './pages/HomePage';
import LeaderboardPage from './pages/LeaderboardPage';
import { LoginPage } from './pages/LoginPage';
import QuizCardPage from './pages/QuizCardPage';
import ShopPage from './pages/ShopPage';
import SummaryPage from './pages/SummaryPage';

const App: React.FC = () => {

  const navigate = useNavigate();
  const { user, loading, login, purchaseItem, updateBalance, updateInventory } = useUser();

  const { gameStatus, setGameStatus,
    currentQuestion, sessionData, answerSent, questionLimit, globalErrorMessage,
    startNewGame, onAnswerSent, handleAnswerResponse, onQuestionTimedout,
    handleUsePowerUp, triggerGlobalError, handleClearError, handleGameOver } = useGameSession(user, updateInventory, navigate);

  const contextValue = useMemo(() => ({
    gameStatus: gameStatus,
    sessionId: sessionData?.id || null,
    inventory: user?.inventory || ({} as any),
    currentQuestion: currentQuestion,
    handleUsePoweUp: handleUsePowerUp,
    updateBalance: updateBalance,
    onAnswerSent: onAnswerSent,
    handleAnswerResponse: handleAnswerResponse,
    triggerGlobalError: triggerGlobalError,
    handleAbandonSession: handleGameOver,
  }), [
    gameStatus,
    sessionData?.id,
    user?.inventory,
    currentQuestion,
    handleUsePowerUp,
    updateBalance,
    onAnswerSent,
    handleAnswerResponse,
    triggerGlobalError,
    handleGameOver
  ]);
  /**
   * Logging in the game with a username.
   * @param name - name to display in the game
   */
  const handleLogin = async (name: string) => {
    setGameStatus(GameStatus.LOGGING_IN);
    const { data: user, error } = await login(name);
    if (user) {
      setGameStatus(GameStatus.IDLE);
    } else {
      triggerGlobalError(error.message);
      setGameStatus(GameStatus.UNAUTHENTICATED);
    }
  };


  /**
   * Displaying a message on UI in case of an event failure ie fail to get a question from the server.
   * @returns a message
   */
  const UIMessage = (): string | null => {
    if (gameStatus == GameStatus.LOGGING_IN) return "Logging in ....";
    if (gameStatus == GameStatus.UNAUTHENTICATED) return "Login failed ....";
    if (gameStatus == GameStatus.FETCHING_QUESTION) return "Fetching question...";
    if (gameStatus == GameStatus.ERROR) return globalErrorMessage || 'An unknown error occurred.'
    return null;
  };

  const statusMessageUI = UIMessage();

  return (
    <div className={appStyles.mobileAppWrapper}>
      {statusMessageUI && (<StatusMessage status={gameStatus} message={statusMessageUI} onClose={handleClearError} />)}
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
                (<GameProvider value={contextValue}>
                  <QuizCardPage answerSent={answerSent} sessionData={sessionData} currentQuestion={currentQuestion} currentIndex={currentQuestion.index} questionLimit={questionLimit} onQuestionTimedout={onQuestionTimedout} />
                </GameProvider>)
                : <div />
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
