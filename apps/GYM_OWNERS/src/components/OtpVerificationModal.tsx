import { FaCheckCircle, FaTimesCircle, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaRegClock } from "react-icons/fa6";
import { HiMiniCurrencyRupee } from 'react-icons/hi2';
import { HiOutlineCalendar } from 'react-icons/hi';
import BottomSheet from './BottomSheet';
import { useEffect, useState } from 'react';
import upcoming from '../assets/otpChecking.png'
import type { Booking } from '../context/AppContext';

type OtpVerificationModalProps = {
    user?: Booking;
    onClose: () => void;
};

export default function OtpVerificationModal({ user, onClose }: OtpVerificationModalProps) {

    const navigate = useNavigate();
    const [priceBreakdownOpen, setPriceBreakdownOpen] = useState(false);

    useEffect(() => {
        if (priceBreakdownOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "auto"
        }

        return () => {
            document.body.style.overflow = "auto"
        }
    }, [priceBreakdownOpen])

    const durationText = user?.duration_text || "";

    // get "2.5 Hrs"
    const durationMatch = durationText.match(/\d+(\.\d+)?\s*Hrs?/i);
    const duration = durationMatch ? durationMatch[0] : "";

    const text = user?.contextual_text || "";


    // match time like 08:31 PM
    const match = text.match(/\d{1,2}:\d{2}\s?(AM|PM)/i);

    const time = match ? match[0] : "";

    const formattedTime = time.replace(/\s/, "");


    const isActive = user?.status === "ACTIVE";
    const isUpcoming = user?.status === "CONFIRMED";
    const isCancelled = user?.status === "CANCELLED";

    // Determine dynamic status text
    const getStatusText = () => {
        if (isActive) return "OTP Verified";
        if (isUpcoming) return "OTP Verification Required";
        if (isCancelled) return "OTP Not Verified";
        return "";
    };

    // const getStatusText = () => {
    //     switch (user?.status) {
    //         case "active": return "OTP Verified";
    //         case "upcoming": return "OTP Verified Required";
    //         case "completed": return "OTP Verified";
    //         case "cancelled": return "OTP Not Verified";
    //         default: return "";
    //     }
    // };

    // const bookingIdText = () => {
    //     switch (user?.status) {
    //         case "active": return `Booking ID #${user?.id} has been verified and the session has started`;
    //         case "upcoming": return `Booking ID #${user?.id} has to be verified and then the session will start`;
    //         case "completed": return `Booking ID #${user?.id} has been verified and the session has been completed`;
    //         case "cancelled": return `Booking ID #${user?.id} has been cancelled before the session has started`;
    //         default: return "";
    //     }
    // };

    const bookingIdText = () => {
        if (isActive)
            return `Booking ID #${user?.id} has been verified and the session has started`;

        if (isUpcoming)
            return `Booking ID #${user?.id} has to be verified before the session starts`;

        if (isCancelled)
            return `Booking ID #${user?.id} has been cancelled`;

        return "";
    };

    const getRemainingTime = () => {
        if (isActive) return `${user?.contextual_text} left`;
        if (isUpcoming) return formattedTime;
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-28 overflow-x-hidden px-6 animate-slideUp">

            {/* Top Success Section */}
            <div className="flex flex-col items-center pt-10 pb-6">
                {/* {(user?.status === "CONFIRMED" || user?.status === "completed") ? ( */}
                {(user?.status === "ACTIVE" || user?.status === "COMPLETED") ? (
                    <FaCheckCircle className="text-green-500 text-[65px]" />
                ) : user?.status === "CONFIRMED" ? (
                    <img src={upcoming} className="w-16 h-16" alt="Upcoming Status" />
                ) : (
                    <FaTimesCircle className="text-red-500 text-[65px]" />
                )}

                <h1 className="mt-1 text-lg font-semibold text-[#0F172A]">{getStatusText()}</h1>
                <p className="text-gray-500 text-sm text-center">
                    {bookingIdText()}
                </p>
            </div>

            {/* User Details */}
            <div className='border border-[#DBEAFE] py-3 px-4 rounded-md space-y-4'>
                <div className="flex items-center justify-between">
                    <div className="space-y-3">
                        <p className="text-[#0F172A] font-semibold">Guest</p>
                        <div className="flex items-center gap-2">
                            <FaUser size={16} />
                            <p className="text-[#0F172A] font-normal text-sm">{user?.client_name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaRegClock size={16} />
                            <p className="text-[#0F172A] font-normal text-sm">{duration}</p>
                            {user?.status === "ACTIVE" && (
                                <p className='bg-[#22C55E] rounded-full text-white font-medium p-1 px-2 text-xs'>
                                    Active
                                </p>
                            )}
                            {user?.status === "CONFIRMED" && (
                                <p className='bg-[#FACC15] rounded-full text-white font-medium p-1 px-2 text-xs'>
                                    Upcoming
                                </p>
                            )}
                            {user?.status === "COMPLETED" && (
                                <p className='bg-[#CBD5E1] rounded-full text-white font-medium p-1 px-2 text-xs'>
                                    Completed
                                </p>
                            )}
                            {user?.status === "CANCELLED" && (
                                <p className='bg-[#FDECEA] text-[#F43F5E] rounded-full font-medium p-1 px-2 text-xs'>
                                    Cancelled
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <HiMiniCurrencyRupee size={19} />
                            <p className="text-[#0F172A] font-normal text-sm">Amount Paid : <span className='font-semibold'>₹390</span></p>
                        </div>
                    </div>

                    <div className="w-[66px] h-[66px] flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
                        {user?.client_image ? (
                            <img
                                src={`https://api.viigo.in/${user?.client_image}`}
                                alt={user?.client_image}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <FaUserCircle className="text-gray-400 text-7xl" />
                        )}
                    </div>
                </div>

                <div className="border border-[#F2F2F2] border-dotted"></div>

                {/* ===== Status-specific Details ===== */}
                <div className="space-y-3 mt-2">
                    {user?.status === "CANCELLED" && (
                        <div className="space-y-1">
                            <p className="text-[#0F172A] font-semibold">Session Cancelled</p>
                            <p className="text-[#0F172A] text-sm"><HiOutlineCalendar className='inline mr-1' /> {user.display_date}</p>
                        </div>
                    )}

                    {(user?.status === "COMPLETED") && (
                        <>
                            <div className="space-y-1">
                                <p className="text-[#0F172A] font-semibold">Session Completed</p>
                                <p className="text-[#0F172A] text-sm"><HiOutlineCalendar className="inline mr-1" /> {user.display_date}</p>
                                <p className="text-[#0F172A] text-sm"><FaRegClock className='inline mr-1' /> Start Time: <span className='font-semibold'> 10 AM</span></p>
                                <p className="text-[#0F172A] text-sm"><FaRegClock className='inline mr-1' /> End Time: <span className='font-semibold'> 12 PM</span></p>
                            </div>

                            <div className="border border-[#F2F2F2] border-dotted"></div>

                            {user?.status === "COMPLETED" && (
                                <p className='text-[#2563EB] font-medium text-xs mt-5'>Session Ended</p>
                            )}
                        </>
                    )}

                    {user?.status === "CONFIRMED" && (
                        <div className="space-y-1">
                            <p className="text-[#0F172A] font-semibold">Session Upcoming</p>
                            <p className="text-[#0F172A] text-sm"><HiOutlineCalendar className="inline mr-1" /> {user.display_date}</p>
                            <p className="text-[#0F172A] text-sm"> <FaRegClock className='inline mr-1' /> Check-in anytime during working hours</p>
                        </div>
                    )}
                </div>

                {getRemainingTime() && (
                    <div className='space-y-1'>
                        <p className='text-[#475569] font-medium text-xs'>
                            {user?.status === "ACTIVE" ? "Remaining Time" : user?.status === "CONFIRMED" ? "Last Entry is at" : ""}
                        </p>
                        <p className='text-[#1D4ED8] font-semibold text-base'>{getRemainingTime()}</p>
                    </div>
                )}
            </div>

            {/* Bottom Buttons */}
            <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-[#F1F5F9] flex gap-4 items-center justify-between">
                <button
                    onClick={() => setPriceBreakdownOpen(true)}
                    className="text-blue-600 text-sm font-medium"
                >
                    View Payment Details
                </button>

                <button onClick={() => {
                    onClose();
                    navigate('/')
                }}
                    className="bg-blue-600 text-white py-3 rounded-md min-w-[140px]"
                >
                    Home
                </button>
            </div>

            {/* ===== Price Breakdown Bottom Sheet ===== */}
            <BottomSheet
                open={priceBreakdownOpen}
                onClose={() => setPriceBreakdownOpen(false)}
                title="Price Breakdown"
            >
                <div className="border border-[#DBEAFE] py-3 px-4 rounded-md space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[#6A6A6A]">2Hours</p>
                        <p className="text-sm font-medium text-[#0F172A]">Rs. 410</p>
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[#6A6A6A]">Platform Fee</p>
                        <p className="text-sm font-medium text-[#0F172A]">Rs. 10</p>
                    </div>

                    {user?.status === "CANCELLED" && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-[#6A6A6A]">Amount Paid</p>
                            <p className="text-sm font-medium text-[#0F172A]">Rs. 420</p>
                        </div>
                    )}


                    <div className="border border-dashed border-[#CBD5E1]"></div>

                    {user?.status === "CANCELLED" ? (
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-[#6A6A6A]">Total</p>
                            <p className="text-sm font-medium text-[#0F172A]">Rs. 400</p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-[#6A6A6A]">Total</p>
                            <p className="text-sm font-medium text-[#0F172A]">Rs. 420</p>
                        </div>
                    )}
                </div>
            </BottomSheet>
        </div>
    )
}
