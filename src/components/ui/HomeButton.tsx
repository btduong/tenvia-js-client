import React from 'react';
import { Home } from 'lucide-react';
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
      icon={<Home className="w-8 h-8" />}
      className="w-14 h-14 flex items-center justify-center border-2 hover:scale-[1.05] active:scale-[0.95] transition-all shadow-md bg-background text-foreground hover:bg-muted"
      onNavigate={handleAbandonSession}
    />
  );
};

export default HomeButton;
