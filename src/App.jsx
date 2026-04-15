import { BrowserRouter as Router, Routes, Route, Link } from 'react-router';
import { useState, useEffect } from 'react';
import './App.css'

import QuizCard from './components/QuizCard';
import Leaderboard from './components/Leaderboard';
import Home from './components/Home';
import TopBar from './components/Topbar';
import ShopModal from './components/ShopModal';

// UI buttons
import LeaderboardButton from './components/ui/LeaderboardButton';

import { useNavigate } from 'react-router-dom';


function App() {
  const [typedUsername, setTypedUsername] = useState("");
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);

  // Use react-dom to nagivate to different url ie /home, /quiz etc.
  const navigate = useNavigate();

  // useEffect(() => {
  //   // Gọi API lấy 10 câu hỏi ngẫu nhiên khi trang web load
  //   fetch('http://localhost:8080/sessions/start', { method: 'POST' })
  //     .then(res => res.json())
  //     .then(data => {
  //       setQuestions(data.questions);
  //       setLoading(false);
  //       setSessionId(data.id);
  //       setHasFiftyFiftyOption(data.fiftyFiftyUsed);
  //     })
  //     .catch(err => console.error("Không thể lấy dữ liệu:", err));
  // }, []);

  const startNewGame = async () => {
    const res = await fetch(`http://localhost:8080/sessions/start?id=${user.id}`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setQuestions(data.questions); // data contains sessionId, firstQuestion, and fiftyFiftyUsed status
      setLoading(false);
      setSessionId(data.id);
      setFiftyFiftyUsed(data.fiftyFiftyUsed);
      navigate('/quiz');
    }

  };

  const handleLogin = async () => {

    const res = await fetch(`http://localhost:8080/users/login?username=${typedUsername}`, { method: 'POST' });
    const data = await res.json();
    setUser(data);
  };

  const showTopScores = async () => {
    const res = await fetch('http://localhost:8080/leaderboard', { method: 'GET' });
    const data = await res.json();
  }

  const handleGameOver = async () => {
    setCurrentIndex(0);
    try {
      const response = await fetch(`http://localhost:8080/sessions/${sessionId}/finish`, {
        method: 'POST'
      });

      if (response.ok) {
        const rewardData = await response.json();
        setUser(previous => ({
          ...previous,
          balance: rewardData.newTotalBalance

        }));
        console.log(rewardData);
        // Store this to show on your Summary/Home screen
        // setLastReward(rewardData);

        // Now that the DB is updated, we can clean up
        setSessionId(null);
        // navigate('/summary'); // Or back to '/'
      }
    } catch (error) {
      console.error("Failed to finish session:", error);
    }
  }

  const handleAnswer = () => {
    console.log('currentIndex=', currentIndex);

    // Progress to the next question
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleGameOver();
      navigate('/');
    }
  };

  const handlePurchase = async (itemType) => {
    try {
      // 1. Construct the URL with query parameters
      // Assuming you have 'user.id' available in your state
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
        setUser(previous => ({ ...previous, inventory: newData.inventory }));
      } else {
        alert("Purchase failed. Check your gold balance!");
      }
    } catch (err) {
      console.error("Connection error:", err);
    }
  };

  const handleBalanceUpdate = (newBalance) => {
    setUser(previous => ({ ...previous, balance: newBalance }));
  };

  const handleUsePowerUp = async (type) => {
    try {
      // We reuse our Inventory API!
      const response = await fetch(`http://localhost:8080/api/powerups/use?type=${type}&userId=${user.id}&sessionId=${sessionId}`, { method: 'POST' });

      if (response.ok) {
        const data = await response.json();
        setUser(data.updatedUser); // This triggers a re-render of QuizCard with the new count
        return data.powerUpEffect;
      }
    } catch (error) {
      console.error("Failed to use power-up", error);
      return null;
    }
  };

  return (
    <div className="App">
      {!user ? (
        /* 1. LOGIN GUARD */
        <div className="login-container">
          <input type='text' placeholder='Enter username' onChange={(e) => setTypedUsername(e.target.value)} />
          <button onClick={handleLogin} disabled={!typedUsername.trim()}>Login</button>
        </div>
      ) : (
        /* 2. AUTHENTICATED APP */
        <>
          <TopBar user={user} sessionId={sessionId} />
          {/* TODO: pay off Architectural Deb
          - move rout content into Page components
          - move repetitive logic into Custom Hooks
          - use React Router Outlets for shared UI ie TopBar
           */}
          <Routes>
            {/* HOME / LOBBY */}
            <Route path="/" element={
              <div className="lobby">
                {!sessionId ? (
                  <button onClick={startNewGame}>Start Quiz</button>
                ) : (
                  <Home hasActivateSession={true} onStartNewGame={startNewGame} />
                )}
                {/* Navigation to Shop */}
                <Link to="/shop"><button>Open Shop 🛒</button></Link>
                <Link to="/leaderboard"><LeaderboardButton/></Link>
              </div>
            } />

            {/* SHOP ROUTE */}
            <Route path="/shop" element={
              <ShopModal
                user={user}
                onPurchase={(item) => handlePurchase(item)}
              />
            } />

            {/* QUIZ ROUTE (Protected by sessionId) */}
            <Route path="/quiz" element={
              sessionId ? (
                <div className="quiz-page">
                  {/* <h2>Question: {currentIndex + 1} / {questions.length}</h2> */}
                  <QuizCard
                    key={questions[currentIndex].id}
                    question={questions[currentIndex]}
                    onResult={handleAnswer}
                    sessionId={sessionId}
                    inventory={user.inventory || {}}
                    onUsePowerUp={handleUsePowerUp}
                    onBalanceUpdated={handleBalanceUpdate}
                  />
                </div>
              ) : <navigate to="/" />
            } />

            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </>
      )}
    </div>
  );
}
export default App
