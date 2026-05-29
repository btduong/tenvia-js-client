import { GameStatus } from '@/types';
import styles from './StatusMessage.module.css';

interface StatusMessageProps {
  status: GameStatus;
  message: string;
  onClose?: () => void;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ status, message, onClose }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        {status !== GameStatus.ERROR && <div className={styles.spinner} />}
        <p>{message}</p>
        {status === GameStatus.ERROR && <button onClick={onClose}>Ok</button>}
      </div>
    </div>
  );
};
