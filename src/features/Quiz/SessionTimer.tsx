import { useEffect, useState } from "react";
import timelineStyle from './SessionTimer.module.css';

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

const SessionTimer: React.FC<SessionTimerProps> = ({ duration, isPause, onComplete }) => {

    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        let timerId = 0;

        if (timeLeft <= 0) {
            onComplete();
            return;
        }

        if (!isPause) {
            timerId = setInterval(() => {
                setTimeLeft(x => x - 0.1);
            }, 100);
        } else {
            clearInterval(timerId);
        }

        return () => clearInterval(timerId);

    }, [timeLeft, isPause]);

    const percentage = (timeLeft / duration) * 100;

    return (
        <TimeLine percentage={percentage} />
    );
};

export default SessionTimer;