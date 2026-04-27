import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

import LeaderboardButton from './ui/LeaderboardButton';
import ShopButton from './ui/ShopButton';
import { playQuestionStart } from '../utils/sounds';

interface HomeProps {
  hasActivateSession: boolean;
  onStartNewGame: () => {};
}

const Home: React.FC<HomeProps> = ({ hasActivateSession, onStartNewGame }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.homeContainer}>
      <h1>Quiz Game</h1>
      {hasActivateSession ?
        <button onClick={() => navigate('/quiz')}>Resume Game</button> :
        <button onClick={() => {
          onStartNewGame();
          playQuestionStart();
        }}>New Game</button>}

      <LeaderboardButton/>
      <ShopButton/>
      
    </div>
  );
};

export default Home;