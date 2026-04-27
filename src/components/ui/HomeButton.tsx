import React from 'react';
import { useNavigate } from 'react-router-dom';
import homeStyles from './HomeIcon.module.css';
import  HomeIcon  from './HomeIcon';


const HomeButton: React.FC = () => {
    const navigate = useNavigate();

    return (
        <button className={homeStyles.homeIconBtn}
            onClick={() => navigate('/')}><HomeIcon className={homeStyles.homeSvg} /></button>
    );
};

export default HomeButton;