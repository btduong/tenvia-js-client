import { useNavigate } from 'react-router-dom';
import { playClickSound } from '@/utils/sounds';

interface NavButtonProps {
  to: string;
  label: string;
  icon?: React.ReactNode; // Make icon optional as not all buttons have icons
  iconClassName?: string;
  className?: string;
  ariaLabel: string;
  onNavigate?: (() => Promise<boolean> | boolean) | undefined;
}

const NavButton: React.FC<NavButtonProps> = ({
  to,
  label,
  icon,
  iconClassName,
  className,
  ariaLabel,
  onNavigate,
}) => {
  const navigate = useNavigate();

  const handleClick = async () => {
    playClickSound();
    if (onNavigate) {
      const shouldNavigate = await onNavigate();
      if (shouldNavigate === false) return;
    }
    navigate(to);
  };

  return (
    <button aria-label={ariaLabel} onClick={handleClick} className={className || ''}>
      {icon && <span className={`${iconClassName}`}>{icon}</span>}
      {!icon && label}
    </button>
  );
};

export default NavButton;
