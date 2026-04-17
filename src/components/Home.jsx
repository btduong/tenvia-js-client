import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

import LeaderboardButton from './ui/LeaderboardButton';
import ShopButton from './ui/ShopButton';

export default function Home({ hasActivateSession, onStartNewGame }) {
  const navigate = useNavigate();

  return (
    <div className={styles.homeContainer}>
      <h1>Quiz Game</h1>
      {hasActivateSession ?
        <button onClick={() => navigate('/quiz')}>Resume Game</button> :
        <button onClick={onStartNewGame}>New Game</button>}

      <LeaderboardButton/>
      <ShopButton/>
      
      {/* <button onClick={() => navigate('/leaderboard')}>View Leaderboard</button> */}
      {/* <button onClick={() => navigate('/leaderboard')}>View Leaderboard</button> */}
    </div>
  );
}