import Header from './Header'
import Container from './layout/Container'
import Footer from './Footer'
// import { useState } from 'react';
import VerifiedWallet from './VerifiedWallet';
import UnverifiedWallet from './UnverifiedWallet';

interface walletDetailsProps {
    setDisplay: React.Dispatch<React.SetStateAction<"details" | "create" | "edit">>;
}

const WalletDetails = ({ setDisplay }: walletDetailsProps) => {

    const verified = true
    // const [verified, setVerified] = useState(false)

    return (
        <Container>
            <Header />

            {verified ? (
                <VerifiedWallet />
            ) : (
                <UnverifiedWallet setDisplay={setDisplay} />
            )}

            <Footer />
        </Container>
    )
}

export default WalletDetails