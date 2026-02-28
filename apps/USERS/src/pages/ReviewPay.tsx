// import { Navigate, useNavigate } from "react-router-dom";

// import {
//     IoTimeOutline,
//     IoPeopleOutline,
//     IoInformationCircleOutline,
// } from "react-icons/io5";
// import { motion, AnimatePresence } from "framer-motion";
// import { useCallback, useEffect, useState } from "react";
// import { FaCheckCircle } from "react-icons/fa";
// import PageHeader from "../components/PageHeader";
// import type { GymCard } from "../context/AppContext";
// import FacilityTag from "../components/FacilityTag";
// import { HiLocationMarker, HiOutlineCalendar } from "react-icons/hi";
// import { PiIdentificationCardBold } from "react-icons/pi";
// import { FaCircleCheck } from "react-icons/fa6";
// import { MdError } from "react-icons/md";

// const backendUrl = import.meta.env.VITE_BACKEND_URL;
// type ToastType = "success" | "error" | null;

// export default function ReviewPay() {
//     const navigate = useNavigate();
//     // const location = useLocation();
//     const [showSuccess, setShowSuccess] = useState(false);
//     const [gym, setGym] = useState<GymCard | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

//     // Hardcoded gym for now

//     const storedData = localStorage.getItem("bookingData");

//     // const initialState = location.state
//     //     ? location.state
//     //     : storedData
//     //         ? JSON.parse(storedData)
//     //         : null;

//     const initialState = storedData
//         ? JSON.parse(storedData)
//         : null;

//     // Redirect immediately if no booking data exists
//     if (!initialState || !initialState.selectedDate || !initialState.selectedHours) {
//         return <Navigate to={`/`} replace />;
//     }

//     const { selectedDate, selectedHours, id } = initialState;

//     useEffect(() => {
//         const fetchGymById = async () => {
//             if (!id) return;

//             setLoading(true);

//             try {

//                 const detailRes = await fetch(`${backendUrl}/gymowner/gym/${id}/`, {
//                     headers: {
//                         "Content-Type": "application/json",
//                         Authorization: localStorage.getItem("token")
//                             ? `Bearer ${localStorage.getItem("token")}`
//                             : "",
//                     },
//                 });

//                 if (!detailRes.ok) throw new Error("Failed to fetch gym details");

//                 const detailData = await detailRes.json();
//                 setGym(detailData?.data || null);
//             } catch (err) {
//                 console.error(err);
//                 setGym(null);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchGymById();
//     }, []);

//     const totalWithHr = (initialState?.selectedHours && gym)
//         ? gym?.hourly_rate * initialState?.selectedHours.value
//         : gym?.hourly_rate;

//     const platformFee = 10;
//     const gst = 3;
//     const total = totalWithHr && totalWithHr + platformFee + gst;

//     // const convertTo24Hour = (time12h: string) => {
//     //     const [time, modifier] = time12h.split(" ");

//     //     let hours = parseInt(time, 10);

//     //     if (modifier === "PM" && hours !== 12) {
//     //         hours += 12;
//     //     }

//     //     if (modifier === "AM" && hours === 12) {
//     //         hours = 0;
//     //     }

//     //     return `${hours.toString().padStart(2, "0")}:00`;
//     // };

//     function formatTime12Hour(time24: string | undefined) {
//         const [hourStr, minuteStr] = time24?.split(":") || [];
//         let hour = Number(hourStr);
//         const minute = minuteStr;
//         const ampm = hour >= 12 ? "PM" : "AM";

//         hour = hour % 12;
//         if (hour === 0) hour = 12;

//         return `${hour}:${minute} ${ampm}`;
//     }

//     const formatDateForAPI = (isoDate: string) => {
//         const date = new Date(isoDate);

//         return date.toISOString().split("T")[0]; // "2026-02-28"
//     };

//     const allPeaks = [
//         ...(gym?.peak_morning ?? []),
//         ...(gym?.peak_evening ?? []),
//     ];

//     const closingTime = gym?.close_time


//     const calculateLastEntry = () => {
//         if (!selectedHours?.value || !closingTime) return "";

//         const [hour, minute] = closingTime.split(":").map(Number);

//         const closingDate = new Date();
//         closingDate.setHours(hour, minute, 0, 0);

//         // subtract selected duration
//         const durationInMinutes = selectedHours.value * 60;

//         closingDate.setMinutes(closingDate.getMinutes() - durationInMinutes);

//         return closingDate.toLocaleTimeString("en-GB", {
//             hour: "numeric",
//             minute: "2-digit",
//             hour12: true,
//         });
//     };

//     const lastEntryTime = calculateLastEntry();

