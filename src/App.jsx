import { BrowserRouter as Router, Routes, Route, Link } from 'react-router';
import { useState, useEffect } from 'react';
import './App.css'

import QuizCard from './components/QuizCard';
import Leaderboard from './components/Leaderboard';
import Home from './components/Home';

function App() {
  const [questions, setQuestions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);


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
    const res = await fetch('http://localhost:8080/sessions/start', { method: 'POST' });
    const data = await res.json();
    setQuestions(data.questions); // data contains sessionId, firstQuestion, and fiftyFiftyUsed status
    setLoading(false);
    setSessionId(data.id);
    setFiftyFiftyUsed(data.fiftyFiftyUsed);
  };

  const showTopScores = async () => {
    const res = await fetch('http://localhost:8080/leaderboard', { method: 'GET' });
    const data = await res.json();
  }


  const handleAnswer = (isCorrect) => {
    // Let 
    // if (!isCorrect) {
    //   setGameState('LOST');
    //   return;
    // }

    // Progress to the next question
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // setGameState('WON');
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


      {!sessionId ? <button onClick={startNewGame}> Start Quiz</button> :
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="/quiz" element={<QuizCard />} /> */}
            <Route path="/quiz" element={<QuizCard key={questions[currentIndex].id} question={questions[currentIndex]} onResult={handleAnswer} sessionId={sessionId} fiftyFiftyUsed={fiftyFiftyUsed} onFiftyFiftyUsed={handleFiftyFiftyUsed} />} />

            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </div>
      }
    </div>

  );
}
export default App
