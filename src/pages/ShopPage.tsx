import ShopModal from "@/components/Modal/ShopModal";
import type { PowerUpType, User } from "@/types";

interface ShopPageProps {
    user: User;
    onPurchase: (item: PowerUpType) => Promise<boolean>;
}

const ShopPage = ({user, onPurchase}: ShopPageProps)=> {
    return <ShopModal user={user} onPurchase={onPurchase} />
};

export default ShopPage;
