import { useEffect, useState, useRef } from 'react';
import { CircularTimeLine } from '../ui/CircularProgressBar';

interface SessionTimerProps {
  duration: number;
  isPause: boolean;
  onComplete: () => void;
}

const QuestionTimer: React.FC<SessionTimerProps> = ({ duration, isPause, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  // Interval update
  useEffect(() => {
    if (isPause || timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft((x) => x - 0.1);
    }, 100);

    return () => clearInterval(timerId);
  }, [isPause, timeLeft <= 0]);

  /**
   * Defensive guard to ensure onComplete doesn't get called multiple times.
   * Without this guard, in the case this component gets re-rendered and the timeleft is 0, onComplete will be called again.
   */
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    if (timeLeft <= 0 && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onComplete();
    }
  }, [timeLeft, onComplete]);

  const percentage = (timeLeft / duration) * 100;

  return <CircularTimeLine percentage={percentage} timeLeft={timeLeft} />
};

export default QuestionTimer;
