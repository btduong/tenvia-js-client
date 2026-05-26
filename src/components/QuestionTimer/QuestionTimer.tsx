import { useEffect, useState } from "react";
import timelineStyle from './QuestionTimer.module.css';

interface SessionTimerProps {
    duration: number;
    isPause: boolean;
    onComplete: () => void;
}

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

    // Trigger onComplete
    useEffect(() => {
        if (timeLeft <= 0) {
            onComplete();
        }
    }, [timeLeft, onComplete]);

    const percentage = (timeLeft / duration) * 100;

    return (
        <TimeLine percentage={percentage} />
    );
};

export default QuestionTimer;