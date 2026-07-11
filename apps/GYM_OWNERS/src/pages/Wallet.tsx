import WalletDetails from "../components/WalletDetails";
import CreateWallet from "../components/CreateWallet";
import { useAppContext } from "../context/AppContext";
import { UnverifiedWalletSkeleton, VerifiedWalletSkeleton, WalletSkeleton } from "../components/Gymskeletons ";
import NetworkErrorModal from "../components/NetworkErrorModal";

export default function Wallet() {

    const { displayWallet, wallet, setDisplayWallet, isLoading, isOffline, networkError } = useAppContext()

    const status = wallet?.verification_status;

    if (isLoading && (displayWallet === "create" || displayWallet === "edit")) {
        return (
            <>
                <WalletSkeleton />
                {(isOffline || networkError) && <NetworkErrorModal />}
            </>
        );
    }

    if (isLoading && displayWallet === "details" && status !== "verified") {
        return (
            <>
                <UnverifiedWalletSkeleton />
                {(isOffline || networkError) && <NetworkErrorModal />}
            </>
        );
    }

    if (isLoading && displayWallet === "details" && status === "verified") {
        return (
            <>
                <VerifiedWalletSkeleton />
                {(isOffline || networkError) && <NetworkErrorModal />}
            </>
        );
    }

    return (
        <div className="min-h-screen">
            {displayWallet === "details" ? (
                <WalletDetails />
            ) : (
                <CreateWallet setDisplayWallet={setDisplayWallet} />
            )}

            {(isOffline || networkError) && <NetworkErrorModal />}
        </div>
    )
}