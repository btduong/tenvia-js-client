import { GameStatus, type Inventory } from '@/types';
import { useMemo } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { StatusMessage } from './components/ui/StatusMessage';
import { TooltipProvider } from './components/ui/tooltip';
import { useGameSession } from './hooks/useGameSession';
import { useUser } from './hooks/useUser';
import HomePage from './pages/HomePage';
import LeaderboardPage from './pages/LeaderboardPage';
import { LoginPage } from './pages/LoginPage';
import QuizCardPage from './pages/QuizCardPage';
import SummaryPage from './pages/SummaryPage';
import { useGameSessionErrors } from './hooks/useGameSessionErrors';
import { useGameStore } from './store/useGameStore';

const App: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, login, purchaseItem, updateBalance, updateInventory } = useUser();
  const { triggerGlobalError, handleClearError } = useGameSessionErrors();
  const setGameStatus = useGameStore((state) => state.setGameStatus);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const globalErrorMessage = useGameStore((state) => state.globalErrorMessage);
  const currentQuestion = useGameStore((state) => state.currentQuestion);
  const sessionData = useGameStore((state) => state.sessionData);

  const onHandleClearError = () => {
    handleClearError();
    navigate('/');
  }

  /**
   * Logging in the game with a username.
   * @param name - name to display in the game
   */
  const handleLogin = async (name: string) => {
    setGameStatus(GameStatus.LOGGING_IN);
    try {
      await login(name);
      setGameStatus(GameStatus.IDLE);
    } catch (error: any) {
      triggerGlobalError(error.message);
      setGameStatus(GameStatus.UNAUTHENTICATED);
    }
  };

  /**
   * Displaying a message on UI in case of an event failure ie fail to get a question from the server.
   * @returns a message
   */
  const UIMessage = (): string | null => {
    if (gameStatus == GameStatus.LOGGING_IN) return 'Logging in ....';
    if (gameStatus == GameStatus.UNAUTHENTICATED) return 'Login failed ....';
    if (gameStatus == GameStatus.FETCHING_QUESTION) return 'Fetching question...';
    if (gameStatus == GameStatus.ERROR) return globalErrorMessage || 'An unknown error occurred.';
    return null;
  };

  const statusMessageUI = UIMessage();

  return (
    <div className="w-full mx-auto min-h-screen flex flex-col relative bg-background overflow-x-hidden shadow-2xl text-foreground">
      {statusMessageUI && (
        <StatusMessage status={gameStatus} message={statusMessageUI} onClose={onHandleClearError} />
      )}
      <TooltipProvider>
        <Routes>
          <Route
            path="/"
            element={
              !user ? (
                <LoginPage handleLogin={handleLogin} />
              ) : (
                <HomePage />
              )
            }
          />


          {/* <Route path="/shop" element={<ShopPage user={user} onPurchase={purchaseItem} />} /> */}

          <Route
            path="/quiz"
            element={
              <ProtectedRoute user={user}>
                {currentQuestion && sessionData?.id ? (
                  <QuizCardPage />
                ) : (
                  <div />
                )}
              </ProtectedRoute>
            }
          />

          <Route path="/summary" element={
            <ProtectedRoute user={user}>
              <SummaryPage />
            </ProtectedRoute>
          }
          />

          <Route path="/leaderboard" element={
            <ProtectedRoute user={user}>
              <LeaderboardPage />
            </ProtectedRoute>
          } />

        </Routes>
      </TooltipProvider>
    </div>
  );
};
export default App;
