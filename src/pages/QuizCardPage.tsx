import QuestionTimer from '@/components/QuestionTimer/QuestionTimer';
import QuizCard from '@/components/QuizCard/QuizCard';

import { Progress } from '@/components/ui/progress';

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
  handleUsePowerUp: (type: PowerUpType) => Promise<UsePowerUpResponse | null>;
  updateBalance: (newBalance: number) => void;
  onAnswerSent: () => void;
  handleAnswerResponse: (response: AnswerResponse) => void;
  triggerGlobalError: (message: string) => void;
  handleAbandonSession: () => void;
}

const QuizCardPage: React.FC<QuizCardPageProps> = ({
  currentQuestion,
  currentIndex,
  questionLimit,
  sessionData,
  answerSent,
  onQuestionTimedout,
  handleUsePowerUp,
  updateBalance,
  onAnswerSent,
  handleAnswerResponse,
  triggerGlobalError,
  handleAbandonSession,
}) => {
  const progressValue = ((currentIndex + 1) / questionLimit) * 100;

  return (
    <div className="flex flex-col flex-1 w-full max-w-md mx-auto relative pb-20">
      <div className="w-full mt-6 mb-2 px-4 flex flex-col gap-2">
        <div className="flex justify-left items-center text-sm font-semibold tracking-tight text-white/90">
          {`Question: ${currentIndex + 1}/${questionLimit}`}
        </div>
        <Progress value={progressValue} className="h-2 w-full" />
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
        <QuizCard key={currentQuestion.id}
          handleUsePowerUp={handleUsePowerUp}
          updateBalance={updateBalance}
          onAnswerSent={onAnswerSent}
          handleAnswerResponse={handleAnswerResponse}
          triggerGlobalError={triggerGlobalError}
          handleAbandonSession={handleAbandonSession}
        />
      </div>
    </div>
  );
};

export default QuizCardPage;
