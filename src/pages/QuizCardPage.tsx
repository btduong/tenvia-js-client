import QuestionTimer from '@/components/QuestionTimer/QuestionTimer';
import QuizCard from '@/components/QuizCard/QuizCard';

import type {
  AnswerResponse,
  GameSession,
  Inventory,
  PowerUpType,
  Question,
  UsePowerUpResponse,
} from '@/types';

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
  onQuestionTimedout,
}) => {
  return (
    <div className="flex flex-col flex-1 w-full max-w-md mx-auto relative pb-20">
      <div className="text-center w-full block mt-5 mb-1 bg-primary text-primary-foreground text-xl py-1">
        {`Question: ${currentIndex + 1}/${questionLimit}`}
      </div>
      {!!sessionData?.duration && (
        <QuestionTimer
          key={currentQuestion.id}
          duration={currentQuestion.expiresInSecond}
          isPause={answerSent}
          onComplete={onQuestionTimedout}
        />
      )}
      <div className="flex-1 flex flex-col w-full">
        <QuizCard key={currentQuestion.id} />
      </div>
    </div>
  );
};

export default QuizCardPage;
