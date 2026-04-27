interface ShopItemProps {
    name: string;
    price: number;
    count: number;
    onBuy: () => {};
}

const ShopItem: React.FC<ShopItemProps> = ({ name, price, count, onBuy }) => {
    return (
        <div className="shop-item">
            <div className="item-info">
                <h3>{name}</h3>
                <p>Owned: {count}</p>
            </div>
            <button
                className="buy-button"
                onClick={onBuy}
            >
                Buy for {price} 💰
            </button>
        </div>
    );
};

export default ShopItem;