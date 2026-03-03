import { useState, useEffect } from 'react';
import './App.css'

import QuizCard from './components/QuizCard';

function App() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="text-center mt-10">Đang tải câu hỏi...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Trắc nghiệm Kiến thức</h1>
      <div className="grid gap-6">
        {questions.map((q) => (
          <QuizCard key={q.id} question={q} />
        ))}
      </div>
    </div>
  );
}
export default App
