import {
    FiMapPin,
    FiClock,
} from "react-icons/fi";
import { HiShare } from "react-icons/hi";
import { TiLocation } from "react-icons/ti";
// import three from "../assets/three.png";
import halfCircle from "../assets/paymentWhiteImg.png";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import type { Booking } from "../pages/Bookings";
import { MdPending, MdPhone } from "react-icons/md";
// import { toPng } from "html-to-image";
import { snapdom } from "@zumer/snapdom";
// import { PiWarningCircle } from "react-icons/pi";
import type { RecommendedWorkoutTimings } from "./types/gym";
import fire from '../assets/fire.png'
import { BookingModalSkeleton } from "./Gymskeletons ";
import leaf from '../assets/leaf.png'
import { useAppContext } from "../context/AppContext";

type PaymentSuccessProps = {
    onClose: () => void;
    booking?: Booking;
};

const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
) => {
    const toRad = (value: number) => (value * Math.PI) / 180;

    const R = 6371; // Earth's radius in km

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

const backendUrl = import.meta.env.VITE_BACKEND_URL;

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

export default function BookingModal({ onClose, booking }: PaymentSuccessProps) {

    const [pass, setPass] = useState<BookingPass | null>(null);

    const { latitude, longitude } = useAppContext();

    const distance =
        latitude != null &&
            longitude != null &&
            pass?.latitude &&
            pass?.longitude
            ? calculateDistance(
                Number(latitude),
                Number(longitude),
                Number(pass.latitude),
                Number(pass.longitude)
            )
            : null;

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchPass = async () => {
            if (!booking?.id) return;

            setLoading(true);
            setError(false);

            try {
                const res = await fetch(
                    `${backendUrl}/client/booking/${booking.id}/pass/?lat=${booking.gym_lat}&lng=${booking.gym_long}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }

                const data = await res.json();
                setPass(data.data);

            } catch (err) {
                console.error(err);
                setPass(null);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchPass();
    }, [booking?.id]);

    const getStatusConfig = (status: Booking["status"]) => {
        switch (status) {
            case "CONFIRMED":
                return {
                    title: "Upcoming Session",
                    subtitle: "Your booking is confirmed. Get ready to hit the gym 💪",
                    color: "text-yellow-500",
                };

            case "ACTIVE":
                return {
                    title: "Session in Progress",
                    subtitle: "You’re currently working out. Keep going 🔥",
                    color: "text-blue-500",
                };

            case "COMPLETED":
                return {
                    title: "Session Completed",
                    subtitle: "You’ve successfully completed your workout 🎉",
                    color: "text-green-500",
                };

            case "CANCELLED":
                return {
                    title: "Booking Cancelled",
                    subtitle: "This booking has been cancelled",
                    color: "text-red-500",
                };

            default:
                return {
                    title: "Booking",
                    subtitle: "",
                    color: "text-gray-500",
                };
        }
    };

    const shareRef = useRef<HTMLDivElement>(null);

    const handleShare = async () => {
        if (!shareRef.current) return;

        try {
            // 🧠 SNAPDOM: generate canvas from element
            const canvasEl = await snapdom.toCanvas(shareRef.current, {
                scale: 2,
                backgroundColor: "#ffffff",
            });

            // convert canvas → Blob
            const blob = await new Promise<Blob | null>((resolve) => {
                canvasEl.toBlob(resolve, "image/png");
            });

            if (!blob) throw new Error("Failed to create image blob");

            // create File object
            const file = new File([blob], "booking-pass.png", { type: "image/png" });

            // use Web Share API if available
            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: "My Booking Pass",
                });
            } else {
                // fallback download
                const link = document.createElement("a");
                link.href = URL.createObjectURL(file);
                link.download = "booking-pass.png";
                link.click();
            }
        } catch (err) {
            console.error("Share failed:", err);
        }
    };

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

        window.open(url, "_blank"); // opens Google Maps
    };

    const statusConfig = getStatusConfig(booking?.status || "PENDING");

    const getStatusIcon = (status: Booking["status"]) => {
        switch (status) {
            case "PENDING":
                return <MdPending className="text-yellow-500 text-[65px]" />;
            case "CONFIRMED":
                return <MdPending className="text-yellow-500 text-[65px]" />;
            case "ACTIVE":
                return <FaCheckCircle className="text-green-500 text-[65px]" />;
            case "COMPLETED":
                return <FaCheckCircle className="text-green-500 text-[65px]" />;
            case "CANCELLED":
                return <FaTimesCircle className="text-red-500 text-[65px]" />;
        }
    };

    // if (loading || !pass) {
    //     return (
    //         <div className="flex items-center justify-center min-h-screen">
    //             <div className="flex flex-col items-center gap-4 p-8 bg-white animate-fadeIn">
    //                 <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    //                 <p className="text-gray-700 text-lg font-medium">
    //                     Loading booking details...
    //                 </p>
    //             </div>
    //         </div>
    //     );
    // }

    if (loading) { return <BookingModalSkeleton />; }

    if (error || !pass) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-3">
                <p className="text-red-500 font-medium">
                    We couldn't load your booking pass.
                </p>

                <button
                    onClick={() => window.location.href = "/bookings"}
                    className="text-blue-600 underline text-sm"
                >
                    View Bookings
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-28 overflow-x-hidden max-w-[400px] mx-auto">

            <div ref={shareRef} className="px-4 pb-5">

                {/* Top Success Section */}
                <div className="flex flex-col items-center pt-10 pb-6">
                    {getStatusIcon(booking?.status || "PENDING")}

                    <h1 className="mt-4 text-xl font-semibold">
                        {statusConfig.title}
                    </h1>

                    <p className="text-gray-500 text-sm text-center px-5">
                        {statusConfig.subtitle}
                    </p>
                </div>

                <div className="relative bg-gradient-to-b from-blue-600 to-blue-500 text-white rounded-3xl p-4 shadow-xl">

                    {/* <img src={halfCircle} alt="Half Circle" className={`absolute ${pass.slot_type === "NON_PEAK" ? "bottom-[120px]" : pass.slot_type === "MORNING_PEAK" ? "bottom-[120px]" : "bottom-[100px]"} left-[-13px] w-[48px] h-[55px]`} />
                    <img src={halfCircle} alt="Half Circle" className={`absolute ${pass.slot_type === "NON_PEAK" ? "bottom-[120px]" : pass.slot_type === "MORNING_PEAK" ? "bottom-[120px]" : "bottom-[100px]"} right-[-13px] rotate-180 w-[48px] h-[55px]`} /> */}

                    {/* Gym Header */}
                    <div className="flex gap-2">
                        <img
                            src={`https://api.viigo.in/${pass?.gym_image}`}
                            alt={pass?.gym_name || "Gym"}
                            className="w-[97px] h-[97px] rounded object-cover"
                        />

                        <div className="flex-1">
                            <div className="flex sr:flex-row flex-col justify-between sr:items-center gap-1">
                                <h2 className="font-semibold text-nowrap text-base">
                                    {pass?.gym_name}
                                </h2>

                                <div className="flex gap-2">
                                    {/* Phone */}
                                    <div
                                        onClick={handlePhoneClick}
                                        className="bg-[#BFDBFE] text-[#2563EB] p-1 rounded-lg cursor-pointer hover:bg-gray-200 transition"
                                    >
                                        <MdPhone size={14} />
                                    </div>

                                    {/* Location */}
                                    <div
                                        onClick={handleLocationClick}
                                        className="bg-[#BFDBFE] text-[#2563EB] p-1 rounded-lg cursor-pointer hover:bg-gray-200 transition"
                                    >
                                        <TiLocation size={14} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 py-1 text-sm text-[#CBD5E1]">
                                {pass.gym_location}
                            </div>

                            <div className="flex items-center gap-1 text-[12.5px] opacity-90">
                                <FiMapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="sr:text-nowrap">
                                    {distance !== null
                                        ? `${distance.toFixed(1)} km • ${pass.gym_open_till}`
                                        : pass.gym_open_till}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Details Row */}
                    <div className="grid grid-cols-3 gap-1 justify-between mt-2 text-sm border-b border-white/30 py-4">
                        <div>
                            <p className="text-[#DBEAFE]">Guest Name</p>
                            <p className="break-all"> {pass.guest_name}</p>
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
                        <p className="text-xs mt-2 max-w-[261px] mx-auto">
                            {/* Use OTP during check in. Once OTP is validated, your session timings will start. */}
                            Use OTP during check in to start your session.
                        </p>

                        {/* <p className="text-xs mt-2 max-w-[261px] mx-auto">
                            This pass will be valid till the end of selected booking slot
                        </p> */}

                        {pass.slot_type === 'MORNING_PEAK' && (
                            <div className="flex gap-1 text-[11px] text-[#ffffff] text-center justify-center mt-2">
                                {/* <PiWarningCircle className="rotate-180 mt-[3px]" size={14} /> */}
                                <span>Slot starts at {pass.gym_timings.split(" - ")[0]}. You can check in anytime <br /> before {pass?.last_entry_time}.</span>
                            </div>
                        )}
                        {pass.slot_type === 'EVENING_PEAK' && (
                            <div className="flex gap-1 text-[11px] text-[#ffffff] text-center justify-center mt-2">
                                {/* <PiWarningCircle className="rotate-180 mt-[3px]" size={14} /> */}
                                <span>Slot starts at 5:00 PM. You can check in anytime <br /> before {pass?.last_entry_time}.</span>
                            </div>
                        )}
                        {pass.slot_type === 'NON_PEAK' && (
                            <div className="flex gap-1 text-[11px] text-[#ffffff] text-center justify-center mt-2">
                                {/* <PiWarningCircle className="rotate-180 mt-[3px]" size={14} /> */}
                                <span>Slot starts at 8:00 AM. You can check in anytime <br /> before {pass?.last_entry_time}.</span>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="relative my-3">
                        <div className="border-t border-dashed border-white/40" />
                        <img
                            src={halfCircle}
                            alt=""
                            className="absolute top-1/2 -translate-y-1/2 left-[-27px] w-[48px] h-[55px]"
                        />
                        <img
                            src={halfCircle}
                            alt=""
                            className="absolute top-1/2 -translate-y-1/2 right-[-27px] rotate-180 w-[48px] h-[55px]"
                        />
                    </div>

                    {/* {pass.slot_type && (
                        <p className={`text-sm font-normal ${pass.slot_type === 'NON_PEAK' ? 'text-[#0F7D37]' : 'text-[#DC2626]'
                            }`}>
                            {pass.slot_type === 'NON_PEAK' ? (
                                <div className="flex items-center gap-1 w-fit mx-auto py-1 mb-3 mt-4 px-2 rounded-full justify-center bg-white">
                                    <img src={leaf} className="w-[16px] flex-shrink-0" alt="" /> Non-Peak Hours
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 w-fit mx-auto py-1 mb-3 mt-4 px-2 rounded-full justify-center bg-white">
                                    <img src={fire} className="w-[10px]" alt="" /> Peak Hours
                                </div>
                            )}
                        </p>
                    )} */}

                    {pass.slot_type && (
                        <p className={`text-sm font-normal ${pass.slot_type === 'NON_PEAK' ? 'text-[#0F7D37]' : 'text-[#DC2626]'
                            }`}>
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
                                Timings : <span>{pass.recommended_workout_timings?.less_crowded_hours} </span>
                            </div>
                        )}

                        {pass.slot_type === 'MORNING_PEAK' && (
                            <div className="flex items-center text-nowrap text-[#FFFFFF] text-sm justify-center gap-2">
                                <FiClock className="w-4 h-4" />
                                Timings : <span>{pass?.recommended_workout_timings?.peak_hours?.morning} </span>
                            </div>
                        )}

                        {pass.slot_type === 'EVENING_PEAK' && (
                            <div className="flex items-center text-nowrap text-[#FFFFFF] text-sm justify-center gap-2">
                                <FiClock className="w-4 h-4" />
                                Timings : <span>{pass?.recommended_workout_timings?.peak_hours?.evening} </span>
                            </div>
                        )}

                        {/* {pass.slot_type === 'PEAK' && (
                            <div className="flex items-center text-nowrap text-sm text-[#ffffff] justify-center gap-2">
                                <FiClock className="w-4 h-4" />
                                <div className="space-y-1">
                                    <p className=" mt-1">
                                        Morning: {pass?.recommended_workout_timings?.peak_hours?.morning}
                                    </p>
                                    <p className="">
                                        Evening: {pass?.recommended_workout_timings?.peak_hours?.evening}
                                    </p>
                                </div>
                            </div>
                        )} */}

                        {/* <div className="flex items-center justify-center gap-2">
                            <img src={three} alt="Three" className="mt-1 w-6" />
                            <div>
                                <div className="flex gap-2 flex-wrap">
                                    Peak hours :
                                    <div className="flex gap-2 flex-wrap">
                                        {pass.peak_hours}
                                    </div>
                                </div>
                                <p className="text-[11px] text-[#BFDBFE] text-cente">
                                    (Workouts during peak hours may use more minutes)
                                </p>
                            </div>
                        </div> */}

                        {/* <p className="text-xs text-[#BFDBFE] font-medium text-center pt-2">
                            Last entry for selected duration: {pass.last_entry_time}
                        </p> */}


                    </div>
                </div>

            </div>

            {/* Change of Plans */}
            {booking?.status === "CONFIRMED" && (

                <div className="rounded-lg bg-[#F1F5F9] p-2 mx-4">
                    <div className="flex gap-3 items-center">
                        <h3 className="font-semibold text-sm">Change of Plans</h3>
                        <button onClick={() => {
                            navigate(`/cancelbooking/${pass?.booking_reference}`)
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }} className="text-[#F43F5E] font-medium text-sm border border-[#F43F5E] px-3 py-1 rounded-md">
                            Cancel Booking
                        </button>
                    </div>

                    <div className="space-y-2 mt-2">
                        <div className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#22C55E] mt-1.5 flex-shrink-0" />
                            <p className="text-[10.5px] text-[#0F172A] leading-relaxed">
                                Get a <span className="font-semibold">100% refund</span> when you cancel at least{" "}
                                <span className="font-semibold">1 hour before your "Check-in Before" time.</span>
                            </p>
                        </div>

                        <div className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#EAB308] mt-1.5 flex-shrink-0" />
                            <p className="text-[10.5px] text-[#0F172A] leading-relaxed">
                                Get a <span className="font-semibold">50% refund</span> when you cancel within{" "}
                                <span className="font-semibold">1 hour of your "Check-in Before" time.</span>
                            </p>
                        </div>

                        <div className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#F43F5E] mt-1.5 flex-shrink-0" />
                            <p className="text-[10.5px] text-[#0F172A] leading-relaxed">
                                After your <span className="font-semibold">"Check-in Before" time</span>, your booking
                                will be cancelled automatically and <span className="font-semibold">no refund</span>{" "}
                                will be issued.
                            </p>
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
                {/* <button className="flex-1 bg-blue-100 text-[#2563EB] py-2 px-2 rounded-full text-xs flex items-center justify-center gap-2">
                    <BiSolidCalendarAlt size={16} />
                    Add To Calendar
                </button> */}

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
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                    className="text-blue-600 text-center w-full"
                >
                    Go To Home
                </button>

                <button onClick={() => {
                    onClose();
                    navigate('/bookings')
                    localStorage.removeItem("selectedBookingId");
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                    className="bg-blue-600 text-white py-3 rounded-md min-w-[200px]"
                >
                    View Bookings
                </button>
            </div>
        </div>
    );
}
