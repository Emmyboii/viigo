import { useEffect, useState } from "react";
import {
    FiArrowLeft,
    FiCalendar,
    FiClock,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import CancelSuccessModal from "../components/CancelSuccessModal";
import type { Gym } from "../components/types/gym";
import { useAppContext } from "../context/AppContext";
import type { Booking } from "./Bookings";

const reasons = [
    "Changed the plans",
    "Found a better place",
    "Booked by mistake",
];

const backendUrl = import.meta.env.VITE_BACKEND_URL;


export default function CancelBooking() {
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [error, setError] = useState<string>("");
    const { gyms } = useAppContext()
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();
    const [gym, setGym] = useState<Gym | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const priceTag = selectedBooking?.price_tag || "";

    const [pricePart = "", hoursPart = ""] = priceTag.split("/");
    const price = parseFloat(pricePart.replace(/[^\d.]/g, ""));

    const hours = hoursPart.trim().toLowerCase();

    const totalRefund = price - 10


    const token = localStorage.getItem("token");
    const selectedBookingId = localStorage.getItem("selectedBookingId");

    useEffect(() => {
        const fetchBooking = async () => {
            setLoading(true)
            try {
                const res = await fetch(`${backendUrl}/client/bookings/my-bookings/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();

                const foundBooking = data?.data?.find((g: Booking) => g.id === Number(selectedBookingId));

                setSelectedBooking(foundBooking);
            } catch (err) {
                console.error("Error fetching bookings", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, []);

    useEffect(() => {
        const fetchGymById = async () => {
            if (!selectedBooking) return;

            setLoading(true);

            try {
                // Try to find the gym locally first
                const localGym = gyms.find((g) => g.name === selectedBooking.gym_name);

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
                    const foundGym = data?.data?.find((g: Gym) => g.slug === selectedBooking.gym_name);

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
    }, [gyms, selectedBooking]);

    // ✅ Restore modal on refresh
    useEffect(() => {
        const stored = localStorage.getItem("cancelSuccess");

        if (stored === "true") {
            setShowSuccess(true);
        } else {
            setShowSuccess(false)
        }
    }, []);

    useEffect(() => {
        const handleRouteChange = () => {
            const success = localStorage.getItem("cancelSuccess");

            if (success === "true") {
                localStorage.removeItem("cancelSuccess");
                localStorage.removeItem("selectedBookingId");
            }
        };

        window.addEventListener("beforeunload", handleRouteChange);

        return () => {
            window.removeEventListener("beforeunload", handleRouteChange);
        };
    }, []);

    const handleCancel = async () => {
        if (!selectedReason) {
            setError("Please select a reason for cancellation.");
            return;
        }

        setError("");
        setIsCancelling(true);

        if (!selectedBooking) {
            setError("No booking selected.");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`${backendUrl}/client/bookings/${selectedBooking.id}/cancel/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    reason: selectedReason,
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData?.message || "Failed to cancel booking");
            }

            // persist modal for refresh
            localStorage.setItem("cancelSuccess", "true");
            setShowSuccess(true);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Something went wrong");
        } finally {
            setIsCancelling(false);
        }
    };

    const handleClose = () => {
        localStorage.removeItem("cancelSuccess");
        localStorage.removeItem("selectedBookingId");
        setShowSuccess(false);
        navigate("/");
        window.scrollTo(0, 0);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4 p-8 bg-white animate-fadeIn">
                    <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-700 text-lg font-medium">
                        Loading...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 max-w-md mx-auto relative">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <FiArrowLeft onClick={() => navigate(-1)} className="text-xl cursor-pointer" />
                <h1 className="text-lg font-semibold">Cancel Booking</h1>
            </div>

            {/* Gym Card */}
            <div className="bg-white rounded shadow-sm border">
                <div className="flex">
                    <img
                        src={gym?.images[0]?.image}
                        alt="gym"
                        className="w-20 h-auto rounded-tl rounded-bl object-cover"
                    />

                    <div className="flex-1  p-3">
                        <div className="flex justify-between items-start">
                            <h2 className="font-semibold text-sm">
                                {gym?.name}
                            </h2>

                            {/* <span className="flex items-center gap-1 text-xs bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] px-2 py-1 rounded-full">
                                <FiLock size={12} />
                                Premium
                            </span> */}
                        </div>

                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                            <FiCalendar /> {selectedBooking?.display_date}
                        </div>

                        <div className="text-xs text-gray-500 flex items-center gap-2 pt-1">
                            <FiClock /> Duration : {hours}
                            {/* • Flexible Entry */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Refund Summary */}
            <div className="bg-white rounded-xl p-4 mt-5 border shadow-sm">
                <h3 className="text-sm font-medium mb-3">
                    Refund Summary
                </h3>

                <div className="flex justify-between text-sm text-[#6A6A6A] mb-2">
                    <span>Total Paid</span>
                    <span className="text-black font-medium">
                        Rs. {price}
                    </span>
                </div>

                <div className="flex justify-between text-sm text-[#6A6A6A] mb-3">
                    <span>Cancellation Fee</span>
                    <span className="text-black font-medium">
                        Rs. 10
                    </span>
                </div>

                <div className="border border-[#F2F2F2] border-dotted"></div>

                <div className="flex justify-between text-sm font-normal mt-3">
                    <span>Total Refund Amount</span>
                    <span>Rs. {totalRefund}</span>
                </div>
            </div>

            {/* Reason */}
            <div className="mt-8">
                <h3 className="text-base font-semibold mb-3">
                    Reason for Cancellation
                </h3>

                <div className="space-y-3">
                    {reasons.map((reason) => {
                        const active = selectedReason === reason;

                        return (
                            <button
                                key={reason}
                                onClick={() => {
                                    setSelectedReason(reason);
                                    setError("");
                                }}
                                className={`w-full flex items-center gap-3 p-3 rounded border transition
                                        ${active
                                        ? "border-[#2563EB] bg-[#DBEAFE]"
                                        : "border-[#E2E8F0] bg-white"
                                    }
                                    `}
                            >
                                <div
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center
                                        ${active
                                            ? "border-[#2563EB]"
                                            : "border-[#E2E8F0]"
                                        }
                                    `}
                                >
                                    {active && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                    )}
                                </div>

                                <span
                                    className={`text-sm ${active
                                        ? "text-[#0F172A]"
                                        : "text-[#0F172A]"
                                        }`}
                                >
                                    {reason}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
            </div>

            {/* Bottom */}
            <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t border-[#F1F5F9]">
                <div className="max-w-md mx-auto flex items-center justify-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-[#2563EB] text-sm font-semibold">
                        Don’t Cancel
                    </button>

                    <button
                        className="w-[209px] bg-[#F43F5E] text-white py-3 rounded-md text-sm font-semibold flex justify-center items-center gap-2"
                        onClick={handleCancel}
                        disabled={isCancelling}
                    >
                        {isCancelling ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            "Cancel Booking"
                        )}
                    </button>
                </div>
            </div>

            {/* ✅ Success Modal */}
            {showSuccess && <CancelSuccessModal onClose={handleClose} price={price} total={totalRefund} />}
        </div>
    );
}