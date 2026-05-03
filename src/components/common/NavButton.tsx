import { useNavigate } from "react-router-dom";
import { playClick } from "../../utils/sounds";


interface NavButtonProps {
    to: string;
    label: string;
    icon?: React.ReactNode; // Make icon optional as not all buttons have icons
    iconClassName?: string;
}

const NavButton: React.FC<NavButtonProps> = ({ to, label, icon, iconClassName }) => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => {
                navigate(to);
                playClick();
            }}
            className={`{className}`}>
            {icon && <span className={`${iconClassName}`}>{icon}</span>}
            {!icon && label}
        </button>
    );
}

export default NavButton;