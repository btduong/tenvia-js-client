import { serviceApi } from '@/api/serviceApi';
import HomeButton from '@/components/ui/HomeButton';
import { useQuery } from '@tanstack/react-query';
import styles from './LeaderboardPage.module.css';

export default function LeaderboardPage({ }) {

  const { data: scores, isLoading, isError } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: serviceApi.leaderboardPage
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
