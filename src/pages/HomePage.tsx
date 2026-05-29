import styles from './HomePage.module.css';

import NavButton from '@/components/ui/NavButton';
import { playQuestionStartSound } from '@/utils/sounds';

interface HomeProps {
  onStartNewGame: () => {};
}

const HomePage: React.FC<HomeProps> = ({ onStartNewGame }) => {
  
  return (
    <div className={styles.homeContainer}>
      <h1>Quiz Game</h1>
      <button onClick={() => {
        onStartNewGame();
        playQuestionStartSound();
      }}>New Game</button>

      <NavButton to='/leaderboard' label='Leaderboard' ariaLabel='To Leaderboard' />
      <NavButton to='/shop' label='Shop' ariaLabel='To Shop' />

    </div>
  );
};

export default HomePage;