//     const bookingDate = selectedDate ? new Date(selectedDate) : null;

//     const formattedShortDate = bookingDate
//         ? bookingDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
//         : "";

//     const formattedLongDate = bookingDate
//         ? bookingDate.toLocaleDateString("en-GB", { day: "numeric", month: "long" })
//         : "";

//     const handlePayment = async () => {
//         if (!id || !selectedDate || !selectedHours?.value) return;

//         try {
//             const payload = {
//                 gym: id,
//                 booking_date: formatDateForAPI(selectedDate),
//                 duration_in_hours: String(selectedHours.value),
//             };

//             const res = await fetch(`${backendUrl}/client/booking/confirm/`, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     Authorization: localStorage.getItem("token")
//                         ? `Bearer ${localStorage.getItem("token")}`
//                         : "",
//                 },
//                 body: JSON.stringify(payload),
//             });

//             if (!res.ok) {
//                 throw new Error("Booking failed");
//             }

//             const data = await res.json();
//             console.log("Booking success:", data);

//             // ✅ Show success modal AFTER API success
//             setShowSuccess(true);

//             setTimeout(() => {
//                 navigate("/payment/success");
//                 localStorage.removeItem("bookingData");
//                 window.scrollTo(0, 0);
//             }, 3000);

//         } catch (error) {
//             const errorMessage = error instanceof Error ? error.message : "Something went wrong";
//             setToast({ type: "error", message: errorMessage });
//             setTimeout(() => setToast(null), 2000);
//         }
//     };

//     const handleToastClose = useCallback(() => {
//         setToast(null);
//     }, []);

//     const visibleAmenities = gym?.amenities.slice(0, 2);

//     if (loading) {
//         return (
//             <div className="flex items-center justify-center min-h-screen">
//                 <div className="flex flex-col items-center gap-4 p-8 bg-white animate-fadeIn">
//                     <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//                     <p className="text-gray-700 text-lg font-medium">
//                         Loading...
//                     </p>
//                     <p className="text-gray-400 text-sm text-center">
//                         This might take a few seconds. Sit tight!
//                     </p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="pb-36 min-h-screen">

//             {/* ===== Header ===== */}
//             <PageHeader text="Review and Pay" />

//             <div className="pt-14" />

//             <div className="p-4 space-y-4 relative">

//                 {toast && <Toast type={toast.type} text={toast.message} onClose={handleToastClose} />}


//                 {/* ===== Gym Summary Card ===== */}
//                 <div className="bg-white rounded-xl border flex gap-1 min-h-[130px]">
//                     <img
//                         src={gym?.images[0].image}
//                         alt={gym?.name}
//                         className="w-[85px] min-h-full rounded-tl-lg rounded-bl-lg object-cover"
//                     />

//                     <div className="flex-1 p-3">
//                         <h2 className="font-semibold">{gym?.name}</h2>

//                         <div className="flex items-center text-xs text-gray-500 gap-1 mt-2 flex-wrap">
//                             <HiLocationMarker size={12} />
//                             <span>{gym?.distance} {gym?.location}</span>
//                             <span>•</span>
//                             <span>{gym?.open_status || `Open Till ${formatTime12Hour(gym?.close_time)}`}</span>
//                         </div>

//                         <div className="flex gap-2 mt-2 flex-wrap">
//                             {visibleAmenities?.map((amenity, index) => (
//                                 <FacilityTag key={index} amenity={amenity} />
//                             ))}
//                         </div>

//                         <div className="flex items-center gap-2 mt-4">
//                             <p className="font-semibold">₹{Number(gym?.hourly_rate)}/Hr</p>
//                             <span className="text-xs bg-[#22C55E] text-white px-2 py-1 rounded-full">
//                                 Confirmed
//                             </span>
//                         </div>
//                     </div>
//                 </div>

//                 {/* ===== Selected Pass ===== */}
//                 <div className="bg-white rounded-xl border p-4 space-y-4">

//                     <div className="flex justify-between items-start">
//                         <div>
//                             <h3 className="font-semibold">Selected Pass</h3>

//                             <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
//                                 <HiOutlineCalendar size={14} />
//                                 <span>{formattedShortDate}</span>
//                                 <span>•</span>
//                                 <span>{selectedHours?.label}</span>
//                             </div>

//                             <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
//                                 <PiIdentificationCardBold size={14} />
//                                 <span>Enter anytime during the day</span>
//                             </div>
//                         </div>

//                         <button
//                             onClick={() =>
//                                 navigate(`/gyms/${gym?.slug}`, {
//                                     state: { reopenSheet: true }
//                                 })}
//                             className="text-sm text-[#2563EB] bg-[#DBEAFE] px-3 py-1 font-medium rounded-md"
//                         >
//                             Change
//                         </button>
//                     </div>

