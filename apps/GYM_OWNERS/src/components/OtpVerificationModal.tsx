import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import profile from '../assets/userProfileImg.png'
import { FaUser, FaRegClock } from "react-icons/fa6";
import { HiMiniCurrencyRupee } from 'react-icons/hi2';
import { HiOutlineCalendar } from 'react-icons/hi';
import BottomSheet from './BottomSheet';
import { useEffect, useState } from 'react';
import upcoming from '../assets/otpChecking.png'

interface User {
    id: string;
    name: string;
    status: "active" | "upcoming" | "completed" | "cancelled" | "inactive";
    date: string;
    duration: string;
    remainingTime: string;
    image?: string;
}

type OtpVerificationModalProps = {
    user?: User;
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

    // Determine dynamic status text
    const getStatusText = () => {
        switch (user?.status) {
            case "active": return "OTP Verified";
            case "upcoming": return "OTP Verified Required";
            case "completed": return "OTP Verified";
            case "cancelled": return "OTP Not Verified";
            default: return "";
        }
    };

    const bookingIdText = () => {
        switch (user?.status) {
            case "active": return `Booking ID #${user?.id} has been verified and the session has started`;
            case "upcoming": return `Booking ID #${user?.id} has to be verified and then the session will start`;
            case "completed": return `Booking ID #${user?.id} has been verified and the session has been completed`;
            case "cancelled": return `Booking ID #${user?.id} has been cancelled before the session has started`;
            default: return "";
        }
    };

    const getRemainingTime = () => {
        if (user?.status === "active") return user?.remainingTime + " left";
        if (user?.status === "upcoming") return user?.remainingTime;
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-28 overflow-x-hidden px-6 animate-slideUp">

            {/* Top Success Section */}
            <div className="flex flex-col items-center pt-10 pb-6">
                {(user?.status === "active" || user?.status === "completed") ? (
                    <FaCheckCircle className="text-green-500 text-[65px]" />
                ) : user?.status === "upcoming" ? (
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
                            <p className="text-[#0F172A] font-normal text-sm">{user?.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaRegClock size={16} />
                            <p className="text-[#0F172A] font-normal text-sm">{user?.duration}</p>
                            {user?.status === "active" && (
                                <p className='bg-[#22C55E] rounded-full text-white font-medium p-1 px-2 text-xs'>
                                    Active
                                </p>
                            )}
                            {user?.status === "upcoming" && (
                                <p className='bg-[#FACC15] rounded-full text-white font-medium p-1 px-2 text-xs'>
                                    Upcoming
                                </p>
                            )}
                            {user?.status === "completed" && (
                                <p className='bg-[#CBD5E1] rounded-full text-white font-medium p-1 px-2 text-xs'>
                                    Completed
                                </p>
                            )}
                            {user?.status === "cancelled" && (
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

                    <img src={user?.image || profile} className="w-[69px] rounded-full" alt="Profile Image" />
                </div>

                <div className="border border-[#F2F2F2] border-dotted"></div>

                {/* ===== Status-specific Details ===== */}
                <div className="space-y-3 mt-2">
                    {user?.status === "cancelled" && (
                        <div className="space-y-1">
                            <p className="text-[#0F172A] font-semibold">Session Cancelled</p>
                            <p className="text-[#0F172A] text-sm"><HiOutlineCalendar className='inline mr-1' /> {user.date}</p>
                        </div>
                    )}

                    {(user?.status === "completed" || user?.status === "active") && (
                        <>
                            <div className="space-y-1">
                                <p className="text-[#0F172A] font-semibold">Session Completed</p>
                                <p className="text-[#0F172A] text-sm"><HiOutlineCalendar className="inline mr-1" /> {user.date}</p>
                                <p className="text-[#0F172A] text-sm"><FaRegClock className='inline mr-1' /> Start Time: <span className='font-semibold'> 10 AM</span></p>
                                <p className="text-[#0F172A] text-sm"><FaRegClock className='inline mr-1' /> End Time: <span className='font-semibold'> 12 PM</span></p>
                            </div>

                            <div className="border border-[#F2F2F2] border-dotted"></div>

                            {user?.status === "completed" && (
                                <p className='text-[#2563EB] font-medium text-xs'>Session Ended</p>
                            )}
                        </>
                    )}

                    {user?.status === "upcoming" && (
                        <div className="space-y-1">
                            <p className="text-[#0F172A] font-semibold">Session Upcoming</p>
                            <p className="text-[#0F172A] text-sm"><HiOutlineCalendar className="inline mr-1" /> {user.date}</p>
                            <p className="text-[#0F172A] text-sm"> <FaRegClock className='inline mr-1' /> Check-in anytime during working hours</p>
                        </div>
                    )}
                </div>

                {getRemainingTime() && (
                    <div className='space-y-1'>
                        <p className='text-[#475569] font-medium text-xs'>
                            {user?.status === "active" ? "Remaining Time" : user?.status === "upcoming" ? "Last Entry is at" : ""}
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

                    {user?.status === "cancelled" && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-[#6A6A6A]">Amount Paid</p>
                            <p className="text-sm font-medium text-[#0F172A]">Rs. 420</p>
                        </div>
                    )}


                    <div className="border border-dashed border-[#CBD5E1]"></div>

                    {user?.status === "cancelled" ? (
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
