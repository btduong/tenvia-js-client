// ShopItem.jsx
export default function ShopItem({ name, price, count, onBuy }) {
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