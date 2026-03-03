import { useState, useEffect } from 'react';
import './App.css'

import QuizCard from './components/QuizCard';

function App() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    // Gọi API lấy 10 câu hỏi ngẫu nhiên khi trang web load
    fetch('http://localhost:8080/questions/random')
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(err => console.error("Không thể lấy dữ liệu:", err));
  }, []);

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
      setGameState('WON');
    }
  };

  if (loading) return <div className="text-center mt-10">Đang tải câu hỏi...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Trắc nghiệm Kiến thức</h1>
      <h2>Question: {currentIndex + 1}</h2>
      <div className="grid gap-6">
        {<QuizCard key={questions[currentIndex].id} question={questions[currentIndex]} onResult={handleAnswer} />}
      </div>
    </div>
  );
}
export default App
