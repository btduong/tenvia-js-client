import { useEffect, useState } from 'react';
import styles from './LeaderboardPage.module.css';
import type { LeaderboardDTO } from '@/types';
import { serviceApi } from '@/api/serviceApi';
import HomeButton from '@/components/ui/HomeButton';

export default function LeaderboardPage({}) {
  const [scores, setScores] = useState<LeaderboardDTO[]>([]);

  useEffect(() => {
    // Cannot use await directly inside useEffect.
    // Has to wrap await inside an async function.
    const getLeaderboard = async () => {
      const { data, error } = await serviceApi.leaderboardPage();
      if (data) {
        setScores(data);
      }
    };

    getLeaderboard();
  }, []);

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
}
