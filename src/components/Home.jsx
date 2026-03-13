import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Millionaire Quiz</h1>
      <button onClick={() => navigate('/quiz')}>Start Game</button>
      <button onClick={() => navigate('/leaderboard')}>View Leaderboard</button>
    </div>
  );
}