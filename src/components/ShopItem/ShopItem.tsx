import { playClickSound } from '@/utils/sounds';
import styles from './ShopItem.module.css';

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
            <button
                className={styles.buyButton}
                onClick={() => {
                    onBuy();
                    playClickSound()
                }}
            >
                Buy ({price})
            </button>
        </div>
    );
};

export default ShopItem;