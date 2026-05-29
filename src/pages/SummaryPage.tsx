import { useLocation } from 'react-router-dom';
import styles from './SummaryPage.module.css';
import HomeButton from '@/components/ui/HomeButton';

const SummaryPage = () => {
  const location = useLocation();
  const summary = location.state?.sessionSummary;

  if (!summary) {
    return <HomeButton />;
  }

  return (
    <div className={styles.text}>
      <h1>Game Over!</h1>
      <div>Score: {summary.score}</div>
      <div>Correct: {summary.correctAnswerCount}</div>
      <div>Incorrect: {summary.incorrectAnswerCount}</div>
      <div>Skip: {summary.skipQuestionCount}</div>
      <HomeButton />
    </div>
  );
};

export default SummaryPage;
