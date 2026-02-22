import Header from './Header'
import Container from './layout/Container'
import Footer from './Footer'
import { FiAlertCircle } from 'react-icons/fi'

const WalletDetails = () => {
    return (
        <Container>
            <Header />

            <div className='flex items-center gap-3 bg-[#DBEAFE] rounded-lg text-[#2563EB] p-3 mt-8'>
                <FiAlertCircle className='size-12' />

                <p className='text-xs font-medium leading-4'>We're verifying your bank details. This usually takes 24-48 hours. You can still accept bookings in the meantime.</p>
            </div>

            <div className='flex flex-col gap-2 mt-8 items-center justify-center h-[150px] w-full rounded-lg bg-[#2563EB] py-8 text-white'>
                <p className='text-[#F1F5F9] text-lg font-semibold'>Account Balance</p>
                <p className='font-bold text-[28px]'>₹0.00</p>
                <p className='rounded-full bg-[#34C759] py-1 px-3 text-xs font-semibold'>Wallet Active</p>
            </div>

            <p className='text-center text-[#475569] text-sm mt-8 max-w-[278px] mx-auto'>No Transactions Yet Your Earnings will appear here</p>

            <button className='mt-8 bg-[#ffffff] border border-[#2563EB] text-[#2563EB] py-2 px-6 rounded-md w-full font-semibold text-sm h-[50px]'>Edit Bank Details</button>

            <Footer />
        </Container>
    )
}

export default WalletDetails