import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Leaderboard.module.css';
import HomeButton from './ui/HomeButton';

interface LederboardDTO {
    userName: string;
    score: number;
}


export default function Leaderboard({ }) {
    const [scores, setScores] = useState<LederboardDTO[]>([]);

    useEffect(() => {
        fetch('http://localhost:8081/leaderboard')
            .then(res => res.json())
            .then(data => setScores(data));
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
            <HomeButton/>
        </div>
    );
}