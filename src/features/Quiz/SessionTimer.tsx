import { useEffect, useState } from "react";

interface SessionTimerProps {
    duration: number;
}

const SessionTimer: React.FC<SessionTimerProps> = ({duration}) => {

    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        if (timeLeft <= 0) {
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(x => x - 1);
        }, 1000);

        return () => clearInterval(timerId);

    }, [timeLeft]);

    return (
      <div>{timeLeft > 0 ? timeLeft : "..."}</div>
    );
};

export default SessionTimer;