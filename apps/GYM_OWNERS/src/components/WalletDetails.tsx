import Header from './Header'
import Container from './layout/Container'
import Footer from './Footer'
// import { useState } from 'react';
import VerifiedWallet from './VerifiedWallet';
import UnverifiedWallet from './UnverifiedWallet';
import { useAppContext } from '../context/AppContext';


const WalletDetails = () => {

    const { wallet } = useAppContext()

    // const verified = true

    const verified = wallet?.is_active === true
    const balance = wallet?.balance ?? "0.00"

    return (
        <Container>
            <Header />

            {verified ? (
                <VerifiedWallet />
            ) : (
                <UnverifiedWallet balance={balance} isActive={wallet?.is_active ?? false} />
            )}

            <Footer />
        </Container>
    )
}

export default WalletDetails