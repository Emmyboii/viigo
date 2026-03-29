import { FiAlertCircle } from 'react-icons/fi'
import { HiPencilSquare } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';

interface UnverifiedWalletProps {
    balance: string;
    isActive: boolean;
    status?: string;
}

const UnverifiedWallet = ({ balance, isActive, status }: UnverifiedWalletProps) => {
    const navigate = useNavigate();

    const isFailed = status === "failed";

    return (
        <div className='px-5 max-w-[800px] mx-auto'>

            {/* Alert */}
            <div className={`flex items-center gap-3 rounded-lg p-3 mt-8 
                ${isFailed ? "bg-red-100 text-red-600" : "bg-[#DBEAFE] text-[#2563EB]"}`}>

                <FiAlertCircle className='text-[24px]' />

                <p className='text-xs font-medium leading-4'>
                    {isFailed
                        ? "Your bank verification failed. Please update your details and try again."
                        : "We're verifying your bank details. This usually takes 24-48 hours. You can still accept bookings in the meantime."
                    }
                </p>
            </div>

            {/* Balance Card */}
            <div className='flex flex-col gap-2 mt-8 items-center justify-center h-[150px] w-full rounded-lg bg-[#2563EB] py-8 text-white'>
                <p className='text-[#F1F5F9] text-lg font-semibold'>Account Balance</p>
                <p className='font-bold text-[28px]'>₹{balance}</p>

                <p
                    className={`rounded-full py-1 px-3 text-[11px] font-semibold 
                    ${isFailed
                            ? "bg-red-500"
                            : isActive
                                ? "bg-[#34C759]"
                                : "bg-[#F59E0B]"
                        }`}
                >
                    {isFailed
                        ? "Verification Failed"
                        : isActive
                            ? "Wallet Active"
                            : "Verification Pending"
                    }
                </p>
            </div>

            {/* Empty state */}
            <p className='text-center text-[#475569] text-sm mt-8 max-w-[278px] mx-auto'>
                No Transactions Yet. Your earnings will appear here
            </p>

            {/* CTA */}
            <button
                onClick={() => navigate('/wallet/edit')}
                className='mt-8 bg-[#ffffff] border border-[#2563EB] text-[#2563EB] py-2 px-6 rounded-md w-full font-semibold text-sm h-[50px]'
            >
                <HiPencilSquare className='inline mr-1 mb-1' />
                {isFailed ? "Fix Bank Details" : "Edit Bank Details"}
            </button>
        </div>
    );
};

export default UnverifiedWallet