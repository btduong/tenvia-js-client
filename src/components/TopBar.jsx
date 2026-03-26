import React from 'react';

// TopBar.jsx
const TopBar = ({ user }) => {
    if (!user) return null; // Don't show if not logged in

    return (
        <div className="top-bar">
            <div className="user-stats">
                <span className="username">{user.username}</span>
                <div className="balance-badge">
                    <span className="coin-icon">💰</span>
                    <span className="balance-amount">{user.balance.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

export default TopBar;