//                     <hr />

//                     {/* Gym timings */}
//                     <div>
//                         <h4 className="font-medium">Gym timings</h4>

//                         <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
//                             <IoTimeOutline size={14} />
//                             <span>{formatTime12Hour(gym?.open_time)} – {formatTime12Hour(gym?.close_time)} </span>
//                         </div>
//                     </div>

//                     <hr />

//                     {/* Peak hours */}
//                     <div>
//                         <h4 className="font-medium">Peak hours</h4>

//                         <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
//                             <IoPeopleOutline size={14} />

//                             <div className="flex gap-2 flex-wrap">
//                                 {allPeaks.map(([start, end], i) => (
//                                     <span key={i}>
//                                         {formatTime12Hour(start)} - {formatTime12Hour(end)}
//                                         {i !== allPeaks.length - 1 && ","}
//                                     </span>
//                                 ))}
//                             </div>
//                         </div>

//                         <div className="flex items-start gap-2 text-xs text-gray-500 mt-2">
//                             <IoInformationCircleOutline size={14} />
//                             <span>
//                                 Workouts during peak hours may use more minutes
//                             </span>
//                         </div>
//                     </div>
//                 </div>

//                 {/* ===== Price Breakdown ===== */}
//                 <div className="space-y-2 text-sm text-gray-700 mt-2">
//                     <h3 className="font-semibold text-gray-800 mb-2">
//                         Price Breakdown
//                     </h3>

//                     <div className="flex justify-between">
//                         <span>{selectedHours.label}</span>
//                         <span>Rs. {totalWithHr}</span>
//                     </div>

//                     <div className="flex justify-between">
//                         <span>Platform Fee</span>
//                         <span>Rs. {platformFee}</span>
//                     </div>

//                     <div className="flex justify-between">
//                         <span>GST on Platform Fee</span>
//                         <span>Rs. {gst}</span>
//                     </div>

//                     <hr className="border-dashed my-2" />

//                     <div className="flex justify-between font-semibold text-base">
//                         <span>Total</span>
//                         <span>Rs. {total}</span>
//                     </div>
//                 </div>
//             </div>

//             {/* ===== Info Strip ===== */}


//             {/* ===== Sticky Bottom Pay Bar ===== */}
//             <div className="fixed bottom-0 left-0 right-0 bg-white">
//                 <div className="bg-blue-50 text-blue-700 text-sm px-4 py-3 font-medium text-center">
//                     Last entry for selected duration: {lastEntryTime}
//                 </div>

//                 <div className="flex justify-between items-center px-4 py-5">
//                     <div>
//                         <p className="text-xs text-[#475569] font-medium mb-2">
//                             Valid on {formattedLongDate}
//                         </p>

//                         <p className="text-xl font-bold">
//                             ₹{total}/{selectedHours?.label}
//                         </p>
//                     </div>

//                     <button
//                         onClick={handlePayment}
//                         className="bg-blue-600 text-white px-6 py-3 w-[163px] text-xs rounded-md font-medium"
//                     >
//                         Pay Using Razorpay
//                     </button>
//                 </div>
//             </div>

//             {/* Success Modal */}
//             <AnimatePresence>
//                 {showSuccess && (
//                     <motion.div
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         exit={{ opacity: 0 }}
//                         className="fixed inset-0 bg-blue-500 z-50 flex items-center justify-center"
//                     >
//                         <motion.div
//                             initial={{ scale: 0.5 }}
//                             animate={{ scale: 1 }}
//                             transition={{ duration: 0.5 }}
//                             className="text-white p-8 w-80 text-center"
//                         >
//                             <FaCheckCircle className="text-green-500 text-[85px] mx-auto mb-3" />
//                             <h2 className="text-lg font-semibold mb-2">
//                                 Payment Successful
//                             </h2>
//                             <p className="text-sm font-normal text-[#EBEBEB]">
//                                 You will be redirected to the booking confirmation page.
//                             </p>
//                         </motion.div>
//                     </motion.div>
//                 )}
//             </AnimatePresence>
//         </div >
//     );
// }

// function Toast({ text, type, onClose }: { text: string; type: ToastType; onClose: () => void }) {
//     useEffect(() => {
//         const timer = setTimeout(() => {
//             onClose();
//         }, 2000);
//         return () => clearTimeout(timer);
//     }, [onClose]);

//     if (!type) return null;

//     const isSuccess = type === "success";

