import { serviceApi } from '@/api/serviceApi';
import HomeButton from '@/components/ui/HomeButton';
import { useQuery } from '@tanstack/react-query';
import styles from './LeaderboardPage.module.css';
import { STALE_TIMES } from '@/constants';

export default function LeaderboardPage({ }) {

  const { data: scores, isLoading, isError } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: serviceApi.leaderboardPage,
    // Config tanstack to not immmediately re-fetch the data from the server 
    // if the player click away and click back to the game tab.
    staleTime: STALE_TIMES.LEADERBOARD,
  });

  if (isLoading) return <div className={styles.leaderboard}><h2>Loading scores...</h2></div>;
  if (isError) return <div className={styles.leaderboard}><h2>Failed to load leaderboard.</h2></div>;
  if (!scores) return null;

  return (
    <div className={styles.leaderboard}>
      <h2>Top 10 High Scores</h2>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((s, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{s.userName}</td>
              <td>{s.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <HomeButton />
    </div>
  );
};
