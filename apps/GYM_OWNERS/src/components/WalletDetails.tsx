import Header from './Header'
// import { useState } from 'react';
import VerifiedWallet from './VerifiedWallet';
import UnverifiedWallet from './UnverifiedWallet';
import { useAppContext } from '../context/AppContext';


const WalletDetails = () => {

    const { wallet } = useAppContext()

    // const verified = true

    const verified = wallet?.verification_status === "verified"
    const balance = wallet?.balance ?? "0.00"

    return (
        <div className='min-h-screen pt-4 relative'>
            <Header />

            {!verified ? (
                <VerifiedWallet />
            ) : (
                <UnverifiedWallet balance={balance} isActive={wallet?.is_active ?? false} />
            )}

            
        </div>
    )
}

export default WalletDetails