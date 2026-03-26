import { BrowserRouter as Router, Routes, Route, Link } from 'react-router';
import { useState, useEffect } from 'react';
import './App.css'

import QuizCard from './components/QuizCard';
import Leaderboard from './components/Leaderboard';
import Home from './components/Home';
import TopBar from './components/Topbar';
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
            balance : rewardData.newTotalBalance

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

  const handleAnswer = (isCorrect) => {
    console.log('currentIndex=', currentIndex);

    // Progress to the next question
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleGameOver();
      // setGameState('WON');
      navigate('/');
    }
  };


  const handleFiftyFiftyUsed = () => {
    setFiftyFiftyUsed(true);
  }

  // if (loading) return <div className="text-center mt-10">Đang tải câu hỏi...</div>;

  // return (

  //   <div>
  //     {!sessionId ? <button onClick={startNewGame}> Start Quiz</button> :
  //       <div className="container mx-auto p-4">
  //         <h1 className="text-3xl font-bold text-center mb-8">Trắc nghiệm Kiến thức</h1>
  //         <h2>Question: {currentIndex + 1}</h2>
  //         <div className="grid gap-6">
  //           {<QuizCard key={questions[currentIndex].id} question={questions[currentIndex]} onResult={handleAnswer} sessionId={sessionId} fiftyFiftyUsed={fiftyFiftyUsed} onFiftyFiftyUsed={handleFiftyFiftyUsed} />}
  //         </div>
  //       </div>
  //     }

  //     {/* <button onClick={showTopScores}>Top scores</button> */}
  //   </div>

  // );

  return (
    <div>
      {!user ? (
        <div className="login-container">
          <input type='text' placeholder='Enter username' onChange={(e) => setTypedUsername(e.target.value)} />
          <button onClick={handleLogin} disabled={!typedUsername.trim()}>Login</button>
        </div>)
        : (<>
            {<div>{<TopBar user={user} />}</div>}
            {!sessionId ? (<button onClick={startNewGame}> Start Quiz</button>) :

            <div className="App">
              <Routes>
                <Route path="/" element={<Home hasActivateSession={!sessionId} onStartNewGame={startNewGame} />} />
                <Route path="/quiz" element={
                  <div>
                    <div><h2>Question: {currentIndex + 1} / {questions.length}</h2></div>
                    <QuizCard key={questions[currentIndex].id} question={questions[currentIndex]} onResult={handleAnswer} sessionId={sessionId} fiftyFiftyUsed={fiftyFiftyUsed} onFiftyFiftyUsed={handleFiftyFiftyUsed} />
                  </div>
                } />
                <Route path="/leaderboard" element={<Leaderboard />} />
              </Routes>
            </div>}
          </>)
      }
    </div>

  );
}
export default App
