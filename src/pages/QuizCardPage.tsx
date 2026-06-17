import QuestionTimer from '@/components/QuestionTimer/QuestionTimer';
import QuizCard from '@/components/QuizCard/QuizCard';

import { Progress } from '@/components/ui/progress';
import { useGameSession } from '@/hooks/useGameSession';
import { useGameSessionTimer } from '@/hooks/useGameSessionTimer';
import { useUser } from '@/hooks/useUser';
import { useGameStore } from '@/store/useGameStore';
import { useNavigate } from 'react-router-dom';


const QuizCardPage: React.FC = () => {

  const currentQuestion = useGameStore((state) => state.currentQuestion);
  const sessionData = useGameStore((state) => state.sessionData);
  const answerSent = useGameStore((state) => state.answerSent);
  const { user, updateInventory } = useUser();
  const navigate = useNavigate();

  const { handleAnswerResponse, questionLimit } = useGameSession(user, updateInventory, navigate);
  const { onQuestionTimedout } = useGameSessionTimer(handleAnswerResponse);

  if (!currentQuestion) return null;

  const currentIndex = currentQuestion.index || 0;
  const progressValue = ((currentIndex + 1) / questionLimit.current) * 100;


  return (
    <div className="flex flex-col flex-1 w-full max-w-md mx-auto relative pb-20">
      <div className="w-full mt-6 mb-2 px-4 flex flex-col gap-2">
        <div className="flex justify-left items-center text-sm font-semibold tracking-tight text-white/90">
          {`Question: ${currentIndex + 1}/${questionLimit.current}`}
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
        />
      </div>
    </div>
  );
};

export default QuizCardPage;
