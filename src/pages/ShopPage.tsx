import type { PowerUpType, User } from "../types";
import ShopModal from '../components/ShopModal';

interface ShopPageProps {
    user: User;
    onPurchase: (item: PowerUpType) => Promise<void>;
}

const ShopPage = ({user, onPurchase}: ShopPageProps)=> {
    return <ShopModal user={user} onPurchase={onPurchase} />
};

export default ShopPage;
