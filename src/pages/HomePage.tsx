import styles from './HomePage.module.css';

import NavButton from '@/components/ui/NavButton';
import { playQuestionStartSound } from '@/utils/sounds';
import { useState } from 'react';

interface HomeProps {
  onStartNewGame: (numberOfQuestions: number) => void;
}

interface NumberOfQuestionsPickerProps {
  onStartNewGame: (numberOfQuestions: number) => void;
  onCancel: () => void;
}
/**
 * A dropdown list component represents the selection of number of questions the players will get
 */
const NumberOfQuestionsPicker: React.FC<NumberOfQuestionsPickerProps> = ({ onStartNewGame, onCancel }) => {
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(10);
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 style={{margin: 0}}>Start New Game</h2>
        <label className={styles.modalLabel}>
          Select number of questions:
          <select name="selectionQuestions"
            className={styles.modalSelect}
            value={numberOfQuestions}
            onChange={e => setNumberOfQuestions(parseInt(e.target.value))}
          >
            <option value="10">10</option>
            <option value="30">30</option>
            <option value="50">50</option>
          </select>
        </label>
        <div className={styles.modalActions}>
          <button onClick={onCancel}>Cancel</button>
          <button 
            onClick={() => {
              onStartNewGame(numberOfQuestions);
              playQuestionStartSound();
            }}
          >Start</button>
        </div>
      </div>
    </div>
  );
}

const HomePage: React.FC<HomeProps> = ({ onStartNewGame }) => {
  const [showSelection, setShowSelection] = useState<boolean>(false);

  return (
    <div className={styles.homeContainer}>
      <h1>Quiz Game</h1>
      
      <button
        onClick={() => {
          setShowSelection(true);
        }}
      >
        New Game
      </button>

      {showSelection && (
        <NumberOfQuestionsPicker 
          onStartNewGame={onStartNewGame}
          onCancel={() => setShowSelection(false)}
        />
      )}

      <NavButton to="/leaderboard" label="Leaderboard" ariaLabel="To Leaderboard" />
      {/* <NavButton to="/shop" label="Shop" ariaLabel="To Shop" /> */}
    </div>
  );
};

export default HomePage;
