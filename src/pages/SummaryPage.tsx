import { useLocation } from 'react-router-dom';
import HomeButton from '@/components/ui/HomeButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SummaryPage = () => {
  const location = useLocation();
  const summary = location.state?.sessionSummary;

  if (!summary) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 w-full">
        <HomeButton />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 w-full max-w-md mx-auto relative pb-20">
      <Card className="w-full shadow-2xl border-t-4 border-t-primary">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-4xl font-extrabold tracking-tight">Game Over!</CardTitle>
          <p className="text-muted-foreground text-sm font-medium pt-1">Session Complete</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 pt-6">
          <div className="flex flex-col items-center justify-center bg-primary/10 rounded-2xl p-6 border border-primary/20">
            <span className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Final Score</span>
            <span className="text-6xl font-extrabold text-primary">{summary.score}</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center bg-green-500/10 border border-green-500/20 rounded-xl p-3">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.correctAnswerCount}</span>
              <span className="text-xs font-bold text-green-600/70 dark:text-green-400/70 uppercase mt-1">Correct</span>
            </div>
            <div className="flex flex-col items-center bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.incorrectAnswerCount}</span>
              <span className="text-xs font-bold text-red-600/70 dark:text-red-400/70 uppercase mt-1">Incorrect</span>
            </div>
            <div className="flex flex-col items-center bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
              <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{summary.skipQuestionCount}</span>
              <span className="text-xs font-bold text-yellow-600/70 dark:text-yellow-400/70 uppercase mt-1">Skipped</span>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <HomeButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryPage;
