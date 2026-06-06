import { useEffect, useState } from "react";
import { getNowIST } from "../utils/ist";
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
import { CancelBookingSkeleton } from "../components/Gymskeletons ";

const reasons = [
    "My plans changed",
    "Booked the wrong date or time",
    "Personal emergency",
    "Gym is too far / unable to travel",
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

    // ── Pricing from payment_breakdown ───────────────────────────────────────
    const totalAmount = parseFloat(selectedBooking?.payment_breakdown?.total_amount ?? "0");

    // ── Cancellation fee logic based on last_entry_time (IST) ──────────────
    // Rule: cancel >= 1hr before last_entry_time → full refund (fee = 0)
    //       cancel < 1hr before last_entry_time  → 50% refund (fee = 50%)
    const cancellationFee = (() => {
        const lastEntryRaw = selectedBooking?.last_entry_time; // e.g. "4:00 pm"
        if (!lastEntryRaw) return 0;

        // Use IST for "now" — not the user's device locale
        const nowIST = getNowIST();

        // Build last entry as an IST Date using IST year/month/day + the time string
        // Avoids toDateString() which would use the device's local timezone
        const y = nowIST.getFullYear();
        const m = String(nowIST.getMonth() + 1).padStart(2, "0");
        const d = String(nowIST.getDate()).padStart(2, "0");
        const parsed = new Date(`${y}-${m}-${d} ${lastEntryRaw}`);
        if (isNaN(parsed.getTime())) return 0;

        // Compare in milliseconds — both anchored to the same IST day
        const minutesUntilLastEntry = (parsed.getTime() - nowIST.getTime()) / 60000;

        if (minutesUntilLastEntry >= 60) return 0;                        // full refund
        return Math.round(totalAmount * 0.5 * 100) / 100;                // 50% fee
    })();

    const totalRefund = Math.round((totalAmount - cancellationFee) * 100) / 100;

    const openModal = () => {
        setShowSuccess(true);
        localStorage.setItem("cancelSuccess", "true");
        window.history.pushState({ modal: "cancelSuccess" }, "");
    };

    const closeModal = (type: "cancelSuccess") => {
        if (type === "cancelSuccess") {
            setShowSuccess(false);
            localStorage.removeItem("cancelSuccess");
            localStorage.removeItem("selectedBookingId");
        }
        if (window.history.state?.modal === type) {
            window.history.back();
        }
    };

    useEffect(() => {
        const handlePopState = () => {
            if (showSuccess) {
                closeModal("cancelSuccess");
            }
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [showSuccess]);

    const handleClose = () => {
        closeModal("cancelSuccess");
        navigate("/");
        window.scrollTo(0, 0);
    };

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
                const localGym = gyms.find((g) => g.name === selectedBooking.gym_name);
                let gymId: number | undefined;
                if (localGym) {
                    gymId = localGym.id;
                } else {
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
                        return;
                    }
                    gymId = foundGym.id;
                }
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

    useEffect(() => {
        const stored = localStorage.getItem("cancelSuccess");
        if (stored === "true") {
            setShowSuccess(true);
        } else {
            setShowSuccess(false);
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
                body: JSON.stringify({ reason: selectedReason }),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData?.message || "Failed to cancel booking");
            }
            openModal();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Something went wrong");
        } finally {
            setIsCancelling(false);
        }
    };

    // ── Is within 1hr of last entry? (for policy display) ───────────────────
    // const isWithinOneHour = (() => {
    //     const lastEntryRaw = selectedBooking?.last_entry_time;
    //     if (!lastEntryRaw) return false;
    //     const nowIST = getNowIST();
    //     const y = nowIST.getFullYear();
    //     const m = String(nowIST.getMonth() + 1).padStart(2, "0");
    //     const d = String(nowIST.getDate()).padStart(2, "0");
    //     const parsed = new Date(`${y}-${m}-${d} ${lastEntryRaw}`);
    //     if (isNaN(parsed.getTime())) return false;
    //     return (parsed.getTime() - nowIST.getTime()) / 60000 < 60;
    // })();

    const hours = selectedBooking?.payment_breakdown?.booking_hours
        ? `${selectedBooking.payment_breakdown.booking_hours} Hr${selectedBooking.payment_breakdown.booking_hours > 1 ? "s" : ""}`
        : "";

    return (
        <div className="min-h-screen p-4 max-w-[1300px] mx-auto relative mb-10">
            {loading ? <CancelBookingSkeleton /> : (
                <>
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
                            <div className="flex-1 p-3">
                                <div className="flex justify-between items-start">
                                    <h2 className="font-semibold text-sm">{gym?.name}</h2>
                                </div>
                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                    <FiCalendar /> {selectedBooking?.display_date}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-2 pt-1">
                                    <FiClock /> Duration : {hours}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cancellation Policy */}
                    {/* <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${isWithinOneHour ? "bg-[#EAB308]" : "bg-[#22C55E]"}`} />
                            <p className="text-[10.5px] text-[#0F172A] leading-relaxed">
                                Cancel at least 1 hour before your last entry time for a full refund.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${isWithinOneHour ? "bg-[#22C55E]" : "bg-[#EAB308]"}`} />
                            <p className="text-[10.5px] text-[#0F172A] leading-relaxed">
                                Cancel within 1 hour of your last entry time and receive a 50% refund.
                            </p>
                        </div>
                    </div> */}

                    {/* Refund Summary */}
                    <div className="bg-white rounded-xl p-4 mt-5 border shadow-sm">
                        <h3 className="text-sm font-medium mb-3">Refund Summary</h3>

                        <div className="flex justify-between text-sm text-[#6A6A6A] mb-2">
                            <span>Total Paid</span>
                            <span className="text-black font-medium">Rs. {totalAmount.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-sm text-[#6A6A6A] mb-3">
                            <span>Cancellation Fee</span>
                            <span className={`font-medium ${cancellationFee === 0 ? "text-black" : "text-black"}`}>
                                {cancellationFee === 0 ? "Rs. 0" : `Rs. ${cancellationFee.toFixed(2)}`}
                            </span>
                        </div>

                        <div className="border border-[#F2F2F2] border-dotted"></div>

                        <div className="flex justify-between text-sm font-normal mt-3">
                            <span>Total Refund Amount</span>
                            <span className="font-medium">Rs. {totalRefund.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="mt-8">
                        <h3 className="text-base font-semibold mb-3">Reason for Cancellation</h3>
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
                                        className={`w-full flex items-center gap-3 p-3 rounded transition ${active ? "border-[#2563EB] bg-[#DBEAFE]" : "border-[#E2E8F0] bg-white"}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${active ? "border-[#2563EB]" : "border-[#E2E8F0]"}`}>
                                            {active && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                                        </div>
                                        <span className="text-sm text-[#0F172A]">{reason}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>

                    {/* Bottom */}
                    <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t border-[#F1F5F9]">
                        <div className="max-w-[1300px] mx-auto flex items-center justify-between gap-4">
                            <button onClick={() => navigate(-1)} className="text-[#2563EB] text-sm font-semibold">
                                Don't Cancel
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
                </>
            )}

            {showSuccess && <CancelSuccessModal onClose={handleClose} price={totalAmount} total={totalRefund} cancellationFee={cancellationFee} />}
        </div>
    );
}