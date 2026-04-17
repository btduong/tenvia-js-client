import { BrowserRouter as Router, Routes, Route, Link } from 'react-router';
import { useState, useEffect } from 'react';
import './App.css'

import QuizCard from './components/QuizCard';
import Leaderboard from './components/Leaderboard';
import SummaryPage from './components/SummaryPage';
import Home from './components/Home';
import TopBar from './components/Topbar';
import ShopModal from './components/ShopModal';

// UI buttons

import { useNavigate } from 'react-router-dom';


function App() {
  const [typedUsername, setTypedUsername] = useState("");
  const [user, setUser] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [questionLimit, setQuestionLimit] = useState(10); // How many questions per game

  // Use react-dom to nagivate to different url ie /home, /quiz etc.
  const navigate = useNavigate();

  const startNewGame = async () => {
    const res = await fetch(`http://localhost:8080/sessions/start?id=${user.id}&limit=${questionLimit}`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setLoading(false);
      setSessionId(data.id);
      setFiftyFiftyUsed(data.fiftyFiftyUsed);
      navigate('/quiz');
      // Pass the data.id (sessionId) in here because
      // it is yet to be updated from setSessionId(data.id);
      getNextQuestion(data.id);
    }

  };

  const handleLogin = async () => {

    const res = await fetch(`http://localhost:8080/users/login?username=${typedUsername}`, { method: 'POST' });
    const data = await res.json();
    setUser(data);
  };


  const getNextQuestion = async (newSessionID) => {
    try {
      const response = await fetch(`http://localhost:8080/sessions/${newSessionID}/questions/next`);

      if (response.ok) {
        const questionData = await response.json();
        setCurrentQuestion(questionData);
      }

    } catch (error) {
      console.log("Fail to get next question");
    }
  };

  const handleGameOver = () => {
    setSessionId(null);
    setCurrentQuestion(null);
    setCurrentIndex(0);
    // TODO: Updat the balance
  };

  const handleAnswer = (answerResponse) => {
    console.log('currentIndex=', currentIndex);
    console.log('answerResponse', answerResponse);
    // Progress to the next question
    // if (isCorrect) {
    if (!answerResponse.isGameOver) {

      setCurrentIndex(prev => prev + 1);
      getNextQuestion(sessionId);
    } else {
      handleGameOver();
    }
  };

  const handlePurchase = async (itemType) => {
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
    <div>
      {!user ? (
        /* 1. LOGIN GUARD */
        <div className="loginContainer">
          <input type='text' placeholder='Enter username' onChange={(e) => setTypedUsername(e.target.value)} />
          <button onClick={handleLogin} disabled={!typedUsername.trim()}>Login</button>
        </div>
      ) : (
        /* 2. AUTHENTICATED APP */
          <div className='lobby'>
            <TopBar user={user} sessionId={sessionId} />
            {/* TODO: pay off Architectural Deb
          - move rout content into Page components
          - move repetitive logic into Custom Hooks
          - use React Router Outlets for shared UI ie TopBar
           */}
            <Routes>
              {/* HOME / LOBBY */}
              <Route path="/" element={
                <div>
                  {!sessionId ? (
                    <Home hasActivateSession={false} onStartNewGame={startNewGame} />
                  ) : (
                    <Home hasActivateSession={true} onStartNewGame={startNewGame} />
                  )}

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
                currentQuestion ? (
                  <div className="quiz-page">
                    <div>Question: {currentIndex + 1} / {questionLimit}</div>
                    <QuizCard
                      key={currentQuestion.id}
                      question={currentQuestion}
                      onResult={handleAnswer}
                      sessionId={sessionId}
                      inventory={user.inventory || {}}
                      onUsePowerUp={handleUsePowerUp}
                      onBalanceUpdated={handleBalanceUpdate}
                    />
                  </div>
                ) : <navigate to="/" />
              } />

              <Route path="/summary" element={<SummaryPage/>} />

              <Route path="/leaderboard" element={<Leaderboard />} />
            </Routes>
          </div>
      )}
    </div>
  );
}
export default App
