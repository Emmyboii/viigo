import { useNavigate } from "react-router-dom";

import {
    IoTimeOutline,
} from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
// import { FaCheckCircle } from "react-icons/fa";
import PageHeader from "../components/PageHeader";
import { normalizeImagePath, useAppContext, type GymCard } from "../context/AppContext";
import FacilityTag from "../components/FacilityTag";
import { HiLocationMarker, HiOutlineCalendar } from "react-icons/hi";
import { PiWarningCircle } from "react-icons/pi";
import { FaCircleCheck } from "react-icons/fa6";
import { MdError } from "react-icons/md";
import PaymentSuccess from "./PaymentSuccess";
import three2 from "../assets/three2.png";
import fire from '../assets/fire.png'
import leaf from '../assets/leaf.png'
import { ReviewPaySkeleton } from "../components/Gymskeletons ";
import BottomSheet from "../components/BottomSheet";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
type ToastType = "success" | "error" | null;

export interface PreviewData {
    base_price: string
    platform_fee: string
    surge_fee: string
    slot_type: string
    gst_fee: string
    last_entry_time: string
    total_payable: string
    duration: string
    peak_hours: string
    non_peak_hours: string
}

// ── Shared backend error extractor ──────────────────────────────────────────
// Handles all backend error shapes:
//   { data: { field: ["msg", ...] } }     → first field-level message
//   { data: { non_field_errors: ["msg"] } }
//   { message: "..." }                    → top-level message
//   Error instance                        → error.message
function extractErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;

    if (typeof error === "object" && error !== null) {
        const err = error as {
            data?: Record<string, string | string[]>;
            message?: string;
            non_field_errors?: string[];
        };

        if (err.data && typeof err.data === "object") {
            // Flatten all field-level error arrays and return the first message
            const allMessages = Object.values(err.data)
                .flat()
                .filter((v): v is string => typeof v === "string");
            if (allMessages.length) return allMessages[0];
        }

        if (err.non_field_errors?.length) return err.non_field_errors[0];
        if (err.message) return err.message;
    }

    return "Something went wrong. Please try again.";
}

