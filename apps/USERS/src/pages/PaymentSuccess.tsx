import { motion } from "framer-motion";
import {
    FiMapPin,
    FiClock,
} from "react-icons/fi";
import { HiShare } from "react-icons/hi";
import halfCircle from "../assets/paymentWhiteImg.png";
import { FaCheckCircle } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAppContext, type GymCard, type RecommendedWorkoutTimings } from "../context/AppContext";
import { MdPhone } from "react-icons/md";
import { TiLocation } from "react-icons/ti";
import { snapdom } from "@zumer/snapdom";
import { PiWarningCircle } from "react-icons/pi";
import fire from '../assets/fire.png'
import leaf from '../assets/leaf.png'
import { PaymentSuccessSkeleton } from "../components/Gymskeletons ";

type PaymentSuccessProps = {
    gym: GymCard | null;
    onClose: () => void;
    bookingReference: string | null; // e.g. "VG-403763EE" from confirm response
    onReady?: () => void;        // NEW
    hideSkeleton?: boolean;
};

type BookingPass = {
    booking_reference: string;
    otp: string;
    gym_name: string;
    gym_location: string;
    gym_image: string;
    gym_owner_phone: string;
    gym_open_till: string;
    slot_type: string;
    recommended_workout_timings?: RecommendedWorkoutTimings;
    guest_name: string;
    duration_in_hours: string;
    formatted_date: string;
    gym_timings: string;
    peak_hours: string;
    last_entry_time: string;
    base_price: string;
    platform_fee: string;
    area: string;
    tax_amount: string;
    total_amount: string;
    latitude: string;
    longitude: string;
};

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function PaymentSuccess({ onClose, bookingReference, onReady, hideSkeleton }: PaymentSuccessProps) {

    const shareRef = useRef<HTMLDivElement>(null);

    const [pass, setPass] = useState<BookingPass | null>(null);
    const { userData } = useAppContext();
    const navigate = useNavigate();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const handleShare = async () => {
        if (!shareRef.current) return;

        try {
            const canvasEl = await snapdom.toCanvas(shareRef.current, {
                scale: 2,
                backgroundColor: "#ffffff",
            });

            const blob = await new Promise<Blob | null>((resolve) => {
                canvasEl.toBlob(resolve, "image/png");
            });

            if (!blob) throw new Error("Failed to create image blob");

            const file = new File([blob], "booking-pass.png", { type: "image/png" });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: "My Booking Pass" });
            } else {
                const link = document.createElement("a");
                link.href = URL.createObjectURL(file);
                link.download = "booking-pass.png";
                link.click();
            }
        } catch (err) {
            console.error("Share failed:", err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                // 1️⃣ Fetch all bookings
                const bookingsRes = await fetch(
                    `${backendUrl}/client/bookings/my-bookings/`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: localStorage.getItem("token")
                                ? `Bearer ${localStorage.getItem("token")}`
                                : "",
                        },
                    }
                );

                const bookingsData = await bookingsRes.json();
                const bookingsArray: any[] = bookingsData.data ?? [];

                // 2️⃣ Find by booking_reference from the confirm response
                //    Falls back to the most recent booking if reference isn't available
                const ref = bookingReference ?? localStorage.getItem("bookingReference");
                const foundBooking = ref
                    ? bookingsArray.find((b) => b.booking_reference === ref)
                    : bookingsArray[0];

                if (!foundBooking) {
                    setBooking(null);
                    setPass(null);
                    return;
                }

                setBooking(foundBooking);
                localStorage.setItem("selectedBookingId", String(foundBooking.id));

                // 3️⃣ Fetch pass using the matched booking ID
                const passRes = await fetch(
                    `${backendUrl}/client/booking/${foundBooking.id}/pass/`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                const passData = await passRes.json();
                setPass(passData.data);

            } catch (err) {
                console.error("Error fetching data", err);
                setPass(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [bookingReference]);

    const handlePhoneClick = () => {
        if (!pass?.gym_owner_phone) return;
        const phone = pass.gym_owner_phone.replace(/\s+/g, "");
        const link = document.createElement("a");
        link.href = `tel:${phone}`;
        link.click();
    };

    const handleLocationClick = () => {
        if (!pass) return;
        const { latitude, longitude } = pass;
        if (!latitude || !longitude) return;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        window.open(url, "_blank");
    };

    useEffect(() => {
        if (!loading) {
            onReady?.(); // fires whether it succeeded or failed
        }
    }, [loading, onReady]);

    if (loading) {
        if (hideSkeleton) return null;
        return <PaymentSuccessSkeleton />;
    }

    if (!pass || !booking) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-3">
                <p className="text-red-500 font-medium">We couldn't load your booking pass.</p>
                <button onClick={() => window.location.reload()} className="text-blue-600 underline text-sm">
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb- overflow-x-hidden max-w-[400px] mx-auto">

            <div ref={shareRef} className="px-1 pb-5">

                {/* Top Success Section */}
                <div className="flex flex-col items-center pt-10 pb-6">
                    <FaCheckCircle className="text-green-500 text-[65px]" />
                    <h1 className="mt-4 text-xl font-semibold">Payment Successful</h1>
                    <p className="text-gray-500 text-sm">
                        Booked through UPI : {userData?.email}
                    </p>
                </div>

                {/* 🎯 Animated Blue Card */}
                <motion.div
                    initial={{ scale: 0, rotate: -90, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 60, damping: 20, mass: 0.8, duration: 0.8, ease: "easeOut" }}
                    className="relative bg-gradient-to-b from-blue-600 to-blue-500 text-white rounded-3xl mx-2 p-4 shadow-xl"
                >
                    <img src={halfCircle} alt="Half Circle" className={`absolute ${pass.slot_type === "NON_PEAK" ? "bottom-[120px]" : pass.slot_type === "MORNING_PEAK" ? "bottom-[120px]" : "bottom-[100px]"} left-[-13px] w-[48px] h-[55px]`} />
                    <img src={halfCircle} alt="Half Circle" className={`absolute ${pass.slot_type === "NON_PEAK" ? "bottom-[120px]" : pass.slot_type === "MORNING_PEAK" ? "bottom-[120px]" : "bottom-[100px]"} right-[-13px] rotate-180 w-[48px] h-[55px]`} />

                    {/* Gym Header */}
                    <div className="flex gap-3">
                        <img
                            src={`https://api.viigo.in/${pass?.gym_image}`}
                            alt={pass?.gym_name || "Gym"}
                            className="w-[97px] h-[97px] rounded object-cover"
                        />
                        <div className="flex-1">
                            <div className="flex justify-between items-center gap-2">
                                <h2 className="font-semibold text-nowrap text-lg">{pass?.gym_name}</h2>
                                <div className="flex gap-3">
                                    <div onClick={handlePhoneClick} className="bg-[#BFDBFE] text-[#2563EB] p-1 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                                        <MdPhone size={16} />
                                    </div>
                                    <div onClick={handleLocationClick} className="bg-[#BFDBFE] text-[#2563EB] p-1 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                                        <TiLocation size={16} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 py-1 text-sm text-[#CBD5E1]">{pass.gym_location}</div>
                            <div className="flex items-center gap-1 text-sm opacity-90">
                                <FiMapPin className="w-4 h-4" />
                                <span className="pl-2 text-nowrap">{`${pass.gym_open_till}`}</span>
                            </div>
                        </div>
                    </div>

                    {/* Details Row */}
                    <div className="grid grid-cols-3 gap-1 justify-between mt-2 text-sm border-b border-white/30 py-4">
                        <div>
                            <p className="text-[#DBEAFE]">Guest Name</p>
                            <p className="break-all">{pass.guest_name?.split(" ")[0]}</p>
                        </div>
                        <div className="border-l border-[#FFFFFF33] pl-2">
                            <p className="text-[#DBEAFE]">Hours</p>
                            <p>{pass.duration_in_hours} Hr</p>
                        </div>
                        <div className="border-l border-[#FFFFFF33] pl-2">
                            <p className="text-[#DBEAFE]">Date</p>
                            <p>{pass?.formatted_date}</p>
                        </div>
                    </div>

                    {/* OTP Section */}
                    <div className="text-center mt-1">
                        <p className="text-[48px] font-semibold">OTP : {pass.otp}</p>
                        <p className="text-xs mt-2 max-w-[261px] mx-auto">Use OTP during check in to start your session.</p>
                        <p className="text-xs mt-2 max-w-[261px] mx-auto">This pass will be valid till the end of selected booking slot</p>
                    </div>

                    <div className="border-t border-dashed border-white/40 my-3" />

                    {pass.slot_type && (
                        <p className={`text-sm font-normal ${pass.slot_type === 'NON_PEAK' ? 'text-[#0F7D37]' : 'text-[#DC2626]'}`}>
                            {pass.slot_type === 'NON_PEAK' ? (
                                <div className="flex items-center gap-1 w-fit mx-auto py-1 mb-3 mt-4 px-2 rounded-full justify-center bg-white">
                                    <img src={leaf} className="w-[16px] flex-shrink-0" alt="" /> Non-Peak Hours
                                </div>
                            ) : pass.slot_type === 'MORNING_PEAK' ? (
                                <div className="flex items-center gap-1 w-fit mx-auto py-1 mb-3 mt-4 px-2 rounded-full justify-center bg-white">
                                    <img src={fire} className="w-[10px] flex-shrink-0" alt="" /> Morning Peak Hours
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 w-fit mx-auto py-1 mb-3 mt-4 px-2 rounded-full justify-center bg-white">
                                    <img src={fire} className="w-[10px] flex-shrink-0" alt="" /> Evening Peak Hours
                                </div>
                            )}
                        </p>
                    )}

                    {/* Timings */}
                    <div className="space-y-3 text-sm">
                        {pass.slot_type === 'NON_PEAK' && (
                            <div className="flex items-center text-nowrap text-[#FFFFFF] text-sm justify-center gap-2">
                                <FiClock className="w-4 h-4" />
                                Timings : <span>{pass.gym_timings}</span>
                            </div>
                        )}
                        {pass.slot_type === 'MORNING_PEAK' && (
                            <div className="flex items-center text-nowrap text-[#FFFFFF] text-sm justify-center gap-2">
                                <FiClock className="w-4 h-4" />
                                Timings : <span>{pass?.recommended_workout_timings?.peak_hours?.morning}</span>
                            </div>
                        )}
                        {pass.slot_type === 'EVENING_PEAK' && (
                            <div className="flex items-center text-nowrap text-[#FFFFFF] text-sm justify-center gap-2">
                                <FiClock className="w-4 h-4" />
                                Timings : <span>{pass?.recommended_workout_timings?.peak_hours?.evening}</span>
                            </div>
                        )}

                        {pass.slot_type === 'MORNING_PEAK' && (
                            <div className="flex gap-1 text-[11px] text-[#ffffff] text-center justify-center mt-2">
                                <PiWarningCircle className="rotate-180 mt-[3px]" size={14} />
                                <span>Slot starts at {pass.gym_timings.split(" - ")[0]}. You can check in anytime before {pass?.last_entry_time}.</span>
                            </div>
                        )}
                        {pass.slot_type === 'EVENING_PEAK' && (
                            <div className="flex gap-1 text-[11px] text-[#ffffff] text-center justify-center mt-2">
                                <PiWarningCircle className="rotate-180 mt-[3px]" size={14} />
                                <span>Slot starts at 5:00 PM. You can check in anytime before {pass?.last_entry_time}.</span>
                            </div>
                        )}
                        {pass.slot_type === 'NON_PEAK' && (
                            <div className="flex gap-1 text-[11px] text-[#ffffff] text-center justify-center mt-2">
                                <PiWarningCircle className="rotate-180 mt-[3px]" size={14} />
                                <span>Slot starts at 8:00 AM. You can check in anytime before {pass?.last_entry_time}.</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Change of Plans */}
            {booking?.status === "CONFIRMED" && (
                <div className="rounded-lg bg-[#F1F5F9] p-2 mx-4">
                    <div className="flex gap-3 items-center">
                        <h3 className="font-semibold text-sm">Change of Plans</h3>
                        <button onClick={() => navigate(`/cancelbooking/${pass?.booking_reference}`)} className="text-[#F43F5E] font-medium text-sm border border-[#F43F5E] px-3 py-1 rounded-md">
                            Cancel Booking
                        </button>
                    </div>

                    <div className="space-y-2 mt-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#22C55E] mt-1.5 flex-shrink-0" />
                            <p className="text-[10.5px] text-[#0F172A] leading-relaxed">Cancel at least 1 hour before your last entry time for a full refund.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#EAB308] mt-1.5 flex-shrink-0" />
                            <p className="text-[10.5px] text-[#0F172A] leading-relaxed">Cancel within 1 hour of your last entry time and receive a 50% refund.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#F43F5E] mt-1.5 flex-shrink-0" />
                            <p className="text-[10.5px] text-[#0F172A] leading-relaxed">If you don't check in before your last entry time, no refund will be issued and your booking will be marked as a No-Show.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Price Breakdown */}
            <div className="mt-6 text-sm space-y-2 px-4">
                <p className="text-sm">Price Breakdown</p>
                <div className="flex justify-between">
                    <span className="text-[#6A6A6A] font-medium">{pass.duration_in_hours} Hr (Base Fee)</span>
                    <span className="font-medium">{pass.base_price}₹</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-[#6A6A6A] font-medium">Platform Fee</span>
                    <span className="font-medium">{pass.platform_fee}₹</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-[#6A6A6A] font-medium">GST on Platform Fee</span>
                    <span className="font-medium">{pass.tax_amount}₹</span>
                </div>
                <div className="flex justify-between text-nowrap pb-2">
                    <span>Roundoff</span>
                    <span className="font-medium text-[#0F172A]">0.2₹</span>
                </div>
                <hr className="border-[0.5px] border-dotted border-[#E2E8F0]" />
                <div className="flex justify-between pt-3">
                    <span className="font-medium">Total Paid Amount</span>
                    <span className="font-medium">Rs. {pass.total_amount}</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-2 w-fit mx-auto">
                <button onClick={handleShare} className="flex-1 bg-blue-100 text-[#2563EB] w-[150px] py-2 px-2 rounded-full text-xs flex items-center justify-center gap-2">
                    <HiShare size={16} />
                    Share Pass
                </button>
            </div>

            {/* Bottom Buttons */}
            <div className="fixed max-w-[400px] mx-auto bottom-0 left-0 right-0 bg-white p-4 border-t border-[#F1F5F9] flex gap-4 items-center justify-between">
                <button onClick={() => {
                    // onClose();
                    navigate('/')
                    localStorage.removeItem("selectedBookingId");
                }}
                    className="text-blue-600 text-center w-full"
                >
                    Go To Home
                </button>

                <button onClick={() => {
                    onClose();
                    navigate('/bookings')
                    localStorage.removeItem("selectedBookingId");
                }}
                    className="bg-blue-600 text-white py-3 rounded-md min-w-[200px]"
                >
                    View Bookings
                </button>
            </div>
        </div>
    );
}