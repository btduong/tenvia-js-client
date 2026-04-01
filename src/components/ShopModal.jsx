import React from 'react';
import ShopItem from './ShopItem';
import { useNavigate } from 'react-router-dom';

const ShopModal = ({ user, onPurchase }) => {
  const navigate = useNavigate();
  
  if (!user) return null;

  const handleClose = () => navigate('/'); // Go back to lobby

  return (
    <div className="modal-overlay">
      <div className="shop-modal">
        <div className="shop-header">
          <h2>🛒 Power-Up Store</h2>
          <button className="close-btn" onClick={handleClose}>&times;</button>
        </div>

        <div className="shop-balance">
          Your Balance: <span>💰 {user.balance}</span>
        </div>

        <div className="shop-items-grid">
          <ShopItem 
            name="The Hammer" 
            price={0} 
            count={user.inventory['HAMMER'] || 0}
            onBuy={() => onPurchase('HAMMER')}
          />
          <ShopItem 
            name="50/50" 
            price={0} 
            count={user.inventory['FIFTY_FIFTY'] || 0}
            onBuy={() => onPurchase('FIFTY_FIFTY')}
          />
        </div>
      </div>
    </div>
  );
};

export default ShopModal;