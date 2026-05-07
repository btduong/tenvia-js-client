import { ItemIcon } from './common/ItemIcon';
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
                {/* <img src={icon} alt={name} className={styles.itemIcon} /> */}
                <ItemIcon name={name} icon={icon} count={count}/>
            {/* <div className={styles.itemInfo}>
                <h3>{name}</h3>
                <p>Owned: {count}</p>
            </div> */}
            <button
                className={styles.buyButton}
                onClick={onBuy}
            >
                Buy ({price})
            </button>
        </div>
    );
};

export default ShopItem;