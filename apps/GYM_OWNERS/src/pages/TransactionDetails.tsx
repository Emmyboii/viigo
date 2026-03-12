import { FaHashtag, FaRegClock, FaUser, FaUserCircle } from 'react-icons/fa';
import { FiArrowLeft } from 'react-icons/fi';
import { HiOutlineCalendar, HiShare } from 'react-icons/hi';
import { useNavigate, useParams } from 'react-router-dom';
import profile from '../assets/userProfileImg.png'
import { HiMiniCurrencyRupee } from 'react-icons/hi2';
import { TbDownload } from 'react-icons/tb';
import NotFound from './NotFound';
import { useAppContext } from '../context/AppContext';
import { useEffect, useRef, useState } from 'react';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const formatAmount = (n: number) => `${n > 0 ? "+" : "-"}₹${Math.abs(n)}`;


interface GuestDetails {
    name: string;
    duration: string;
    amount_paid: string;
    avatar: string | null;
}

interface SessionDetails {
    booking_id: string;
    date: string;
    start_time: string;
    end_time: string;
}

interface PaymentBreakdown {
    base_price: string;
    platform_fee: string;
    total_earnings: string;
}

interface WalletTransactionDetail {
    id: string;
    amount: string;
    status: 'PENDING' | 'SETTLED' | 'FAILED';
    transaction_type: 'EARNING' | 'REFUND' | 'WITHDRAWAL';
    is_credit: string;
    created_at: string;

    guest_details: GuestDetails;
    session_details: SessionDetails;
    payment_breakdown: PaymentBreakdown;
}

