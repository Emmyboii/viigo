import { motion } from "framer-motion";
import {
    FiMapPin,
    FiClock,
} from "react-icons/fi";
import { HiShare } from "react-icons/hi";
import three from "../assets/three.png";
import halfCircle from "../assets/paymentWhiteImg.png";
import { FaCheckCircle } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAppContext, type GymCard } from "../context/AppContext";
import { MdPhone } from "react-icons/md";
import { TiLocation } from "react-icons/ti";
import { snapdom } from "@zumer/snapdom";

type PaymentSuccessProps = {
    gym: GymCard | null
    onClose: () => void;
};

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


const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function PaymentSuccess({ onClose }: PaymentSuccessProps) {

    const shareRef = useRef<HTMLDivElement>(null);

    const [pass, setPass] = useState<BookingPass | null>(null);
    const { userData } = useAppContext()
    const navigate = useNavigate();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                // 1️⃣ Fetch bookings FIRST
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

                // const bookingsData = await bookingsRes.json();
                // const firstBooking = bookingsData.data?.[0];

                // if (!firstBooking) {
                //     setBooking(null);
                //     setPass(null);
                //     return;
                // }

                // setBooking(firstBooking);

                const bookingsData = await bookingsRes.json();

                const bookingsArray = bookingsData.data ?? [];
                const lastBooking = bookingsArray.at(-1);

                if (!lastBooking) {
                    setBooking(null);
                    setPass(null);
                    return;
                }

                setBooking(lastBooking);
                localStorage.setItem("selectedBookingId", String(lastBooking.id));

                // 2️⃣ THEN fetch pass using the booking ID
                const passRes = await fetch(
                    `${backendUrl}/client/booking/${lastBooking.id}/pass/`,
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
    }, []);

    // const handlePhoneClick = () => {
    //     if (gym?.phone_number) {
    //         // Open the phone dialer
    //         window.location.href = `tel:${gym.phone_number}`;
    //     }
    // };

    // const handleLocationClick = () => {
    //     if (!gym) return;

    //     // Navigate to /explore with coordinates and gym info
    //     navigate("/explore", {
    //         state: {
    //             gym,
    //             latitude: gym.latitude,
    //             longitude: gym.longitude,
    //         }
    //     });
    // };

    if (loading || !pass || !booking) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4 p-8 bg-white animate-fadeIn">
                    <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 text-sm">Processing your booking...</p>
                </div>
            </div>);
    }

    return (
        <div className="min-h-screen pb- overflow-x-hidden max-w-[400px] mx-auto">

            <div ref={shareRef} className="px-1 pb-5">

                {/* Top Success Section */}
                <div className="flex flex-col items-center pt-10 pb-6">
                    <FaCheckCircle className="text-green-500 text-[65px]" />

                    <h1 className="mt-4 text-xl font-semibold">
                        Payment Successful
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Booked through UPI : {userData?.email}
                    </p>
                </div>

                {/* 🎯 Animated Blue Card */}
                <motion.div
                    initial={{ scale: 0.2, rotate: -180, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 20,
                        damping: 11,
                        mass: 1.2,
                    }}
                    className="relative bg-gradient-to-b from-blue-600 to-blue-500 text-white rounded-2xl mx-2 p-4 shadow-xl"
                >

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
                                <h2 className="font-semibold text-nowrap text-lg">
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
                                <span className="pl-2 text-nowrap">{`${pass.gym_open_till}`}</span>
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
                        <div className="flex items-center text-nowrap text-[#DBEAFE] justify-center gap-2">
                            <FiClock className="w-4 h-4" />
                            Gym timings : <span>{pass.gym_timings} </span>
                        </div>

                        <div className="flex items-center justify-center gap-2">
                            <img src={three} alt="Three" className="mt-1 w-6" />
                            <div>
                                <div className="flex gap-2 flex-wrap">
                                    Peak hours :
                                    <div className="flex gap-2 flex-wrap text-nowrap">
                                        {pass.peak_hours}
                                    </div>
                                </div>
                                <p className="text-[11px] text-[#BFDBFE] text-cente">
                                    (Workouts during peak hours may use more minutes)
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-[#BFDBFE] font-medium text-center pt-2">
                            Last entry for selected duration: {pass.last_entry_time}
                        </p>
                    </div>
                </motion.div>

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
            <div className="fixed max-w-[400px] mx-auto bottom-0 left-0 right-0 bg-white p-4 border-t border-[#F1F5F9] flex gap-4 items-center justify-between">
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
                    className="bg-blue-600 text-white py-3 rounded-md w-[200px]"
                >
                    View Bookings
                </button>
            </div>
        </div>
    );
}
