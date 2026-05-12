import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

import { playQuestionStartSound } from '../utils/sounds';
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
      {hasActivateSession 
      ? <button onClick={() => navigate('/quiz')}>Resume Game</button> 
      : <button onClick={() => {
          onStartNewGame();
          playQuestionStartSound();
        }}>New Game</button>}

      <NavButton to='/leaderboard' label='Leaderboard' ariaLabel='To Leaderboard'/>
      <NavButton to='/shop' label='Shop' ariaLabel='To Shop'/>
      
    </div>
  );
};

export default Home;