import { serviceApi } from '@/api/serviceApi';
import HomeButton from '@/components/ui/HomeButton';
import { useQuery } from '@tanstack/react-query';
import { STALE_TIMES } from '@/constants';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function LeaderboardPage({ }) {

  const { data: scores, isLoading, isError } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: serviceApi.leaderboardPage,
    // Config tanstack to not immmediately re-fetch the data from the server 
    // if the player click away and click back to the game tab.
    staleTime: STALE_TIMES.LEADERBOARD,
  });

  if (isLoading) return <div className="flex justify-center p-10"><h2 className="text-xl font-semibold">Loading scores...</h2></div>;
  if (isError) return <div className="flex justify-center p-10"><h2 className="text-xl font-semibold text-destructive">Failed to load leaderboard.</h2></div>;
  if (!scores) return null;

  return (
    <div className="mx-auto w-full max-w-2xl p-6 space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-center">Top 10 High Scores</h2>
      
      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scores.map((s, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{s.userName}</TableCell>
                <TableCell className="text-right">{s.score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center">
        <HomeButton />
      </div>
    </div>
  );
};
