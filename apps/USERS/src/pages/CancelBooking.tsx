import { useEffect, useState } from "react";
import {
    FiArrowLeft,
    FiCalendar,
    FiClock,
    FiLock,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import CancelSuccessModal from "../components/CancelSuccessModal";
import gym1 from '../assets/gymImg.png'

const reasons = [
    "Changed the plans",
    "Found a better place",
    "Booked by mistake",
];

export default function CancelBooking() {
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [error, setError] = useState<string>("");

    const [showSuccess, setShowSuccess] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // ✅ Restore modal on refresh
    useEffect(() => {
        const stored = localStorage.getItem("cancelSuccess");

        if (stored === "true") {
            setShowSuccess(true);
        }
    }, []);

    // ✅ Close modal when URL changes
    useEffect(() => {
        return () => {
            localStorage.removeItem("cancelSuccess");
        };
    }, [location.pathname]);

    const handleCancel = () => {

        if (!selectedReason) {
            setError("Please select a reason for cancellation.");
            return;
        }

        // Clear error if reason is selected
        setError("");

        // 👉 call API here

        // persist modal
        localStorage.setItem("cancelSuccess", "true");

        setShowSuccess(true);
    };

    const handleClose = () => {
        localStorage.removeItem("cancelSuccess");
        setShowSuccess(false);
        navigate("/");
        window.scrollTo(0, 0);
    };

    return (
        <div className="min-h-screen p-4 max-w-md mx-auto relative">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <FiArrowLeft className="text-xl cursor-pointer" />
                <h1 className="text-lg font-semibold">Cancel Booking</h1>
            </div>

            {/* Gym Card */}
            <div className="bg-white rounded shadow-sm border">
                <div className="flex">
                    <img
                        src={gym1}
                        alt="gym"
                        className="w-20 h-auto rounded-tl rounded-bl object-cover"
                    />

                    <div className="flex-1  p-3">
                        <div className="flex justify-between items-start">
                            <h2 className="font-semibold text-sm">
                                Fight To Fitness
                            </h2>

                            <span className="flex items-center gap-1 text-xs bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] px-2 py-1 rounded-full">
                                <FiLock size={12} />
                                Premium
                            </span>
                        </div>

                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                            <FiCalendar /> 5th December
                        </div>

                        <div className="text-xs text-gray-500 flex items-center gap-2 pt-1">
                            <FiClock /> Duration : 1.5 Hrs • Flexible Entry
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
                        Rs. 400
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
                    <span>Rs.400</span>
                </div>
            </div>

            {/* Reason */}
            <div className="mt-8">
                <h3 className="text-sm font-semibold mb-3">
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
                                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition
                                        ${active
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-300 bg-white"
                                    }
                                    `}
                            >
                                <div
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center
                                        ${active
                                            ? "border-blue-500"
                                            : "border-gray-400"
                                        }
                                    `}
                                >
                                    {active && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                    )}
                                </div>

                                <span
                                    className={`text-sm ${active
                                        ? "text-blue-600"
                                        : "text-gray-700"
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
                    <button onClick={() => navigate('/payment/success')} className="text-blue-600 text-sm font-medium">
                        Don’t Cancel
                    </button>

                    <button
                        className="w-[209px] bg-red-500 text-white py-3 rounded-md font-semibold"
                        onClick={handleCancel}
                    >
                        Cancel Booking
                    </button>
                </div>
            </div>

            {/* ✅ Success Modal */}
            {showSuccess && <CancelSuccessModal onClose={handleClose} />}
        </div>
    );
}