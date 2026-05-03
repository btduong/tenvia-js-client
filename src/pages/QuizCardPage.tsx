import QuizCard from '../components/QuizCard';
import appStyles from '../components/QuizCard.module.css';
import SessionTimer from '../features/Quiz/SessionTimer';

import type { AnswerResponse, GameSession, Inventory, PowerUpEffect, PowerUpType, Question } from "../types";

interface QuizCardPageProps {
    currentQuestion: Question;
    currentIndex: number;
    questionLimit: number;
    sessionData: GameSession | null;
    answerSent: boolean;
    onQuestionTimedout: () => Promise<void>;
    handleAnswer: (answerResponse: AnswerResponse) => void;
    inventory: Inventory;
    handleUsePowerUp: (type: PowerUpType) => Promise<PowerUpEffect | null>;
    updateBalance: (balance: number) => void;
    onAnswerSent: () => void;
}

const QuizCardPage: React.FC<QuizCardPageProps> = ({
    currentQuestion,
    currentIndex,
    questionLimit,
    sessionData,
    answerSent,
    onQuestionTimedout,
    handleAnswer,
    inventory,
    handleUsePowerUp,
    updateBalance,
    onAnswerSent, }) => {
    return (
        <>
            <div className={appStyles.currentQuestionCount}>Question: {currentIndex + 1} / {questionLimit}</div>
            {sessionData && sessionData.duration ?
                (<SessionTimer
                    key={currentQuestion.id}
                    duration={currentQuestion.expiresInSecond}
                    isPause={answerSent}
                    onComplete={onQuestionTimedout} />)
                : (<div></div>)
            }
            <div className={appStyles.quizPage}>
                {sessionData && sessionData.id ?
                    <QuizCard
                        key={currentQuestion.id}
                        question={currentQuestion}
                        onResult={handleAnswer}
                        sessionId={sessionData.id}
                        inventory={inventory}
                        onUsePowerUp={handleUsePowerUp}
                        onBalanceUpdated={updateBalance}
                        onAnswerSent={onAnswerSent} />
                    : "Loading neq quiz card"}
            </div>
        </>
    );
};

export default QuizCardPage;