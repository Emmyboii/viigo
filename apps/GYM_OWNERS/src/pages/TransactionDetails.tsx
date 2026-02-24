import { FaHashtag, FaRegClock, FaUser } from 'react-icons/fa';
import { FiArrowLeft } from 'react-icons/fi';
import { HiOutlineCalendar, HiShare } from 'react-icons/hi';
import { useNavigate, useParams } from 'react-router-dom';
import profile from '../assets/userProfileImg.png'
import { HiMiniCurrencyRupee } from 'react-icons/hi2';
import { TbDownload } from 'react-icons/tb';

type Transaction = {
    id: string;
    name: string;
    date: Date;
    formattedDate: string;
    time: string;
    amount: number;
    status: "Settled" | "Refunded";
    type: "booking" | "refund";
    hours: number;
    amountPaid: number;
    bookingId: number;
    start: string;
    end: string;
};

const transactions: Transaction[] = Array.from({ length: 18 }).map((_, i) => {
    const positive = i % 3 !== 0;

    // generate dates within last 40 days
    const daysAgo = Math.floor(Math.random() * 40);
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - daysAgo);

    return {
        id: (1000 + i).toString(),
        name: "Geetanjali",
        date: dateObj,
        formattedDate: dateObj.toDateString(),
        time: "10:30 AM",
        amount: positive ? 390 : -390,
        status: positive ? "Settled" : "Refunded",
        type: positive ? "booking" : "refund",
        hours: 2,
        amountPaid: 410,
        bookingId: 39328 + i,
        start: "10 AM",
        end: "12 PM",
    };
});

const formatAmount = (n: number) => `${n > 0 ? "+" : "-"}₹${Math.abs(n)}`;

const TransactionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const tx = transactions.find((t) => t.id === id);
    if (!tx) return <div className="p-4">Not found</div>;

    return (
        <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} title="Go back" aria-label="Go back">
                    <FiArrowLeft />
                </button>
                <h2 className="font-semibold text-lg">Transaction Details</h2>
            </div>

            {/* Amount */}
            <div className="text-center pt-5">
                <h1 className="text-2xl font-bold">
                    {formatAmount(tx.amount)}.00
                </h1>
                <p className="text-white bg-[#22C55E] rounded-full py-1 px-3 my-3 w-fit mx-auto text-xs">{tx.status}</p>
                <p className="text-xs text-[#0F172A]">{tx.formattedDate} • {tx.time}</p>
            </div>

            <div className='border border-[#DBEAFE] py-3 px-4 rounded-md space-y-4'>
                <div className="flex items-center justify-between">
                    <div className="space-y-3">
                        <p className="text-[#0F172A] font-semibold">Guest</p>
                        <div className="flex items-center gap-2">
                            <FaUser size={16} />
                            <p className="text-[#0F172A] font-normal text-sm">Vijay</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaRegClock size={16} />
                            <p className="text-[#0F172A] font-normal text-sm">2 hours</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <HiMiniCurrencyRupee size={19} />
                            <p className="text-[#0F172A] font-normal text-sm">Amount Paid : <span className='font-semibold'>₹390</span></p>
                        </div>
                    </div>

                    <img src={profile} className="w-[69px] rounded-full" alt="Profile Image" />
                </div>

                <div className="border border-[#F2F2F2] border-dotted"></div>

                {/* ===== Status-specific Details ===== */}
                <div className="space-y-3 mt-2">
                    <p className="text-[#0F172A] font-semibold">Session Details</p>

                    <div className="space-y-3">
                        <p className="text-[#0F172A] text-sm"><FaHashtag className="inline mr-1" />Booking ID : 39328</p>
                        <p className="text-[#0F172A] text-sm"><HiOutlineCalendar className="inline mr-1" />12th may 2026</p>
                        <p className="text-[#0F172A] text-sm"><FaRegClock className='inline mr-1' /> Start Time: <span className='font-semibold'> 10 AM</span></p>
                        <p className="text-[#0F172A] text-sm"><FaRegClock className='inline mr-1' /> End Time: <span className='font-semibold'> 12 PM</span></p>
                    </div>

                </div>
            </div>

            <div className='pt-5 space-y-3'>
                <p className="font-semibold text-base">Payment breakdown</p>
                <p className="text-sm flex justify-between">
                    <span className='text-[#6A6A6A]'>1.5 Hours  x 1</span>
                    <span>₹410</span>
                </p>
                <p className="text-sm flex justify-between">
                    <span className='text-[#6A6A6A]'>Platform Fee</span>
                    <span>₹10</span>
                </p>

                <div className="border border-[#F2F2F2] border-dotted"></div>

                <p className="text-sm flex justify-between">
                    <span className='text-[#0F172A]'>Total Earnings</span>
                    <span className='text-[#22C55E] font-semibold'>Rs.400</span>
                </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 py-5">
                <button
                    type="button"
                    className="flex-1 bg-[#DBEAFE] text-[#2563EB] py-2 rounded-full text-sm"
                >
                    <TbDownload className='inline mr-1 mb-0.5' />
                    Save PDF
                </button>

                <button
                    type="button"
                    className="flex-1 bg-[#DBEAFE] text-[#2563EB] py-2 rounded-full text-sm"
                >
                    <HiShare className='inline mr-1 mb-0.5' />
                    Share
                </button>
            </div>
        </div>
    );
}

export default TransactionDetails