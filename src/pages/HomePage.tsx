import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import NavButton from '@/components/ui/NavButton';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGameManager } from '@/hooks/useGameManager';
import { useUser } from '@/hooks/useUser';
import { playQuestionStartSound } from '@/utils/sounds';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const HomePage: React.FC = () => {
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(10);
  const { user, updateInventory } = useUser();
  const navigate = useNavigate();
  const { startNewGame } = useGameManager(user, updateInventory, navigate);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm shadow-xl">
        <CardContent className="flex flex-col gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full h-16 text-xl font-extrabold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"> New Game </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start New Game</DialogTitle>
                <DialogDescription className="sr-only">Choose number of questions to play.</DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 py-4">
                <Select name="selectionQuestions"
                  value={numberOfQuestions.toString()}
                  onValueChange={(value) => setNumberOfQuestions(parseInt(value))} // shadcn value & onValueChange expects string.
                >
                  <Label>Select number of questions:</Label>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select number of questions:" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup >

                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={() => {
                    startNewGame(numberOfQuestions);
                    playQuestionStartSound();
                  }}
                >Start</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <NavButton to="/leaderboard" label="Leaderboard" ariaLabel="To Leaderboard" className="w-full h-16 text-xl font-extrabold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md bg-secondary text-secondary-foreground hover:bg-secondary/80" />
        </CardContent>
      </Card>
      {/* <NavButton to="/shop" label="Shop" ariaLabel="To Shop" /> */}
    </div>
  );
};

export default HomePage;
