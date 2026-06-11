import { playClickSound } from '@/utils/sounds';
import styles from './ShopItem.module.css';
import { Button } from '../ui/button';

interface ShopItemProps {
  name: string;
  price: number;
  count: number;
  icon: string;
  onBuy: () => {};
}

const ShopItem: React.FC<ShopItemProps> = ({ name, price, count, icon, onBuy }) => {
  return (
    <div className={styles.shopItem}>
      <div className={styles.iconWell}>
        <img src={icon} alt={name} className={styles.itemIcon} />
      </div>
      <div className={styles.itemInfo}>
        <h3>{name}</h3>
        <p>Owned: {count}</p>
      </div>
      <Button
        className={styles.buyButton}
        onClick={() => {
          onBuy();
          playClickSound();
        }}
      >
        Buy ({price})
      </Button>
    </div>
  );
};

export default ShopItem;
