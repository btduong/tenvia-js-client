import React from 'react';
import { useNavigate } from 'react-router-dom';

const ShopButton: React.FC = () => {
    const navigate = useNavigate();

    return (
        <button onClick={() => navigate('/shop')}>Shop</button>
    );
};

export default ShopButton;