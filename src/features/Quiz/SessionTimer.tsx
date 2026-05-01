import { useEffect, useState } from "react";
import timelineStyle from './SessionTimer.module.css';

interface SessionTimerProps {
    duration: number;
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

const SessionTimer: React.FC<SessionTimerProps> = ({ duration }) => {

    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        if (timeLeft <= 0) {
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(x => x - 0.1);
        }, 100);

        return () => clearInterval(timerId);

    }, [timeLeft]);

    const percentage = (timeLeft / duration) * 100;

    return (
        <TimeLine percentage={percentage}/>
    );
};

export default SessionTimer;