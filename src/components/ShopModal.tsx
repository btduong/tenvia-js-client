import React from 'react';
import ShopItem from './ShopItem';
import { useNavigate } from 'react-router-dom';
import type { PowerUpType, User } from '../types';
import styles from './ShopModal.module.css';
import hammerIcon from '../assets/icons/suit_diamonds.png';

interface ShopModalProps {
  user: User;
  onPurchase: (item: PowerUpType) => {};
}

const ShopModal: React.FC<ShopModalProps> = ({ user, onPurchase }) => {
  const navigate = useNavigate();

  if (!user) return null;

  const handleClose = () => navigate('/'); // Go back to lobby

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.shopModal}>
        <div className={styles.shopHeader}>
          <h2 className={styles.title}>🛒 Power-Up Store</h2>
          <button className={styles.closeBtn} onClick={handleClose}>&times;</button>
        </div>

        <div className={styles.shopBalance}>
          Balance: <span className={styles.currency}>💰 {user.balance}</span>
        </div>

        <div className={styles.shopItemsGrid}>
          <ShopItem
            name="The Hammer"
            price={1}
            count={user.inventory['HAMMER'] || 0}
            icon={hammerIcon}
            onBuy={() => onPurchase('HAMMER')}
          />
          <ShopItem
            name="50/50"
            price={1}
            count={user.inventory['FIFTY_FIFTY'] || 0}
            icon={hammerIcon}
            onBuy={() => onPurchase('FIFTY_FIFTY')}
          />
          <ShopItem
          name="Swap Question"
          price={1}
          count={user.inventory['SWAP_QUESTION'] || 0}
          icon={hammerIcon}
          onBuy={() => onPurchase('SWAP_QUESTION')}
          />
        </div>
      </div>
    </div>
  );
};

export default ShopModal;