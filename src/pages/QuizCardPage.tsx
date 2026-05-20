import QuizCard from '../components/QuizCard';
import appStyles from '../App.module.css';
import QuestionTimer from '../features/Quiz/QuestionTimer';

import type { AnswerResponse, GameSession, Inventory, PowerUpType, Question, UsePowerUpResponse } from "../types";
import { useGameContext } from '../hooks/GameContext';

interface QuizCardPageProps {
    currentQuestion: Question;
    currentIndex: number;
    questionLimit: number;
    sessionData: GameSession | null;
    answerSent: boolean;
    onQuestionTimedout: () => Promise<void>;
}

const QuizCardPage: React.FC<QuizCardPageProps> = ({
    currentQuestion,
    currentIndex,
    questionLimit,
    sessionData,
    answerSent,
    onQuestionTimedout }) => {
    return (
        <>
            <div className={appStyles.currentQuestionCount}>{`Question: ${currentIndex + 1}/${questionLimit}`}</div>
            {!!sessionData?.duration &&
                (<QuestionTimer
                    key={currentQuestion.id}
                    duration={currentQuestion.expiresInSecond}
                    isPause={answerSent}
                    onComplete={onQuestionTimedout} />)
            }
            <div className={appStyles.quizPage}>
                <QuizCard key={currentQuestion.id} />
            </div>
        </>
    );
};

export default QuizCardPage;