import React, { useEffect, useState } from 'react';
import styles from './LeaderboardPage.module.css';
import NavButton from '../components/common/NavButton';
import HomeIcon from '../components/ui/HomeIcon';
import homeStyles from '../components/ui/HomeIcon.module.css';
import type { LederboardDTO } from '../types';
import { serviceApi } from '../api/serviceApi';

export default function LeaderboardPage({ }) {
    const [scores, setScores] = useState<LederboardDTO[]>([]);

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
            <NavButton to='/' label='Home' icon={<HomeIcon className={homeStyles.homeSvg} />} />
        </div>
    );
}