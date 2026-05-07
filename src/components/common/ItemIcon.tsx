import styles from './ItemIcon.module.css';

interface ItemIconProps {
    name: string;
    icon: string;
    count: number;
}

export const ItemIcon: React.FC<ItemIconProps> = ({name, icon, count}) => (
    <div className={styles.container}>
        <div className={styles.iconWell}>
            <img src={icon} alt={name} className={styles.img}/>
        </div>
        <div className={styles.info}>
            <h3 className={styles.name}>{name}</h3>
            <p className={styles.count}>{count}</p>
        </div>

    </div>
);