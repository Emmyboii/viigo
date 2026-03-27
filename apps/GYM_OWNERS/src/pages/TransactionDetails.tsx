import { FaHashtag, FaRegClock, FaUser, FaUserCircle } from 'react-icons/fa';
import { FiArrowLeft } from 'react-icons/fi';
import { HiOutlineCalendar, HiShare } from 'react-icons/hi';
import { HiMiniCurrencyRupee } from 'react-icons/hi2';
import { TbDownload } from 'react-icons/tb';
import { useAppContext } from '../context/AppContext';
import { useEffect, useRef, useState } from 'react';
// import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import { snapdom } from '@zumer/snapdom';

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

export interface WalletTransactionDetail {
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

const dummyTransaction: WalletTransactionDetail = {
    id: "1",
    amount: "1500",
    status: "SETTLED",
    transaction_type: "EARNING",
    is_credit: "true",
    created_at: new Date().toISOString(),

    guest_details: {
        name: "John Doe",
        duration: "2 hours",
        amount_paid: "1500",
        avatar: null,
    },

    session_details: {
        booking_id: "BK123456",
        date: "Mar 27, 2026",
        start_time: "10:00 AM",
        end_time: "12:00 PM",
    },

    payment_breakdown: {
        base_price: "1200",
        platform_fee: "300",
        total_earnings: "1500",
    },
};

const TransactionDetails = ({ id, setSelectedTransactionId }: { id: number, setSelectedTransactionId: (id: null) => void }) => {


    const { request } = useAppContext();

    // const navigate = useNavigate();
    const captureRef = useRef<HTMLDivElement | null>(null);

    const [transaction, setTransaction] = useState<WalletTransactionDetail | null>(null);
    const [fetching, setFetching] = useState<boolean>(true);

      const captureFullCanvas = async () => {
        if (!captureRef.current) return null;

        const originalOverflow = captureRef.current.style.overflow;
        captureRef.current.style.overflow = "visible"; // temporarily expand scrollable content

        try {
            await document.fonts.ready;

            const scale = window.innerWidth < 850 ? 1 : 2; // lower scale on mobile
            const canvasEl = await snapdom.toCanvas(captureRef.current, {
                scale,
                backgroundColor: "#ffffff",
            });
            return canvasEl;
        } finally {
            captureRef.current.style.overflow = originalOverflow;
        }
    };

    const downloadPDF = async () => {
        const canvasEl = await captureFullCanvas();
        if (!canvasEl || !transaction) return;

        const dataUrl = canvasEl.toDataURL("image/jpeg", 0.85); // compressed JPEG
        const pdf = new jsPDF("p", "mm", "a4");
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(dataUrl, "JPEG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`transaction-${transaction.id}.pdf`);
    };

    const sharePage = async () => {
        if (!captureRef.current) return;

        try {
            await document.fonts.ready;

            // Snapdom for canvas
            const canvasEl = await snapdom.toCanvas(captureRef.current, {
                scale: 2,
                backgroundColor: "#ffffff",
            });

            // Convert canvas → Blob
            const blob = await new Promise<Blob | null>((resolve) =>
                canvasEl.toBlob(resolve, "image/png")
            );
            if (!blob) throw new Error("Failed to create image blob");

            const file = new File(
                [blob],
                `transaction-${transaction?.id}.png`,
                { type: "image/png" }
            );

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: "Transaction Details",
                    text: "Here is my transaction detail.",
                });
            } else {
                // fallback download
                const link = document.createElement("a");
                link.href = URL.createObjectURL(file);
                link.download = `transaction-${transaction?.id}.png`;
                link.click();
            }
        } catch (err) {
            console.error("Share failed:", err);
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
                setTransaction(dummyTransaction);
            } finally {
                setFetching(false);
            }
        };

        if (id) fetchTransaction();
    }, [id, request]);

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0C0A0AC7] mk:bg-transparent">
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

    // if (!transaction) return <NotFound Loading={loading} />;

    // If API failed AND you later want real behavior
    if (!transaction) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center">
                <p className="text-sm font-semibold text-gray-700">
                    Transaction not found
                </p>
                <p className="text-xs text-gray-500">
                    We couldn’t retrieve this transaction. Please try again.
                </p>
            </div>
        );
    }

    // Always fallback to dummy for now
    const displayTransaction = transaction || dummyTransaction;

    const amountNum = parseFloat(displayTransaction.amount) || 0;

    return (
        <div className={`fixed mk:flex flex-col justify-center z-50 bg-white overflow-y-auto inset-0 mk:inset-auto mk:right-0 mk:top-0 mk:min-h-screen mk:w-[480px] mk:p-5 ${window.innerWidth >= 850 ? "animate-slideRight" : "animate-slideUp"}`}>
            {/* Header */}
            <div className="flex mk:hidden items-center px-4 gap-3 pt-4">
                <button onClick={() => setSelectedTransactionId(null)} title="Go back" aria-label="Go back">
                    <FiArrowLeft />
                </button>
                <h2 className="font-semibold text-lg">Transaction Details</h2>
            </div>

            <div ref={captureRef} className="space-y-4 px-4">
                {/* Amount */}
                <div className="text-center pt-5">
                    <h1 className="text-[28px] font-bold">
                        {formatAmount(amountNum)}
                    </h1>
                    <p className={`text-white rounded-full py-1 px-3 my-3 w-fit mx-auto text-xs ${displayTransaction.status === 'SETTLED'
                        ? 'bg-[#22C55E]'
                        : displayTransaction.status === 'PENDING'
                            ? 'bg-[#FACC15]'
                            : 'bg-[#EF4444]'
                        }`}>
                        {displayTransaction.status}
                    </p>
                    <p className="text-xs text-[#0F172A] font-medium">{new Date(displayTransaction.created_at).toLocaleString()}</p>
                </div>

                <div className='border border-[#DBEAFE] py-3 px-4 rounded-md space-y-4'>
                    <div className="flex items-center justify-between">
                        <div className="space-y-3">
                            <p className="text-[#0F172A] font-semibold">Guest</p>
                            <div className="flex items-center gap-2 text-nowrap">
                                <FaUser size={14} />
                                <p className="text-[#0F172A] font-normal text-sm">
                                    {displayTransaction.guest_details?.name || 'N/A'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-nowrap">
                                <FaRegClock size={14} />
                                <p className="text-[#0F172A] font-normal text-sm">
                                    {displayTransaction.guest_details?.duration}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-nowrap">
                                <HiMiniCurrencyRupee size={17} />
                                <p className="text-[#0F172A] font-normal text-sm">Amount Paid : <span className='font-semibold'>₹{amountNum}</span></p>
                            </div>
                        </div>

                        {/* <img
                            src={displayTransaction.guest_details?.avatar ? displayTransaction.guest_details?.avatar : profile}
                            className="w-[69px] h-[69px] rounded-full object-cover"
                            alt="Profile Image"
                        /> */}

                        <div className="w-[69px] h-[69px] rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
                            {displayTransaction.guest_details?.avatar ? (
                                <img src={displayTransaction.guest_details?.avatar} className="w-full h-full object-cover" alt="Profile Image" />
                            ) : (
                                <FaUserCircle size={80} className="text-gray-400" />
                            )}
                        </div>
                    </div>

                    <div className="border border-[#F2F2F2] border-dotted"></div>

                    {/* ===== Status-specific Details ===== */}
                    <div className="space-y-3 mt-2">
                        <p className="text-[#0F172A] text-nowrap font-semibold">Session Details</p>

                        <div className="space-y-3">
                            <p className="text-[#0F172A] text-nowrap text-sm">
                                <FaHashtag className="inline mr-1" />
                                Booking ID : {displayTransaction.session_details?.booking_id}
                            </p>

                            <p className="text-[#0F172A] text-nowrap text-sm">
                                <HiOutlineCalendar className="inline mr-1" />
                                {displayTransaction.session_details?.date}
                            </p>

                            <p className="text-[#0F172A] text-nowrap text-sm">
                                <FaRegClock className='inline mr-1' />
                                Start Time:
                                <span className='font-semibold'>
                                    {displayTransaction.session_details?.start_time}
                                </span>
                            </p>

                            <p className="text-[#0F172A] text-nowrap text-sm">
                                <FaRegClock className='inline mr-1' />
                                End Time:
                                <span className='font-semibold'>
                                    {displayTransaction.session_details?.end_time}
                                </span>
                            </p>
                        </div>

                    </div>
                </div>

                <div className='py-5 space-y-3 mk:px-5 block'>
                    <p className="font-semibold text-base text-nowrap">Payment breakdown</p>

                    <p className="text-xs text-[#0F172A] text-nowrap flex justify-between">
                        <span className='text-[#6A6A6A] text-xs'>Base Price</span>
                        <span>₹{displayTransaction.payment_breakdown?.base_price}</span>
                    </p>

                    <p className="text-xs text-[#0F172A] text-nowrap flex justify-between">
                        <span className='text-[#6A6A6A] text-xs'>Platform Fee</span>
                        <span>₹{displayTransaction.payment_breakdown?.platform_fee}</span>
                    </p>

                    <div className="border border-[#F2F2F2] border-dotted"></div>

                    <p className="text-sm flex justify-between text-nowrap">
                        <span className='text-[#0F172A]'>Total Earnings</span>
                        <span className='text-[#22C55E] font-semibold text-base'>
                            ₹{displayTransaction.payment_breakdown?.total_earnings}
                        </span>
                    </p>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 py-5 px-4">
                <button
                    type="button"
                    className="flex-1 bg-[#DBEAFE] text-[#2563EB] py-2 rounded-full font-medium text-xs"
                    onClick={downloadPDF}
                >
                    <TbDownload className='inline mr-1 mb-0.5' />
                    Save PDF
                </button>

                <button
                    type="button"
                    className="flex-1 bg-[#DBEAFE] text-[#2563EB] py-2 rounded-full font-medium text-xs"
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