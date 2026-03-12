import {
    FiMapPin,
    FiClock,
} from "react-icons/fi";
import { HiOutlineLocationMarker, HiShare } from "react-icons/hi";

import three from "../assets/three.png";
import halfCircle from "../assets/paymentWhiteImg.png";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { BiSolidCalendarAlt } from "react-icons/bi";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppContext } from "../context/AppContext";
import type { Booking } from "../pages/Bookings";
import type { Gym } from "./types/gym";
import { MdPending, MdPhone } from "react-icons/md";

type PaymentSuccessProps = {
    onClose: () => void;
    booking?: Booking;
};

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function BookingModal({ onClose, booking }: PaymentSuccessProps) {

    const { gyms } = useAppContext()

    const navigate = useNavigate();
    // const controls = useAnimation();

    const [gym, setGym] = useState<Gym | null>(null);
    const [loading, setLoading] = useState(true);

    const priceTag = booking?.price_tag || "";

    const [pricePart = "", hoursPart = ""] = priceTag.split("/");

    const price = pricePart.replace(/[^\d.]/g, "");

    // Keep hours WITH "hrs"
    const hours = hoursPart.trim().toLowerCase();

    // Extract only number for calculation
    const hoursNumber = Number(hours.replace(/[^\d.]/g, ""));

    useEffect(() => {
        const fetchGymById = async () => {
            if (!booking) return;

            setLoading(true);

            try {
                // Try to find the gym locally first
                const localGym = gyms.find((g) => g.name === booking.gym_name);

                let gymId: number | undefined;
                if (localGym) {
                    gymId = localGym.id;
                } else {
                    // If not found locally, fetch all gyms to find the ID
                    const res = await fetch(`${backendUrl}/gymowner/gyms/all/`, {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: localStorage.getItem("token")
                                ? `Bearer ${localStorage.getItem("token")}`
                                : "",
                        },
                    });

                    if (!res.ok) throw new Error("Failed to fetch gyms list");

                    const data = await res.json();
                    const foundGym = data?.data?.find((g: Gym) => g.slug === booking.gym_name);

                    if (!foundGym) {
                        setGym(null);
                        // setLoading(false);
                        return;
                    }

                    gymId = foundGym.id;
                }

                // Now fetch gym details by ID
                const detailRes = await fetch(`${backendUrl}/gymowner/gym/${gymId}/`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: localStorage.getItem("token")
                            ? `Bearer ${localStorage.getItem("token")}`
                            : "",
                    },
                });

                if (!detailRes.ok) throw new Error("Failed to fetch gym details");

                const detailData = await detailRes.json();
                setGym(detailData?.data || null);
            } catch (err) {
                console.error(err);
                setGym(null);
            } finally {
                setLoading(false);
            }
        };

        fetchGymById();
    }, [gyms]);

    const { userData } = useAppContext()


    // useEffect(() => {
    //     if (!loading) {
    //         controls.start({
    //             scale: 1,
    //             rotate: 0,
    //             opacity: 1,
    //             transition: {
    //                 type: "spring",
    //                 stiffness: 20,
    //                 damping: 11,
    //                 mass: 1.2,
    //             },
    //         });
    //     }
    // }, [loading, controls]);

    function formatTime12Hour(time24: string | undefined) {
        const [hourStr, minuteStr] = time24?.split(":") || [];
        let hour = Number(hourStr);
        const minute = minuteStr;
        const ampm = hour >= 12 ? "PM" : "AM";

        hour = hour % 12;
        if (hour === 0) hour = 12;

        return `${hour}:${minute} ${ampm}`;
    }


    const allPeaks = [
        ...(Array.isArray(gym?.peak_morning) ? gym.peak_morning : []),
        ...(Array.isArray(gym?.peak_evening) ? gym.peak_evening : []),
    ];

    const totalWithHr = (hours && gym)
        ? gym?.hourly_rate * hoursNumber
        : gym?.hourly_rate;

    const platformFee = 12;
    const gst = 2.16;
    // const total = price + platformFee + gst;

    const getStatusConfig = (status: Booking["status"]) => {
        switch (status) {
            case "PENDING":
                return {
                    title: "Upcoming Session",
                    subtitle: "Your booking is confirmed. Get ready to hit the gym 💪",
                    color: "text-yellow-500",
                };
            case "CONFIRMED":
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

    const handlePhoneClick = () => {
        if (gym?.phone_number) {
            // Open the phone dialer
            window.location.href = `tel:${gym.phone_number}`;
        }
    };

    const handleLocationClick = () => {
        if (!gym) return;

        // Navigate to /explore with coordinates and gym info
        navigate("/explore", {
            state: {
                gym,
                latitude: gym.latitude,
                longitude: gym.longitude,
            }
        });
    };

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

    if (loading || !gym) {
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

                <img src={halfCircle} alt="Half Circle" className="absolute bottom-28 left-[-13px] w-[48px] h-[55px]" />
                <img src={halfCircle} alt="Half Circle" className="absolute bottom-28 right-[-13px] rotate-180 w-[48px] h-[55px]" />

                {/* Gym Header */}
                <div className="flex gap-3">
                    <img
                        src={gym?.images[0]?.image}
                        alt=""
                        className="w-[110px] h-[110px] rounded object-cover"
                    />

                    <div className="flex-1">
                        <div className="flex flex-col justify-between items-start gap-">
                            <h2 className="font-semibold text-lg">
                                {gym?.name}
                            </h2>

                            <div className="flex gap-3 my-3">
                                {/* Phone */}
                                <div
                                    onClick={handlePhoneClick}
                                    className="bg-[#BFDBFE] text-[#2563EB] p-2 rounded-lg cursor-pointer hover:bg-gray-200 transition"
                                >
                                    <MdPhone size={16} />
                                </div>

                                {/* Location */}
                                <div
                                    onClick={handleLocationClick}
                                    className="bg-[#BFDBFE] text-[#2563EB] p-2 rounded-lg cursor-pointer hover:bg-gray-200 transition"
                                >
                                    <HiOutlineLocationMarker size={16} />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-[#CBD5E1]">
                            {gym?.city},{gym?.state}
                        </div>

                        <div className="flex items-center gap-1 text-sm opacity-90">
                            <FiMapPin size={14} />
                            {gym?.distance} <span className="pl-2">{`Open Till ${formatTime12Hour(gym.close_time)}`}</span>
                        </div>
                    </div>
                </div>

                {/* Details Row */}
                <div className="grid grid-cols-3 justify-between mt-2 text-sm border-b border-white/30 py-4">
                    <div>
                        <p className="text-[#DBEAFE]">Guest Name</p>
                        <p>{userData?.full_name.split(" ")[0] || userData?.email}</p>
                    </div>
                    <div className="border-l border-[#FFFFFF33] pl-2">
                        <p className="text-[#DBEAFE]">Hours</p>
                        <p>{hours}</p>
                    </div>
                    <div className="border-l border-[#FFFFFF33] pl-2">
                        <p className="text-[#DBEAFE]">Date</p>
                        <p>{booking?.display_date}</p>
                    </div>
                </div>

                {/* OTP Section */}
                <div className="text-center mt-6">
                    <p className="text-[48px] font-semibold">OTP : 1384</p>
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
                        <FiClock size={17} />
                        Gym timings : <span>{formatTime12Hour(gym?.open_time)} – {formatTime12Hour(gym?.close_time)} </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <img src={three} alt="Three" className="mt-1 w-6" />
                        <div>
                            <div className="flex gap-2 flex-wrap">
                                Peak hours :
                                <div className="flex gap-2 flex-wrap">
                                    {allPeaks.map(([start, end], i) => (
                                        <span key={i}>
                                            {formatTime12Hour(start)} - {formatTime12Hour(end)}
                                            {i !== allPeaks.length - 1 && ","}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <p className="text-[11px] text-[#BFDBFE]">
                                (Workouts during peak hours may use more minutes)
                            </p>
                        </div>
                    </div>

                    <p className="text-xs text-[#BFDBFE] text-center pt-2">
                        Last entry for selected duration : 8:30 PM
                    </p>
                </div>
            </div>

            {/* Change of Plans */}
            {booking?.status === "PENDING" && (
                <div className="bg-[#F1F5F9] rounded-lg p-4">
                    <div className="flex gap-3 items-center">
                        <h3 className="font-semibold text-sm">Change of Plans</h3>
                        <button onClick={() => navigate(`/cancelbooking/${booking?.booking_reference}`)} className="text-[#F43F5E] font-medium text-sm border border-[#F43F5E] px-3 py-1 rounded-md">
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
            <div className="mt-6 text-sm space-y-2">
                <p className="text-sm">Price Details</p>
                <div className="flex justify-between">
                    <span className="text-[#6A6A6A]">{hours}</span>
                    <span>Rs. {totalWithHr}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-[#6A6A6A]">Platform Fee</span>
                    <span>Rs. {platformFee}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-[#6A6A6A]">GST on Platform Fee</span>
                    <span>Rs. {gst}</span>
                </div>
                <div className="flex justify-between pt-3">
                    <span>Total Paid Amount</span>
                    <span>Rs. {price}</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-2">
                <button className="flex-1 bg-blue-100 text-[#2563EB] py-2 px-2 rounded-full text-xs flex items-center justify-center gap-2">
                    <BiSolidCalendarAlt size={16} />
                    Add To Calendar
                </button>

                <button className="flex-1 bg-blue-100 text-[#2563EB] py-2 px-2 rounded-full text-xs flex items-center justify-center gap-2">
                    <HiShare size={16} />
                    Share Pass
                </button>
            </div>

            {/* Bottom Buttons */}
            <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-[#F1F5F9] flex gap-4 items-center justify-center">
                <button onClick={() => {
                    onClose();
                    navigate('/')
                }}
                    className="text-blue-600"
                >
                    Go To Home
                </button>

                <button onClick={() => {
                    onClose();
                    navigate('/bookings')
                }}
                    className="bg-blue-600 text-white py-3 rounded-md w-[209px]"
                >
                    View Bookings
                </button>
            </div>
        </div>
    );
}
