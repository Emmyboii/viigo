import WalletDetails from "../components/WalletDetails";
import CreateWallet from "../components/CreateWallet";
import { useAppContext } from "../context/AppContext";
import { UnverifiedWalletSkeleton, VerifiedWalletSkeleton, WalletSkeleton } from "../components/Gymskeletons ";

export default function Wallet() {

    const { displayWallet, wallet, setDisplayWallet, isLoading } = useAppContext()

    const status = wallet?.verification_status;


    // if (isLoading) {
    //     return (
    //         <div className="flex items-center justify-center min-h-screen">
    //             <div className="flex flex-col items-center gap-4 p-8 bg-white animate-fadeIn">
    //                 <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    //                 <p className="text-gray-700 text-lg font-medium">
    //                     Fetching your wallet details...
    //                 </p>
    //                 <p className="text-gray-400 text-sm text-center">
    //                     This might take a few seconds. Sit tight!
    //                 </p>
    //             </div>
    //         </div>
    //     );
    // }

    if (isLoading && (displayWallet === "create" || displayWallet === "edit")) {
        return (
            <WalletSkeleton />
        );
    }

    if (isLoading && displayWallet === "details" && status !== "verified") {
        return (
            <UnverifiedWalletSkeleton />
        );
    }

    if (isLoading && displayWallet === "details" && status === "verified") {
        return (
            <VerifiedWalletSkeleton />
        );
    }

    return (
        <div className="min-h-screen">
            {displayWallet === "details" ? (
                <WalletDetails />
            ) : (
                <CreateWallet setDisplayWallet={setDisplayWallet} />
            )}
        </div>
    )
}