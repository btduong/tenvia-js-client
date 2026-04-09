import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Leaderboard({ }) {
    const [scores, setScores] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:8081/leaderboard')
            .then(res => res.json())
            .then(data => setScores(data));
    }, []);

    return (
        <div className="leaderboard">
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
            <button onClick={() => navigate('/')}>Back to Home</button>
        </div>
    );
}