//     return (
//         <div
//             role="alert"
//             className={`fixed w-[280px] bottom-10 z-50 left-1/2 -translate-x-1/2 
//       bg-white px-4 py-3 rounded-lg flex items-center gap-3
//       shadow-[0_10px_40px_rgba(0,0,0,0.18)] animate-[fadeIn_0.2s_ease-out]`}
//         >
//             <span className={`text-xl ${isSuccess ? "text-green-500" : "text-red-500"}`}>
//                 {isSuccess ? <FaCircleCheck /> : <MdError />}
//             </span>
//             <p className="text-sm font-medium">{text}</p>
//         </div>
//     );
// }

import { Navigate, useNavigate } from "react-router-dom";

import {
    IoTimeOutline,
    IoPeopleOutline,
    IoInformationCircleOutline,
} from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import PageHeader from "../components/PageHeader";
import type { GymCard } from "../context/AppContext";
import FacilityTag from "../components/FacilityTag";
import { HiLocationMarker, HiOutlineCalendar } from "react-icons/hi";
import { PiIdentificationCardBold } from "react-icons/pi";
import { FaCircleCheck } from "react-icons/fa6";
import { MdError } from "react-icons/md";
import PaymentSuccess from "./PaymentSuccess";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
type ToastType = "success" | "error" | null;

