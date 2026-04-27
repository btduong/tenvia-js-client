import React from 'react';
import { useNavigate } from 'react-router-dom';


const HomeButton: React.FC = () => {
    const navigate = useNavigate();

    return (
        <button onClick={() => navigate('/leaderboard')}>Leaderboard</button>
    );
};

export default HomeButton;