const TransactionDetails = () => {

    const { request, loading } = useAppContext();
    const { id } = useParams();
    const navigate = useNavigate();
    const captureRef = useRef<HTMLDivElement | null>(null);

    const [transaction, setTransaction] = useState<WalletTransactionDetail | null>(null);
    const [fetching, setFetching] = useState<boolean>(true);

    const downloadPDF = async () => {
        if (!captureRef.current) return;

        const canvas = await html2canvas(captureRef.current, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`transaction-${transaction?.id}.pdf`);
    };

    const sharePage = async () => {
        if (!captureRef.current) return;

        const canvas = await html2canvas(captureRef.current, { scale: 2 });

        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve)
        );

        if (!blob) return;

        const file = new File([blob], `transaction-${transaction?.id}.png`, {
            type: "image/png",
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: "Transaction Details",
                    text: "Here is my transaction detail.",
                });
            } catch (err) {
                console.error("Share failed", err);
            }
        } else {
            alert("Sharing not supported on this browser.");
        }
    };

    useEffect(() => {
        const fetchTransaction = async () => {
            try {
                setFetching(true);
                const data = await request<WalletTransactionDetail>(`/wallet/transactions/${id}/`);
                setTransaction(data);
            } catch (err) {
                console.error(err);
                setTransaction(null);
            } finally {
                setFetching(false);
            }
        };

        if (id) fetchTransaction();
    }, [id, request]);

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4 p-8 bg-white animate-fadeIn">
                    <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-700 text-lg font-medium">
                        Fetching your transaction details...
                    </p>
                    <p className="text-gray-400 text-sm text-center">
                        This might take a few seconds. Sit tight!
                    </p>
                </div>
            </div>
        );
    }

    if (!transaction) return <NotFound Loading={loading} />;

    const amountNum = parseFloat(transaction.amount) || 0;

    return (
        <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} title="Go back" aria-label="Go back">
                    <FiArrowLeft />
                </button>
                <h2 className="font-semibold text-lg">Transaction Details</h2>
            </div>

            <div ref={captureRef} className="space-y-4">
                {/* Amount */}
                <div className="text-center pt-5">
                    <h1 className="text-2xl font-bold">
                        {formatAmount(amountNum)}
                    </h1>
                    <p className={`text-white rounded-full py-1 px-3 my-3 w-fit mx-auto text-xs ${transaction.status === 'SETTLED'
                        ? 'bg-[#22C55E]'
                        : transaction.status === 'PENDING'
                            ? 'bg-[#FACC15]'
                            : 'bg-[#EF4444]'
                        }`}>
                        {transaction.status}
                    </p>
                    <p className="text-xs text-[#0F172A]">{new Date(transaction.created_at).toLocaleString()}</p>
                </div>

                <div className='border border-[#DBEAFE] py-3 px-4 rounded-md space-y-4'>
                    <div className="flex items-center justify-between">
                        <div className="space-y-3">
                            <p className="text-[#0F172A] font-semibold">Guest</p>
                            <div className="flex items-center gap-2">
                                <FaUser size={16} />
                                <p className="text-[#0F172A] font-normal text-sm">
                                    {transaction.guest_details?.name || 'N/A'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaRegClock size={16} />
                                <p className="text-[#0F172A] font-normal text-sm">
                                    {transaction.guest_details?.duration}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <HiMiniCurrencyRupee size={19} />
                                <p className="text-[#0F172A] font-normal text-sm">Amount Paid : <span className='font-semibold'>₹{amountNum}</span></p>
                            </div>
                        </div>

                        <img
                            src={transaction.guest_details?.avatar || profile}
                            className="w-[69px] h-[69px] rounded-full object-cover"
                            alt="Profile Image"
                        />

                        <div className="w-[69px] h-[69px] rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
                            {transaction.guest_details?.avatar ? (
                                <img src={transaction.guest_details?.avatar} className="w-full h-full object-cover" alt="Profile Image" />
                            ) : (
                                <FaUserCircle size={60} className="text-gray-400" />
                            )}
                        </div>
                    </div>

                    <div className="border border-[#F2F2F2] border-dotted"></div>

                    {/* ===== Status-specific Details ===== */}
                    <div className="space-y-3 mt-2">
                        <p className="text-[#0F172A] font-semibold">Session Details</p>

                        <div className="space-y-3">
                            <p className="text-[#0F172A] text-sm">
                                <FaHashtag className="inline mr-1" />
                                Booking ID : {transaction.session_details?.booking_id}
                            </p>

                            <p className="text-[#0F172A] text-sm">
                                <HiOutlineCalendar className="inline mr-1" />
                                {transaction.session_details?.date}
                            </p>

                            <p className="text-[#0F172A] text-sm">
                                <FaRegClock className='inline mr-1' />
                                Start Time:
                                <span className='font-semibold'>
                                    {transaction.session_details?.start_time}
                                </span>
                            </p>

                            <p className="text-[#0F172A] text-sm">
                                <FaRegClock className='inline mr-1' />
                                End Time:
                                <span className='font-semibold'>
                                    {transaction.session_details?.end_time}
                                </span>
                            </p>
                        </div>

                    </div>
                </div>

                <div className='pt-5 space-y-3'>
                    <p className="font-semibold text-base">Payment breakdown</p>

                    <p className="text-sm flex justify-between">
                        <span className='text-[#6A6A6A]'>Base Price</span>
                        <span>₹{transaction.payment_breakdown?.base_price}</span>
                    </p>

                    <p className="text-sm flex justify-between">
                        <span className='text-[#6A6A6A]'>Platform Fee</span>
                        <span>₹{transaction.payment_breakdown?.platform_fee}</span>
                    </p>

                    <div className="border border-[#F2F2F2] border-dotted"></div>

                    <p className="text-sm flex justify-between">
                        <span className='text-[#0F172A]'>Total Earnings</span>
                        <span className='text-[#22C55E] font-semibold'>
                            ₹{transaction.payment_breakdown?.total_earnings}
                        </span>
                    </p>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 py-5">
                <button
                    type="button"
                    className="flex-1 bg-[#DBEAFE] text-[#2563EB] py-2 rounded-full text-sm"
                    onClick={downloadPDF}
                >
                    <TbDownload className='inline mr-1 mb-0.5' />
                    Save PDF
                </button>

                <button
                    type="button"
                    className="flex-1 bg-[#DBEAFE] text-[#2563EB] py-2 rounded-full text-sm"
                    onClick={sharePage}
                >
                    <HiShare className='inline mr-1 mb-0.5' />
                    Share
                </button>
            </div>
        </div>
    );
}

export default TransactionDetails