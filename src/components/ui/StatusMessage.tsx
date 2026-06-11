import { GameStatus } from '@/types';
import styles from './StatusMessage.module.css';
import { Button } from './button';

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
        {status === GameStatus.ERROR && <Button onClick={onClose}>Ok</Button>}
      </div>
    </div>
  );
};
