import {
    FiMapPin,
    FiClock,
} from "react-icons/fi";
import { HiShare } from "react-icons/hi";
import { TiLocation } from "react-icons/ti";
import three from "../assets/three.png";
import halfCircle from "../assets/paymentWhiteImg.png";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import type { Booking } from "../pages/Bookings";
import { MdPending, MdPhone } from "react-icons/md";
import { toPng } from "html-to-image";

type PaymentSuccessProps = {
    onClose: () => void;
    booking?: Booking;
};

const backendUrl = import.meta.env.VITE_BACKEND_URL;

type BookingPass = {
    booking_reference: string;
    otp: string;
    gym_name: string;
    gym_location: string;
    gym_image: string;
    gym_open_till: string;
    guest_name: string;
    duration_in_hours: string;
    formatted_date: string;
    gym_timings: string;
    peak_hours: string;
    last_entry_time: string;
    base_price: string;
    platform_fee: string;
    total_amount: string;
    latitude: string;
    longitude: string;
};

export default function BookingModal({ onClose, booking }: PaymentSuccessProps) {

    const [pass, setPass] = useState<BookingPass | null>(null);

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPass = async () => {
            if (!booking?.id) return;

            setLoading(true);

            try {
                const res = await fetch(
                    `${backendUrl}/client/booking/${booking.id}/pass/`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                const data = await res.json();
                setPass(data.data);
            } catch (err) {
                console.error("Error fetching booking pass", err);
                setPass(null);
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
            const dataUrl = await toPng(shareRef.current, {
                cacheBust: true,   // avoids stale images
                pixelRatio: 2,     // high quality
            });

            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], "booking-pass.png", {
                type: "image/png",
            });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: "My Booking Pass",
                });
            } else {
                // fallback (download)
                const link = document.createElement("a");
                link.href = dataUrl;
                link.download = "booking-pass.png";
                link.click();
            }
        } catch (err) {
            console.error("Share failed:", err);
        }
    };

    // const handlePhoneClick = () => {
    //     if (pass?.phone_number) {
    //         // Open the phone dialer
    //         window.location.href = `tel:${pass.phone_number}`;
    //     }
    // };

    // const handleLocationClick = () => {
    //     if (!pass) return;

    //     // Navigate to /explore with coordinates and gym info
    //     navigate("/explore", {
    //         state: {
    //             pass,
    //             latitude: pass.latitude,
    //             longitude: pass.longitude,
    //         }
    //     });
    // };

    const statusConfig = getStatusConfig(booking?.status || "PENDING");

    const getStatusIcon = (status: Booking["status"]) => {
        switch (status) {
            case "PENDING":
                return <MdPending className="text-yellow-500 text-[65px]" />;
            case "CONFIRMED":
                return <FaCheckCircle className="text-green-500 text-[65px]" />;
            case "CANCELLED":
                return <FaTimesCircle className="text-red-500 text-[65px]" />;
        }
    };

    if (loading || !pass) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4 p-8 bg-white animate-fadeIn">
                    <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-700 text-lg font-medium">
                        Loading booking details...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-28 overflow-x-hidden">

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

                <div className="relative bg-gradient-to-b from-blue-600 to-blue-500 text-white rounded-2xl p-4 shadow-xl">

                    <img src={halfCircle} alt="Half Circle" className="absolute bottom-[200px] left-[-13px] w-[48px] h-[55px]" />
                    <img src={halfCircle} alt="Half Circle" className="absolute bottom-[200px] right-[-13px] rotate-180 w-[48px] h-[55px]" />

                    {/* Gym Header */}
                    <div className="flex gap-3">
                        <img
                            src={`https://api.viigo.in/${pass?.gym_image}`}
                            alt={pass?.gym_name || "Gym"}
                            className="w-[97px] h-[97px] rounded object-cover"
                        />

                        <div className="flex-1">
                            <div className="flex justify-between items-center gap-2">
                                <h2 className="font-semibold text-lg">
                                    {pass?.gym_name}
                                </h2>

                                <div className="flex gap-3">
                                    {/* Phone */}
                                    <div
                                        // onClick={handlePhoneClick}
                                        className="bg-[#BFDBFE] text-[#2563EB] p-1 rounded-lg cursor-pointer hover:bg-gray-200 transition"
                                    >
                                        <MdPhone size={16} />
                                    </div>

                                    {/* Location */}
                                    <div
                                        // onClick={handleLocationClick}
                                        className="bg-[#BFDBFE] text-[#2563EB] p-1 rounded-lg cursor-pointer hover:bg-gray-200 transition"
                                    >
                                        <TiLocation size={16} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 py-1 text-sm text-[#CBD5E1]">
                                {pass.gym_location}
                            </div>

                            <div className="flex items-center gap-1 text-sm opacity-90">
                                <FiMapPin className="w-4 h-4" />
                                <span className="pl-2">{`${pass.gym_open_till}`}</span>
                            </div>
                        </div>
                    </div>

                    {/* Details Row */}
                    <div className="grid grid-cols-3 gap-1 justify-between mt-2 text-sm border-b border-white/30 py-4">
                        <div>
                            <p className="text-[#DBEAFE]">Guest Name</p>
                            <p className="break-all"> {pass.guest_name?.split(" ")[0]}</p>
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
                    <div className="text-center mt-6">
                        <p className="text-[48px] font-semibold">OTP : {pass.otp}</p>
                        <p className="text-xs mt-2 max-w-[261px] mx-auto">
                            Use OTP during check in. Once OTP is validated, your session timings will start.
                        </p>

                        <p className="text-xs mt-2 max-w-[261px] mx-auto">
                            This pass remains valid until 11:59 PM on the selected booking date.
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-dashed border-white/40 my-6" />

                    {/* Timings */}
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center text-[#DBEAFE] justify-center gap-2">
                            <FiClock className="w-4 h-4" />
                            Gym timings : <span>{pass.gym_timings} </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <img src={three} alt="Three" className="mt-1 w-6" />
                            <div>
                                <div className="flex gap-2 flex-wrap">
                                    Peak hours :
                                    <div className="flex gap-2 flex-wrap">
                                        {pass.peak_hours}
                                    </div>
                                </div>
                                <p className="text-[11px] text-[#BFDBFE] text-center">
                                    (Workouts during peak hours may use more minutes)
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-[#BFDBFE] font-medium text-center pt-2">
                            Last entry for selected duration: {pass.last_entry_time}
                        </p>
                    </div>
                </div>

            </div>

            {/* Change of Plans */}
            {booking?.status === "CONFIRMED" && (
                <div className="bg-[#F1F5F9] rounded-lg p-4 mx-4">
                    <div className="flex gap-3 items-center">
                        <h3 className="font-semibold text-sm">Change of Plans</h3>
                        <button onClick={() => navigate(`/cancelbooking/${pass?.booking_reference}`)} className="text-[#F43F5E] font-medium text-sm border border-[#F43F5E] px-3 py-1 rounded-md">
                            Cancel Booking
                        </button>
                    </div>

                    <p className="text-xs text-[#0F172A] mt-3">
                        Cancel anytime before 12 am during the day.
                        After 12 am, bookings will be canceled automatically with no refund.
                    </p>
                </div>
            )}

            {/* Price Details */}
            <div className="mt-6 text-sm space-y-2 px-4">
                <p className="text-sm">Price Details</p>
                <div className="flex justify-between">
                    <span className="text-[#6A6A6A] font-medium">{pass.duration_in_hours} Hr</span>
                    <span className="font-medium">Rs. {pass.base_price}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-[#6A6A6A] font-medium">Platform Fee</span>
                    <span className="font-medium">Rs. {pass.platform_fee}</span>
                </div>

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
            <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-[#F1F5F9] flex gap-4 items-center justify-center">
                <button onClick={() => {
                    onClose();
                    navigate('/')
                    localStorage.removeItem("selectedBookingId");
                }}
                    className="text-blue-600"
                >
                    Go To Home
                </button>

                <button onClick={() => {
                    onClose();
                    navigate('/bookings')
                    localStorage.removeItem("selectedBookingId");
                }}
                    className="bg-blue-600 text-white py-3 rounded-md w-[209px]"
                >
                    View Bookings
                </button>
            </div>
        </div>
    );
}