export default function ReviewPay() {
    const navigate = useNavigate();
    const [showSuccess, setShowSuccess] = useState(false);
    const [showSecondSuccess, setShowSecondSuccess] = useState(false);
    const [gym, setGym] = useState<GymCard | null>(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);


    const storedData = localStorage.getItem("bookingData");

    // const initialState = location.state
    //     ? location.state
    //     : storedData
    //         ? JSON.parse(storedData)
    //         : null;

    const initialState = storedData
        ? JSON.parse(storedData)
        : null;

    // Redirect immediately if no booking data exists
    if (!initialState || !initialState.selectedDate || !initialState.selectedHours) {
        return <Navigate to={`/`} replace />;
    }

    const { selectedDate, selectedHours, id } = initialState;

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
                localStorage.removeItem("lastBookingId");
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

    const totalWithHr = (initialState?.selectedHours && gym)
        ? gym?.hourly_rate * initialState?.selectedHours.value
        : gym?.hourly_rate;

    const platformFee = 10;
    const gst = 3;
    const total = totalWithHr && totalWithHr + platformFee + gst;

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

    const allPeaks = [
        ...(Array.isArray(gym?.peak_morning) ? gym.peak_morning : []),
        ...(Array.isArray(gym?.peak_evening) ? gym.peak_evening : []),
    ];
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

    const handlePayment = async () => {
        if (!id || !selectedDate || !selectedHours?.value) return;

        try {
            const payload = {
                gym: id,
                booking_date: formatDateForAPI(selectedDate),
                duration_in_hours: String(selectedHours.value),
            };

            const res = await fetch(`${backendUrl}/client/booking/confirm/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: localStorage.getItem("token")
                        ? `Bearer ${localStorage.getItem("token")}`
                        : "",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw data;
            }

            console.log("Booking success:", data);

            localStorage.setItem("paymentSuccess", "true");
            localStorage.setItem("lastBookingId", data.data.gym);

            // ✅ Show success modal AFTER API success
            setShowSuccess(true);

            setTimeout(() => {
                setShowSecondSuccess(true);
                localStorage.removeItem("bookingData");
                window.scrollTo(0, 0);
            }, 3000);

        } catch (error: unknown) {
            let errorMessage = "Something went wrong";

            if (error instanceof Error) {
                // Generic JS/network error
                errorMessage = error.message;
            } else if (typeof error === "object" && error !== null) {
                const err = error as {
                    data?: Record<string, string[]>;
                    message?: string;
                    non_field_errors?: string[];
                };

                // Prefer non_field_errors
                if (err.data) {
                    // Flatten first error from any field
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
        }
    };

    const handleClose = () => {
        localStorage.removeItem("paymentSuccess");
        localStorage.removeItem("lastBookingId");
        setShowSecondSuccess(false);
        // navigate("/");
    };

    const handleToastClose = useCallback(() => {
        setToast(null);
    }, []);

    const visibleAmenities = gym?.amenities.slice(0, 2);

    if (loading) {
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
        <div className="pb-36 min-h-screen">
            {!showSecondSuccess && (

                <div>
                    {/* ===== Header ===== */}
                    <PageHeader text="Review and Pay" />

                    <div className="pt-14" />

                    <div className="p-4 space-y-4 relative">

                        {toast && <Toast type={toast.type} text={toast.message} onClose={handleToastClose} />}


                        {/* ===== Gym Summary Card ===== */}
                        <div className="bg-white rounded-xl border flex gap-1 min-h-[130px]">
                            <img
                                src={gym?.images[0]?.image}
                                alt={gym?.name}
                                className="w-[85px] min-h-full rounded-tl-lg rounded-bl-lg object-cover"
                            />

                            <div className="flex-1 p-3">
                                <h2 className="font-semibold">{gym?.name}</h2>

                                <div className="flex items-center text-xs text-gray-500 gap-1 mt-2 flex-wrap">
                                    <HiLocationMarker size={12} />
                                    <span>{gym?.distance} {gym?.location}</span>
                                    <span>•</span>
                                    <span>{gym?.open_status || `Open Till ${formatTime12Hour(gym?.close_time)}`}</span>
                                </div>

                                <div className="flex gap-2 mt-2 flex-wrap">
                                    {visibleAmenities?.map((amenity, index) => (
                                        <FacilityTag key={index} amenity={amenity} />
                                    ))}
                                </div>

                                <div className="flex items-center gap-2 mt-4">
                                    <p className="font-semibold">₹{Number(gym?.hourly_rate)}/Hr</p>
                                    <span className="text-xs bg-[#22C55E] text-white px-2 py-1 rounded-full">
                                        Confirmed
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ===== Selected Pass ===== */}
                        <div className="bg-white rounded-xl border p-4 space-y-4">

                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold">Selected Pass</h3>

                                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
                                        <HiOutlineCalendar size={14} />
                                        <span>{formattedShortDate}</span>
                                        <span>•</span>
                                        <span>{selectedHours?.label}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                                        <PiIdentificationCardBold size={14} />
                                        <span>Enter anytime during the day</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() =>
                                        navigate(`/gyms/${gym?.slug}`, {
                                            state: { reopenSheet: true }
                                        })}
                                    className="text-sm text-[#2563EB] bg-[#DBEAFE] px-3 py-1 font-medium rounded-md"
                                >
                                    Change
                                </button>
                            </div>

                            <hr />

                            {/* Gym timings */}
                            <div>
                                <h4 className="font-medium">Gym timings</h4>

                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                                    <IoTimeOutline size={14} />
                                    <span>{formatTime12Hour(gym?.open_time)} – {formatTime12Hour(gym?.close_time)} </span>
                                </div>
                            </div>

                            <hr />

                            {/* Peak hours */}
                            <div>
                                <h4 className="font-medium">Peak hours</h4>

                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                                    <IoPeopleOutline size={14} />

                                    <div className="flex gap-2 flex-wrap">
                                        {allPeaks.map(([start, end], i) => (
                                            <span key={i}>
                                                {formatTime12Hour(start)} - {formatTime12Hour(end)}
                                                {i !== allPeaks.length - 1 && ","}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-start gap-2 text-xs text-gray-500 mt-2">
                                    <IoInformationCircleOutline size={14} />
                                    <span>
                                        Workouts during peak hours may use more minutes
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ===== Price Breakdown ===== */}
                        <div className="space-y-2 text-sm text-gray-700 mt-2">
                            <h3 className="font-semibold text-gray-800 mb-2">
                                Price Breakdown
                            </h3>

                            <div className="flex justify-between">
                                <span>{selectedHours.label}</span>
                                <span>Rs. {totalWithHr}</span>
                            </div>

                            <div className="flex justify-between">
                                <span>Platform Fee</span>
                                <span>Rs. {platformFee}</span>
                            </div>

                            <div className="flex justify-between">
                                <span>GST on Platform Fee</span>
                                <span>Rs. {gst}</span>
                            </div>

                            <hr className="border-dashed my-2" />

                            <div className="flex justify-between font-semibold text-base">
                                <span>Total</span>
                                <span>Rs. {total}</span>
                            </div>
                        </div>
                    </div>

                    {/* ===== Sticky Bottom Pay Bar ===== */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white">
                        <div className="bg-blue-50 text-blue-700 text-sm px-4 py-3 font-medium text-center">
                            Last entry for selected duration: {lastEntryTime}
                        </div>

                        <div className="flex justify-between items-center px-4 py-5">
                            <div>
                                <p className="text-xs text-[#475569] font-medium mb-2">
                                    Valid on {formattedLongDate}
                                </p>

                                <p className="text-xl font-bold">
                                    ₹{total}/{selectedHours?.label}
                                </p>
                            </div>

                            <button
                                onClick={handlePayment}
                                className="bg-blue-600 text-white px-6 py-3 w-[163px] text-xs rounded-md font-medium"
                            >
                                Pay Using Razorpay
                            </button>
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
                                    initial={{ scale: 0.5 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.5 }}
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
