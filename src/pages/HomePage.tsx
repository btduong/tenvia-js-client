import { Button } from '@/components/ui/button';
import NavButton from '@/components/ui/NavButton';
import { playQuestionStartSound } from '@/utils/sounds';
import { useState } from 'react';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface HomeProps {
  onStartNewGame: (numberOfQuestions: number) => void;
}

const HomePage: React.FC<HomeProps> = ({ onStartNewGame }) => {
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(10);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm shadow-xl">
        <CardContent className="flex flex-col gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg"> New Game </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start New Game</DialogTitle>
                <DialogDescription className="sr-only">Choose number of questions to play.</DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 py-4">
                <Label>Select number of questions:</Label>
                <select name="selectionQuestions"
                  className="w-full p-2 rounded-md border bg-background"
                  value={numberOfQuestions}
                  onChange={e => setNumberOfQuestions(parseInt(e.target.value))}
                >
                  <option value="10">10</option>
                  <option value="30">30</option>
                  <option value="50">50</option>
                </select>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={() => {
                    onStartNewGame(numberOfQuestions);
                    playQuestionStartSound();
                  }}
                >Start</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <NavButton to="/leaderboard" label="Leaderboard" ariaLabel="To Leaderboard" />
        </CardContent>
      </Card>
      {/* <NavButton to="/shop" label="Shop" ariaLabel="To Shop" /> */}
    </div>
  );
};

export default HomePage;
