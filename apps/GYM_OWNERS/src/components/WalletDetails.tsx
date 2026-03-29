import Header from './Header'
// import { useState } from 'react';
import VerifiedWallet from './VerifiedWallet';
import UnverifiedWallet from './UnverifiedWallet';
import { useAppContext } from '../context/AppContext';


const WalletDetails = () => {

    const { wallet } = useAppContext()

    const status = wallet?.verification_status;
    const balance = wallet?.balance ?? "0.00";

    if (!wallet) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-4">

                <div className="flex items-center justify-center px-4 mt-20">
                    <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">

                        <div className="text-3xl mb-3">⚠️</div>

                        <h2 className="text-lg font-semibold text-[#0F172A] mb-2">
                            Wallet not found
                        </h2>

                        <p className="text-sm text-[#475569] mb-6">
                            We couldn’t load your wallet details. This might be a network issue or a temporary error.
                        </p>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium"
                            >
                                Refresh
                            </button>

                            {/* <button
                                onClick={() => window.history.back()}
                                className="border border-[#CBD5E1] text-[#475569] px-5 py-2 rounded-lg font-medium"
                            >
                                Go Back
                            </button> */}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen pt-4 relative'>
            <Header />

            {status === "verified" ? (
                <VerifiedWallet />
            ) : (
                <UnverifiedWallet
                    balance={balance}
                    isActive={wallet?.is_active ?? false}
                    status={status}
                />
            )}
        </div>
    );
}

export default WalletDetails