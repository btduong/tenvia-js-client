import React from 'react';
import { useNavigate } from 'react-router-dom';
import homeStyles from './HomeIcon.module.css';
import { HomeIcon } from './HomeIcon';


const HomeButton = () => {
    const navigate = useNavigate();

    return (
        <button onClick={() => navigate('/')}>Leaderboard</button>
    );
};

export default HomeButton;