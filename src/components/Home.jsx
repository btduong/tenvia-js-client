import { useNavigate } from 'react-router-dom';

export default function Home({ hasActivateSession, onStartNewGame }) {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Quiz Game</h1>
      {hasActivateSession ?
        <button onClick={() => navigate('/quiz')}>Resume Game</button> :
        <button onClick={onStartNewGame}>New Game</button>}

      <button onClick={() => navigate('/leaderboard')}>View Leaderboard</button>
    </div>
  );
}