export default function ReviewPay() {

    const { userData, longitude, latitude } = useAppContext()

    const navigate = useNavigate();
    const [showSuccess, setShowSuccess] = useState(false);
    const [showSecondSuccess, setShowSecondSuccess] = useState(false);
    const [gym, setGym] = useState<GymCard | null>(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
    const [previewLoading, setPreviewLoading] = useState(true);
    const [previewData, setPreviewData] = useState<PreviewData | null>(null);
    const [payLoading, setPayLoading] = useState(false);
    const [bookingReference, setBookingReference] = useState<string | null>(null);
    const [showPaymentFailed, setShowPaymentFailed] = useState(false);

    const storedData = localStorage.getItem("bookingData");

    const initialState = storedData
        ? JSON.parse(storedData)
        : null;

    useEffect(() => {
        const paid = localStorage.getItem("paid");

        if (paid === "true" || !storedData) {
            navigate("/", { replace: true });
        }
    }, [navigate]);

    const selectedDate = initialState?.selectedDate
    const selectedHours = initialState?.selectedHours
    const peopleCount = initialState?.peopleCount
    const slotType = initialState?.slot_type || "NON_PEAK"
    const id = initialState?.id

    useEffect(() => {
        const stored = localStorage.getItem("paymentSuccess");

        if (stored === "true") {
            setShowSecondSuccess(true);
        }
    }, []);

    useEffect(() => {
        const handleRouteChange = () => {
            const success = localStorage.getItem("paymentSuccess");

            if (success === "true") {
                localStorage.removeItem("paymentSuccess");
                localStorage.removeItem("selectedBookingId");
            }
        };

        window.addEventListener("beforeunload", handleRouteChange);

        return () => {
            window.removeEventListener("beforeunload", handleRouteChange);
        };
    }, []);

    useEffect(() => {
        const fetchGymById = async () => {
            if (!id) return;

            setLoading(true);

            try {
                const detailRes = await fetch(`${backendUrl}/gymowner/gym/${id}/?lat=${latitude}&long=${longitude}`, {
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

        if (userData && latitude && longitude) {
            fetchGymById();
        }
    }, [longitude, latitude, userData, id]);

    useEffect(() => {
        const runPreview = async () => {
            if (!id || !selectedDate || !selectedHours?.value) return;

            setPreviewLoading(true);

            try {
                const payload = {
                    gym_id: id,
                    date: selectedDate, // already a "YYYY-MM-DD" string from PlanYourWorkout
                    duration: String(selectedHours.value),
                    number_of_friends: peopleCount,
                    slot_type: slotType
                };

                const headers = {
                    "Content-Type": "application/json",
                    Authorization: localStorage.getItem("token")
                        ? `Bearer ${localStorage.getItem("token")}`
                        : "",
                };

                const res = await fetch(`${backendUrl}/client/booking/preview/`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify(payload),
                });

                const data = await res.json();

                if (!res.ok) throw data;

                setPreviewData(data.data);

            } catch (error) {
                console.error("Preview failed:", error);
                setToast({ type: "error", message: extractErrorMessage(error) });
                setTimeout(() => setToast(null), 3400);
            } finally {
                setPreviewLoading(false);
            }
        };

        runPreview();
    }, []);

    function formatTime12Hour(time24: string | undefined) {
        const [hourStr, minuteStr] = time24?.split(":") || [];
        let hour = Number(hourStr);
        const ampm = hour >= 12 ? "PM" : "AM";

        hour = hour % 12;
        if (hour === 0) hour = 12;

        return minuteStr === "00"
            ? `${hour} ${ampm}`
            : `${hour}:${minuteStr} ${ampm}`;
    }

    function formatTime12Hour2(time24: string | undefined) {
        const [hourStr, minuteStr] = time24?.split(":") || [];
        let hour = Number(hourStr);
        const ampm = hour >= 12 ? "PM" : "AM";

        hour = hour % 12;
        if (hour === 0) hour = 12;

        return `${hour}:${minuteStr} ${ampm}`;
    }

    const bookingDate = selectedDate ? new Date(selectedDate) : null;

    const formattedShortDate = bookingDate
        ? bookingDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
        : "";

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        if (!id || !selectedDate || !selectedHours?.value) return;

        setPayLoading(true);

        try {
            const scriptLoaded = await loadRazorpayScript();

            if (!scriptLoaded) {
                throw new Error("Failed to load Razorpay SDK");
            }

            const payload = {
                gym: id,
                booking_date: selectedDate, // already a "YYYY-MM-DD" string from PlanYourWorkout
                duration_in_hours: String(selectedHours.value),
                number_of_friends: peopleCount,
                slot_type: slotType
            };

            const headers = {
                "Content-Type": "application/json",
                Authorization: localStorage.getItem("token")
                    ? `Bearer ${localStorage.getItem("token")}`
                    : "",
            };

            const confirmRes = await fetch(`${backendUrl}/client/booking/confirm/`, {
                method: "POST",
                headers,
                body: JSON.stringify(payload),
            });

            const confirmData = await confirmRes.json();

            if (!confirmRes.ok) throw confirmData;

            const bookingRef = confirmData.data.booking_reference;
            setBookingReference(bookingRef);
            localStorage.setItem("bookingReference", bookingRef);

            const payment = confirmData.data.payment_details;

            const options = {
                key: payment.razorpay_key_id,
                amount: payment.amount,
                currency: payment.currency,
                name: payment.name,
                description: payment.description,
                order_id: payment.razorpay_order_id,

                handler: function (response: any) {
                    console.log("Payment success:", response);

                    localStorage.setItem("paymentSuccess", "true");
                    localStorage.setItem("paid", "true");

                    sessionStorage.clear();

                    setShowSuccess(true);

                    setTimeout(() => {
                        setShowSecondSuccess(true);
                        window.scrollTo(0, 0);
                    }, 3000);
                },

                modal: {
                    ondismiss: function () {
                        setPayLoading(false);
                        setShowPaymentFailed(true);
                    }
                },

                theme: {
                    color: "#2563EB"
                }
            };

            const razorpay = new (window as any).Razorpay(options);
            razorpay.open();

        } catch (error: unknown) {
            setToast({ type: "error", message: extractErrorMessage(error) });
            setTimeout(() => setToast(null), 3400);
        } finally {
            setPayLoading(false);
        }
    };

    const handleClose = () => {
        localStorage.removeItem("paymentSuccess");
        localStorage.removeItem("bookingData");
        localStorage.removeItem("selectedBookingId");
        localStorage.removeItem("bookingReference");
        setShowSecondSuccess(false);
    };

    const handleToastClose = useCallback(() => {
        setToast(null);
    }, []);

    const visibleAmenities = gym?.amenities.slice(0, 2);

    const selectedSlotTiming = useMemo(() => {
        if (!gym) return "";

        switch (slotType) {
            case "MORNING_PEAK":
                return gym?.recommended_workout_timings?.peak_hours?.morning || "Gym Open - 8 AM";

            case "NON_PEAK":
                return gym?.recommended_workout_timings?.less_crowded_hours ||
                    `${formatTime12Hour(gym?.open_time)} - ${formatTime12Hour(gym?.close_time)}`;

            case "EVENING_PEAK":
                return gym?.recommended_workout_timings?.peak_hours?.evening || "5 PM - Close";

            default:
                return "";
        }
    }, [slotType, gym]);

    if (loading || previewLoading) { return <ReviewPaySkeleton />; }

    return (
        <div className="pb-44 min-h-screen max-w-[1300px] mx-auto">
            {!showSecondSuccess && (

                <div>
                    {/* ===== Header ===== */}
                    <PageHeader text="Review and Pay" />

                    <div className="pt-14" />

                    <div id="share-area" className="min-h-screen bg-white">

                        <div className="p-4 space-y-4 relative">

                            {toast && <Toast type={toast.type} text={toast.message} onClose={handleToastClose} />}

                            {/* ===== Gym Summary Card ===== */}
                            <div className="bg-white rounded border flex gap-1 max-h-[250px]">
                                <img
                                    crossOrigin="anonymous"
                                    src={`https://api.viigo.in/${normalizeImagePath(gym?.images[0]?.image)}`}
                                    alt={gym?.name}
                                    className="w-[85px] min-h-full rounded-tl rounded-bl object-cover"
                                />

                                <div className="flex-1 p-2">
                                    <h2 className="font-semibold">{gym?.name}</h2>

                                    <div className="flex items-center text-nowrap text-xs text-[#475569] gap-1 mt-2 flex-wrap">
                                        <HiLocationMarker size={12} />
                                        <span>{gym?.distance}, {gym?.area}</span>
                                        <span>•</span>
                                        <span>{gym?.open_status || `Open Till ${formatTime12Hour(gym?.close_time)}`}</span>
                                    </div>

                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        {visibleAmenities?.map((amenity, index) => (
                                            <FacilityTag key={index} amenity={amenity} />
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2 mt-3">
                                        <p className="font-semibold text-[#0F172A]">₹{Number(gym?.hourly_rate)}/Hr</p>
                                        <span className="text-xs bg-[#22C55E] text-white px-2 py-0.5 rounded-full">
                                            Confirmed
                                        </span>
                                    </div>
                                </div>
                            </div>


                            {/* ===== Selected Pass ===== */}
                            <div className="bg-white rounded-xl border p-4 space-y-4">
                                <div>
                                    <div className="flex justify-between gap-2 items-center mb-4">
                                        <div className="space-y-2">
                                            <h3 className="font-semibold">Selected Pass</h3>

                                            <div className="flex items-center gap-1 text-nowrap text-sm mt-2">
                                                <img src={three2} alt="Three" className="mt- w-4" />
                                                <p className="break-al text-[#0F172A]">{userData?.full_name.split(" ")[0] || userData?.email}
                                                    {peopleCount > 0 && ` +${peopleCount} ${peopleCount > 1 ? "Friends" : "Friend"}`}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() =>
                                                navigate(`/gyms/${gym?.slug}/plan`, {
                                                    state: { reopenSheet: true }
                                                })}
                                            className="text-sm text-[#2563EB] bg-[#DBEAFE] px-3 py-1 font-medium rounded-md w-[60px]"
                                        >
                                            Edit
                                        </button>
                                    </div>

                                    <hr className="border-[0.5px] my-2" />

                                    <div className="flex justify-between items-center">
                                        <div className="space-y-3">
                                            <h3 className="font-semibold">Selected Pass</h3>

                                            <div className="flex items-center gap-1 text-nowrap text-sm text-[#0F172A] mt-2">
                                                <HiOutlineCalendar size={14} />
                                                <span>{formattedShortDate}</span>
                                                <span>•</span>
                                                <span>{selectedHours?.label}</span>
                                            </div>

                                            {slotType && (
                                                <p className={`text-sm font-normal ${slotType === 'NON_PEAK' ? 'text-[#0F7D37]' : 'text-[#DC2626]'
                                                    }`}>
                                                    {slotType === 'NON_PEAK' ? (
                                                        <div className="flex items-center gap-1">
                                                            <img src={leaf} className="w-[16px] flex-shrink-0" alt="" /> Non-Peak Hours
                                                        </div>
                                                    ) : slotType === 'MORNING_PEAK' ? (
                                                        <div className="flex items-center gap-1">
                                                            <img src={fire} className="w-[10px]" alt="" /> Morning Peak Hours
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1">
                                                            <img src={fire} className="w-[10px]" alt="" /> Evening Peak Hours
                                                        </div>
                                                    )}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-2 text-nowrap text-sm text-[#0F172A] mt-2">
                                                <IoTimeOutline size={14} />
                                                {slotType === "MORNING_PEAK" ? (
                                                    <span>{formatTime12Hour2(gym?.open_time)} – 8:00 AM </span>
                                                ) : slotType === "EVENING_PEAK" ? (
                                                    <span>5:00 PM – {formatTime12Hour2(gym?.close_time)} </span>
                                                ) : (
                                                    <span>{previewData?.non_peak_hours}</span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1 text-[11px] text-[#475569] mt-2">
                                                <PiWarningCircle className="rotate-180 flex-shrink-0" size={14} />
                                                {slotType === "NON_PEAK" ? (
                                                    <span>Slot starts at 8:00 AM. You can check in anytime before {previewData?.last_entry_time}.</span>
                                                ) : slotType === "EVENING_PEAK" ? (
                                                    <span>Slot starts at 5:00 PM. You can check in anytime before {previewData?.last_entry_time}.</span>
                                                ) : (
                                                    <span>Slot starts at {formatTime12Hour2(gym?.open_time)}. You can check in anytime before {previewData?.last_entry_time}.</span>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() =>
                                                navigate(`/gyms/${gym?.slug}/plan`)
                                            }
                                            className="text-sm text-[#2563EB] bg-[#DBEAFE] px-3 py-1 font-medium rounded-md"
                                        >
                                            Change
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* ===== Price Breakdown ===== */}
                            <div className="space-y-2 text-sm text-[#6A6A6A] text-nowrap pt-5 pb-5">
                                <h3 className="text-black text-sm mb-2">
                                    Price Breakdown
                                </h3>

                                <div className="flex justify-between text-nowrap">
                                    <span>{selectedHours?.label} (Base Fee)</span>
                                    <span className="font-medium text-[#0F172A]">{previewData?.base_price ?? "N/A"}₹</span>
                                </div>

                                <div className="flex justify-between text-nowrap">
                                    <span>Platform Fee</span>
                                    <span className="font-medium text-[#0F172A]">{previewData?.platform_fee ?? "N/A"}₹</span>
                                </div>

                                <div className="flex justify-between text-nowrap">
                                    <span>GST on Platform Fee</span>
                                    <span className="font-medium text-[#0F172A]">{previewData?.gst_fee ?? "N/A"}₹</span>
                                </div>

                                <div className="flex justify-between text-nowrap">
                                    <span>Roundoff</span>
                                    <span className="font-medium text-[#0F172A]">0.2₹</span>
                                </div>

                                <hr className="border-dashed my-2" />

                                <div className="flex justify-between text-nowrap text-[#0F172A] text-sm">
                                    <span>Total</span>
                                    <span className="text-sm text-black">Rs. {Math.round(Number(previewData?.total_payable)) ?? "N/A"}</span>
                                </div>
                            </div>

                            {/* {slotType === "NON_PEAK" && (
                                <div className="pt-4">
                                    <div className="flex items-center gap-2 bg-[#F1F5F9] py-1 px-2 rounded text-wrap">
                                        <PiWarningCircle className="rotate-180" size={14} />
                                        <p className="text-xs text-[#0F172A]">After 4 pm passes will be cancelled automatically with some Cancellation charges</p>
                                    </div>
                                </div>
                            )} */}

                            <div className="rounded-lg bg-[#F1F5F9] p-2">
                                <h3 className="font-semibold text-[#1E293B] text-sm mb-3">
                                    Cancellation Policy
                                </h3>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#22C55E] mt-1.5 flex-shrink-0" />
                                        <p className="text-[10.5px] text-[#0F172A] leading-relaxed">
                                            Cancel at least 1 hour before your last entry time for a full refund.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#EAB308] mt-1.5 flex-shrink-0" />
                                        <p className="text-[10.5px] text-[#0F172A] leading-relaxed">
                                            Cancel within 1 hour of your last entry time and receive a 50% refund.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#F43F5E] mt-1.5 flex-shrink-0" />
                                        <p className="text-[10.5px] text-[#0F172A] leading-relaxed">
                                            If you don't check in before your last entry time, no refund will be
                                            issued and your booking will be marked as a No-Show.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ===== Sticky Bottom Pay Bar ===== */}
                        <div id="share-bottom-bar" className="fixed max-w-[1300px] mx-auto bottom-0 left-0 right-0 bg-white">
                            <div className="bg-[#DBEAFE] text-[#2563EB] text-sm px-4 py-3 font-medium text-center">
                                Last entry for selected duration: {previewData?.last_entry_time}
                            </div>

                            <div className="flex justify-between items-center gap-3 px-4 py-5">
                                <div>
                                    {slotType && (
                                        <div className="text-xs font-medium text-nowrap">
                                            <span className="text-[#475569]">
                                                {selectedSlotTiming}
                                            </span>

                                            <span
                                                className={
                                                    slotType === "NON_PEAK"
                                                        ? "text-[#0F7D37]"
                                                        : "text-[#DC2626]"
                                                }
                                            >
                                                {" "}
                                                {slotType === "NON_PEAK"
                                                    ? "• Non-Peak"
                                                    : slotType === "MORNING_PEAK"
                                                        ? "• Morning Peak"
                                                        : "• Evening Peak"}
                                            </span>
                                        </div>
                                    )}

                                    <p className="text-[22px] font-semibold text-nowrap">
                                        ₹{(Math.round(Number(previewData?.total_payable))) ?? "N/A"}/{selectedHours?.label}
                                    </p>
                                </div>

                                <button
                                    onClick={handlePayment}
                                    disabled={payLoading}
                                    className="bg-[#2563EB] text-white px-4 py-4 min-w-[150px] h-[50px] w-full text-xs rounded-md font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {payLoading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        "Pay Using Razorpay"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {showSuccess && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-blue-500 z-50 flex items-center justify-center"
                            >
                                <motion.div
                                    initial={{ y: "-11vh", opacity: 0 }}
                                    animate={{
                                        y: ["-11vh", "0vh", "-1vh", "0vh"],
                                        opacity: [0, 1, 1, 1, 1, 1],
                                        scaleX: [1, 1.3, 0.9, 1.1, 0.95, 1],
                                        scaleY: [1, 0.6, 1.1, 0.9, 1.05, 1],
                                    }}
                                    transition={{
                                        duration: 1.2,
                                        times: [0, 0.45, 0.65, 0.78, 0.9, 1],
                                        ease: "easeIn"
                                    }}
                                >
                                    <motion.div
                                        animate={{
                                            scaleX: [1, 1 / 1.3, 1 / 0.9, 1 / 1.1, 1 / 0.95, 1],
                                            scaleY: [1, 1 / 0.6, 1 / 1.1, 1 / 0.9, 1 / 1.05, 1],
                                        }}
                                        transition={{
                                            duration: 1.2,
                                            times: [0, 0.45, 0.65, 0.78, 0.9, 1],
                                            ease: "easeIn"
                                        }}
                                    >
                                        <motion.div
                                            animate={{
                                                y: [0, -6, 5, -4, 3, -2, 1, 0],
                                            }}
                                            transition={{
                                                delay: 0.54,
                                                duration: 0.5,
                                                ease: "easeOut"
                                            }}
                                            className="text-white p-8 w-80 text-center"
                                        >
                                            <FaCircleCheck className="text-green-500 bg-white rounded-full text-[85px] mx-auto mb-3" />
                                            <h2 className="text-lg font-semibold mb-2">
                                                Payment Successful
                                            </h2>
                                            <p className="text-sm font-normal text-[#EBEBEB]">
                                                You will be redirected to the booking confirmation page.
                                            </p>
                                        </motion.div>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {showSecondSuccess && (
                <PaymentSuccess onClose={handleClose} gym={gym} bookingReference={bookingReference ?? localStorage.getItem("bookingReference")} />
            )}

            {/* ===== Payment Failed Sheet ===== */}
            <BottomSheet
                open={showPaymentFailed}
                onClose={() => setShowPaymentFailed(false)}
                title=""
                footer={
                    <button
                        onClick={() => setShowPaymentFailed(false)}
                        className="w-full bg-[#2563EB] text-white py-4 rounded-md font-semibold text-sm"
                    >
                        Ok
                    </button>
                }
            >
                <div className="flex flex-col items-center text-center gap-3">
                    <div className="bg-[#F43F5E] text-white rounded-full p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-[#0F172A]">Payment Failed</h2>
                    <p className="text-sm text-[#000000]">
                        Please try a different payment method or try again later.
                    </p>
                </div>
            </BottomSheet>
        </div>
    );
}

function Toast({ text, type, onClose }: { text: string; type: ToastType; onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 2000);
        return () => clearTimeout(timer);
    }, [onClose]);

    if (!type) return null;

    const isSuccess = type === "success";

    return (
        <div
            role="alert"
            className={`fixed bottom-20 z-50 left-4 right-4 mx-auto max-w-sm w-fit
            bg-white px-4 py-3 rounded-lg flex items-center gap-3
            shadow-[0_10px_40px_rgba(0,0,0,0.18)] animate-[fadeIn_0.2s_ease-out]`}
        >
            <span className={`text-xl flex-shrink-0 ${isSuccess ? "text-green-500" : "text-red-500"}`}>
                {isSuccess ? <FaCircleCheck /> : <MdError />}
            </span>
            <p className="text-sm font-medium">{text}</p>
        </div>
    );
}