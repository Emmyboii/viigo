import { useNavigate } from "react-router-dom";

import {
    IoTimeOutline,
    // IoPeopleOutline,
    // IoInformationCircleOutline,
} from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import PageHeader from "../components/PageHeader";
import { normalizeImagePath, useAppContext, type GymCard } from "../context/AppContext";
import FacilityTag from "../components/FacilityTag";
import { HiLocationMarker, HiOutlineCalendar } from "react-icons/hi";
import { PiIdentificationCardBold } from "react-icons/pi";
import { FaCircleCheck } from "react-icons/fa6";
import { MdError } from "react-icons/md";
import PaymentSuccess from "./PaymentSuccess";
import three2 from "../assets/three2.png";
import logoUrl from "../assets/icon2.png";
// import * as htmlToImage from "html-to-image";
import { snapdom } from "@zumer/snapdom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
type ToastType = "success" | "error" | null;

export interface PreviewData {
    base_price: string
    platform_fee: string
    gst_fee: string
    total_payable: string
    duration: string
}

export default function ReviewPay() {

    const { userData } = useAppContext()

    const navigate = useNavigate();
    const [showSuccess, setShowSuccess] = useState(false);
    const [showSecondSuccess, setShowSecondSuccess] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [gym, setGym] = useState<GymCard | null>(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
    const [previewLoading, setPreviewLoading] = useState(true);
    const [previewData, setPreviewData] = useState<PreviewData | null>(null);
    const [payLoading, setPayLoading] = useState(false);

    const storedData = localStorage.getItem("bookingData");

    const handleShare = async () => {
        const element = document.getElementById("share-area");
        const bottomBar = document.getElementById("share-bottom-bar");

        if (!element) return;

        // Save original styles

        if (bottomBar) {

            bottomBar.style.position = "relative";
            bottomBar.style.bottom = "0px";
        }
        try {
            await document.fonts.ready;

            // 🧠 SNAPDOM (replaces html-to-image)
            const canvasEl = await snapdom.toCanvas(element, {
                scale: 2, // similar to pixelRatio
                backgroundColor: "#ffffff",
            });

            const baseImage = new Image();
            baseImage.src = canvasEl.toDataURL("image/png");

            await new Promise((res) => {
                baseImage.onload = res;
            });

            // 🎨 FINAL CANVAS
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Adjust header height dynamically if needed
            const headerHeight = 150 * 3; // taller header for bigger logo/text

            canvas.width = baseImage.width;
            canvas.height = baseImage.height + headerHeight;

            // 🔷 Gradient header
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, "#2563EB");
            gradient.addColorStop(1, "#3B82F6");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, headerHeight);

            // 🧠 Logo
            const logo = new Image();
            logo.crossOrigin = "anonymous";
            logo.src = logoUrl;
            await new Promise((res) => { logo.onload = res; logo.onerror = res; });

            // Scale logo bigger
            const logoHeight = 80 * 3; // bigger than before
            const logoWidth = logoHeight * (logo.width / logo.height);

            // 🧠 Text
            const text = "Viigo";
            ctx.font = `bold ${70 * 3}px sans-serif`; // larger font
            ctx.fillStyle = "#fff";

            // Center logo + text horizontally
            const textWidth = ctx.measureText(text).width;
            const gap = 20;
            const totalWidth = logoWidth + gap + textWidth;
            const startX = (canvas.width - totalWidth) / 2;

            // Draw logo
            ctx.drawImage(
                logo,
                startX,
                (headerHeight - logoHeight) / 2, // vertically center
                logoWidth,
                logoHeight
            );

            // Draw text vertically centered
            ctx.textBaseline = "middle";
            ctx.fillText(
                text,
                startX + logoWidth + gap,
                headerHeight / 2
            );

            // 🖼 Draw main content
            ctx.drawImage(baseImage, 0, headerHeight);

            // 📦 Export
            const finalUrl = canvas.toDataURL("image/png");
            const blob = await (await fetch(finalUrl)).blob();

            const userName = userData?.full_name

            const fileName = `viigo-booking.png`;

            const file = new File([blob], fileName, { type: "image/png" });

            // Only essential info (NO links)
            const shareText = `
Viigo Booking

Name: ${userName}
Gym: ${gym?.name}
Date: ${formattedLongDate}
Hours: ${selectedHours?.label}
`.trim();

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], text: shareText });
            } else {
                window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");

                const link = document.createElement("a");
                link.href = finalUrl;
                link.download = fileName
                link.click();
            }
        } catch (err) {
            console.error("Share failed:", err);
        }

        if (bottomBar) {
            bottomBar.style.position = "fixed";
            bottomBar.style.bottom = "3.5rem";
        }
    };

    // const initialState = location.state
    //     ? location.state
    //     : storedData
    //         ? JSON.parse(storedData)
    //         : null;

    const initialState = storedData
        ? JSON.parse(storedData)
        : null;

    useEffect(() => {
        const paid = localStorage.getItem("paid");

        if (paid === "true" || !storedData) {
            navigate("/", { replace: true });
        }
    }, [navigate]);

    // const { selectedDate, selectedHours, id } = initialState;

    const selectedDate = initialState?.selectedDate
    const selectedHours = initialState?.selectedHours
    const peopleCount = initialState?.peopleCount
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

                const detailRes = await fetch(`${backendUrl}/gymowner/gym/${id}/`, {
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
    }, []);

    useEffect(() => {
        const runPreview = async () => {
            if (!id || !selectedDate || !selectedHours?.value) return;

            setPreviewLoading(true);

            try {
                const payload = {
                    gym_id: id,
                    date: formatDateForAPI(selectedDate),
                    duration: String(selectedHours.value),
                    number_of_friends: peopleCount
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

                setToast({
                    type: "error",
                    message: "Unable to preview booking",
                });

            } finally {
                setPreviewLoading(false);
            }
        };

        runPreview();
    }, []);

    // const totalWithHr = (initialState?.selectedHours && gym)
    //     ? gym?.hourly_rate * initialState?.selectedHours.value
    //     : gym?.hourly_rate;

    // const platformFee = 12;
    // const gst = 2.16;
    // const total = totalWithHr && totalWithHr + platformFee + gst;

    // const convertTo24Hour = (time12h: string) => {
    //     const [time, modifier] = time12h.split(" ");

    //     let hours = parseInt(time, 10);

    //     if (modifier === "PM" && hours !== 12) {
    //         hours += 12;
    //     }

    //     if (modifier === "AM" && hours === 12) {
    //         hours = 0;
    //     }

    //     return `${hours.toString().padStart(2, "0")}:00`;
    // };

    function formatTime12Hour(time24: string | undefined) {
        const [hourStr, minuteStr] = time24?.split(":") || [];
        let hour = Number(hourStr);
        const minute = minuteStr;
        const ampm = hour >= 12 ? "PM" : "AM";

        hour = hour % 12;
        if (hour === 0) hour = 12;

        return `${hour}:${minute} ${ampm}`;
    }

    const formatDateForAPI = (isoDate: string) => {
        const date = new Date(isoDate);

        return date.toISOString().split("T")[0]; // "2026-02-28"
    };

    // function normalizePeak(p: [string, string] | { start: string, end: string } | any): [string, string] {
    //     if (Array.isArray(p) && p.length === 2) return [p[0], p[1]];
    //     if (p?.start && p?.end) return [p.start, p.end];
    //     return ["00:00", "00:00"];
    // }

    // // Ensure peak_morning and peak_evening are arrays
    // const morningPeaks = Array.isArray(gym?.peak_morning)
    //     ? gym.peak_morning
    //     : gym?.peak_morning ? [gym.peak_morning] : [];

    // const eveningPeaks = Array.isArray(gym?.peak_evening)
    //     ? gym.peak_evening
    //     : gym?.peak_evening ? [gym.peak_evening] : [];

    // const allPeaks: [string, string][] = [
    //     ...morningPeaks.map(normalizePeak),
    //     ...eveningPeaks.map(normalizePeak),
    // ];

    const closingTime = gym?.close_time

    const calculateLastEntry = () => {
        if (!selectedHours?.value || !closingTime) return "";

        const [hour, minute] = closingTime.split(":").map(Number);

        const closingDate = new Date();
        closingDate.setHours(hour, minute, 0, 0);

        // subtract selected duration
        const durationInMinutes = selectedHours.value * 60;

        closingDate.setMinutes(closingDate.getMinutes() - durationInMinutes);

        return closingDate.toLocaleTimeString("en-GB", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    const lastEntryTime = calculateLastEntry();

    const bookingDate = selectedDate ? new Date(selectedDate) : null;

    const formattedShortDate = bookingDate
        ? bookingDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
        : "";

    const formattedLongDate = bookingDate
        ? bookingDate.toLocaleDateString("en-GB", { day: "numeric", month: "long" })
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
                booking_date: formatDateForAPI(selectedDate),
                duration_in_hours: String(selectedHours.value),
                number_of_friends: peopleCount
            };

            const headers = {
                "Content-Type": "application/json",
                Authorization: localStorage.getItem("token")
                    ? `Bearer ${localStorage.getItem("token")}`
                    : "",
            };


            // 2️⃣ CONFIRM BOOKING
            const confirmRes = await fetch(`${backendUrl}/client/booking/confirm/`, {
                method: "POST",
                headers,
                body: JSON.stringify(payload),
            });

            const confirmData = await confirmRes.json();

            if (!confirmRes.ok) {
                throw confirmData;
            }

            const payment = confirmData.data.payment_details;

            // 2️⃣ OPEN RAZORPAY
            const options = {
                key: payment.razorpay_key_id,
                amount: payment.amount,
                currency: payment.currency,
                name: payment.name,
                description: payment.description,
                order_id: payment.razorpay_order_id,

                handler: function (response: any) {

                    console.log("Payment success:", response);

                    // response contains:
                    // razorpay_payment_id
                    // razorpay_order_id
                    // razorpay_signature

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
                    }
                },

                theme: {
                    color: "#2563EB"
                }
            };

            const razorpay = new (window as any).Razorpay(options);

            razorpay.open();

        } catch (error: unknown) {
            let errorMessage = "Something went wrong";

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === "object" && error !== null) {
                const err = error as {
                    data?: Record<string, string[]>;
                    message?: string;
                    non_field_errors?: string[];
                };

                if (err.data) {
                    const fieldErrors = Object.values(err.data).flat();
                    if (fieldErrors.length) errorMessage = fieldErrors[0];
                } else if (err.non_field_errors?.length) {
                    errorMessage = err.non_field_errors[0];
                } else if (err.message) {
                    errorMessage = err.message;
                }
            }

            setToast({ type: "error", message: errorMessage });
            setTimeout(() => setToast(null), 3400);
        } finally {
            setPayLoading(false);
        }
    };

    const handleClose = () => {
        localStorage.removeItem("paymentSuccess");
        localStorage.removeItem("bookingData");
        localStorage.removeItem("selectedBookingId");
        setShowSecondSuccess(false);
        // navigate("/");
    };

    const handleToastClose = useCallback(() => {
        setToast(null);
    }, []);

    const visibleAmenities = gym?.amenities.slice(0, 2);

    if (loading || previewLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4 p-8 bg-white animate-fadeIn">
                    <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-700 text-lg font-medium">
                        Loading...
                    </p>
                    <p className="text-gray-400 text-sm text-center">
                        This might take a few seconds. Sit tight!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-36 min-h-screen max-w-[1300px] mx-auto">
            {!showSecondSuccess && (

                <div>
                    {/* ===== Header ===== */}
                    <PageHeader text="Review and Pay" onShare={handleShare} />

                    <div className="pt-14" />

                    <div id="share-area" className="min-h-screen bg-white">

                        <div className="p-4 space-y-4 relative">

                            {toast && <Toast type={toast.type} text={toast.message} onClose={handleToastClose} />}


                            {/* ===== Gym Summary Card ===== */}
                            <div className="bg-white rounded border flex gap-1">
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
                                        <span>{gym?.distance} {gym?.area}</span>
                                        <span>•</span>
                                        <span>{gym?.open_status || `Open Till ${formatTime12Hour(gym?.close_time)}`}</span>
                                    </div>

                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        {visibleAmenities?.map((amenity, index) => (
                                            <FacilityTag key={index} amenity={amenity} />
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2 mt-4">
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
                                                <p className="break-al text-[#0F172A]">{userData?.full_name.split(" ")[0] || userData?.email} +{peopleCount} {peopleCount > 1 ? "Friends" : "Friend"} </p>
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

                                    <div className="flex justify-between items-center">
                                        <div className="space-y-3">
                                            <h3 className="font-semibold">Selected Pass</h3>

                                            <div className="flex items-center gap-1 text-nowrap text-sm text-[#0F172A] mt-2">
                                                <HiOutlineCalendar size={14} />
                                                <span>{formattedShortDate}</span>
                                                <span>•</span>
                                                <span>{selectedHours?.label}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-[#0F172A] mt-2">
                                                <PiIdentificationCardBold size={14} />
                                                <span>Enter anytime during the day</span>
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

                                <hr />

                                {/* Gym timings */}
                                <div>
                                    <h4 className="font-medium">Gym timings</h4>

                                    <div className="flex items-center gap-2 text-nowrap text-sm text-[#0F172A] mt-2">
                                        <IoTimeOutline size={14} />
                                        <span>{formatTime12Hour(gym?.open_time)} – {formatTime12Hour(gym?.close_time)} </span>
                                    </div>
                                </div>
                            </div>

                            {/* ===== Price Breakdown ===== */}
                            <div className="space-y-2 text-sm text-[#6A6A6A] text-nowrap mt-2">
                                <h3 className="text-black text-sm mb-2">
                                    Price Breakdown
                                </h3>

                                <div className="flex justify-between text-nowrap">
                                    {/* <span>{previewData?.duration ?? "N/A"} Hours</span> */}
                                    <span>{selectedHours?.label}</span>
                                    <span className="font-medium text-[#0F172A]">Rs. {previewData?.base_price ?? "N/A"}</span>
                                </div>

                                <div className="flex justify-between text-nowrap">
                                    <span>Platform Fee</span>
                                    <span className="font-medium text-[#0F172A]">Rs. {previewData?.platform_fee ?? "N/A"}</span>
                                </div>

                                <div className="flex justify-between text-nowrap">
                                    <span>GST on Platform Fee</span>
                                    <span className="font-medium text-[#0F172A]">Rs. {previewData?.gst_fee ?? "N/A"}</span>
                                </div>

                                <hr className="border-dashed my-2" />

                                <div className="flex justify-between text-nowrap text-[#0F172A] text-sm">
                                    <span>Total</span>
                                    <span className="text-sm text-black">Rs. {previewData?.total_payable ?? "N/A"}</span>
                                </div>
                            </div>
                        </div>

                        {/* ===== Sticky Bottom Pay Bar ===== */}
                        <div id="share-bottom-bar" className="fixed max-w-[1300px] mx-auto bottom-0 left-0 right-0 bg-white">
                            <div className="bg-[#DBEAFE] text-[#2563EB] text-sm px-4 py-3 font-medium text-center">
                                Last entry for selected duration: {lastEntryTime}
                            </div>

                            <div className="flex justify-between items-center px-4 py-5">
                                <div>
                                    <p className="text-xs text-[#475569] text-nowrap font-medium mb-1">
                                        Valid on {formattedLongDate}
                                    </p>

                                    <p className="text-[22px] font-semibold text-nowrap">
                                        ₹{previewData?.total_payable ?? "N/A"}/{selectedHours?.label}
                                    </p>
                                </div>

                                <button
                                    onClick={handlePayment}
                                    disabled={payLoading}
                                    className="bg-[#2563EB] text-white px-6 py-4 w-[163px] text-xs rounded-md font-medium flex items-center justify-center gap-2 disabled:opacity-60"
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


                    {/* Success Modal */}
                    <AnimatePresence>
                        {showSuccess && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-blue-500 z-50 flex items-center justify-center"
                            >
                                <motion.div
                                    initial={{ y: -300 }}       // Start above the viewport
                                    animate={{ y: 0 }}          // Drop to center
                                    exit={{ y: -300, opacity: 0 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,           // Spring stiffness
                                        damping: 25,              // Less damping = more bounce
                                        mass: 1.5
                                    }}
                                    className="text-white p-8 w-80 text-center"
                                >
                                    <FaCheckCircle className="text-green-500 text-[85px] mx-auto mb-3" />
                                    <h2 className="text-lg font-semibold mb-2">
                                        Payment Successful
                                    </h2>
                                    <p className="text-sm font-normal text-[#EBEBEB]">
                                        You will be redirected to the booking confirmation page.
                                    </p>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Second Success Modal */}
            {showSecondSuccess && (
                <PaymentSuccess onClose={handleClose} gym={gym} />
            )}
        </div >
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
            className={`fixed w-[280px] bottom-10 z-50 left-1/2 -translate-x-1/2 
      bg-white px-4 py-3 rounded-lg flex items-center gap-3
      shadow-[0_10px_40px_rgba(0,0,0,0.18)] animate-[fadeIn_0.2s_ease-out]`}
        >
            <span className={`text-xl ${isSuccess ? "text-green-500" : "text-red-500"}`}>
                {isSuccess ? <FaCircleCheck /> : <MdError />}
            </span>
            <p className="text-sm font-medium">{text}</p>
        </div>
    );
}
