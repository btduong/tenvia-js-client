import React from 'react';
import homeStyles from './HomeIcon.module.css';
import HomeIcon from './HomeIcon';
import NavButton from './NavButton';

interface HomeButtonProps {
  handleAbandonSession?: () => Promise<boolean> | boolean;
}

const HomeButton: React.FC<HomeButtonProps> = ({ handleAbandonSession }) => {
  return (
    <NavButton
      to="/"
      label="Home"
      ariaLabel="To Home"
      icon={<HomeIcon className={homeStyles.homeSvg} />}
      onNavigate={handleAbandonSession}
    />
  );
};

export default HomeButton;
