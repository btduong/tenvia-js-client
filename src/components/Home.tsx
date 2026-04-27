import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

import { playQuestionStart } from '../utils/sounds';
import NavButton from './common/NavButton';

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

      <NavButton to='/leaderboard' label='Leaderboard'/>
      <NavButton to='/shop' label='Shop'/>
      
    </div>
  );
};

export default Home;