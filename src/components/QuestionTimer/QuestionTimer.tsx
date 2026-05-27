import { useEffect, useState, useRef } from "react";
import timelineStyle from './QuestionTimer.module.css';

interface SessionTimerProps {
    duration: number;
    isPause: boolean;
    onComplete: () => void;
}

/**
 * A timeline component represents a progress bar.
 * @param percentage - 100% = full bar, 0% = empty bar
 * @returns a horizontal div
 */
const TimeLine = ({ percentage }: { percentage: number }) => {
    return (
        <div className={timelineStyle.timelineContainer}>
            <div
                style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: percentage < 20 ? 'red' : 'gold', // Changes color when low
                    transition: 'width 0.1s linear'
                }}
            />
        </div>
    );
};

const QuestionTimer: React.FC<SessionTimerProps> = ({ duration, isPause, onComplete }) => {

    const [timeLeft, setTimeLeft] = useState(duration);

    // Interval update
    useEffect(() => {
        if (isPause || timeLeft <= 0) return;

        const timerId = setInterval(() => {
            setTimeLeft(x => x - 0.1);
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

    return (
        <TimeLine percentage={percentage} />
    );
};

export default QuestionTimer;