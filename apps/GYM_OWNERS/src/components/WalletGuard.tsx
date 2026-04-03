import { Navigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const WalletGuard = ({ children }: { children: React.ReactNode }) => {
    const { wallet } = useAppContext();

    // If wallet not loaded yet, you can return null or loader
    if (!wallet) return null;

    if (wallet.verification_status !== "verified") {
        return <Navigate to="/wallet" replace />;
    }

    return <>{children}</>;
};

export default WalletGuard;