import React from 'react';
import styles from './TopBar.module.css';

// TopBar.jsx
const TopBar = ({ user, sessionId }) => {
    if (!user || !sessionId) return null; // Don't show if not logged in

    return (
        <div className={styles.topBar}>
            <div className={styles.playerInfo}>
                <img
                    src="/avatar-placeholder.png"
                    alt="Avatar"
                    className={styles.avatar}
                />
                <div className={styles.goldInfo}>
                    <span className={styles.goldIcon}>💰</span>
                    <span className={styles.goldAmount}>{user.balance.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

export default TopBar;