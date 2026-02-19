import { Navigate, useNavigate } from "react-router-dom";
import { gyms } from "../data/gyms";

import {
    IoLocationOutline,
    IoCalendarOutline,
    IoTimeOutline,
    IoPeopleOutline,
    IoInformationCircleOutline,
} from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import PageHeader from "../components/PageHeader";

export default function ReviewPay() {
    const navigate = useNavigate();
    // const location = useLocation();
    const [showSuccess, setShowSuccess] = useState(false);

    // Hardcoded gym for now
    const gym = gyms[0];

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
        return <Navigate to={`/gyms/${gym.slug}`} replace />;
    }

    const { selectedDate, selectedHours } = initialState;

    const basePrice = 410;
    const platformFee = 12;
    const gst = 3;
    const total = basePrice + platformFee + gst;

    const convertTo24Hour = (time12h: string) => {
        const [time, modifier] = time12h.split(" ");

        let hours = parseInt(time, 10);

        if (modifier === "PM" && hours !== 12) {
            hours += 12;
        }

        if (modifier === "AM" && hours === 12) {
            hours = 0;
        }

        return `${hours.toString().padStart(2, "0")}:00`;
    };

    const closingTime = convertTo24Hour(gym.closeTime);


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

    const handlePayment = () => {

        // Show success modal
        setShowSuccess(true);

        // Navigate after 3 seconds
        setTimeout(() => {
            navigate("/payment/success");
            localStorage.removeItem("bookingData");
            window.scrollTo(0, 0);
        }, 3000);
    };

    return (
        <div className="pb-36 min-h-screen">

            {/* ===== Header ===== */}
            <PageHeader text="Review and Pay" />

            <div className="pt-14" />

            <div className="p-4 space-y-4">

                {/* ===== Gym Summary Card ===== */}
                <div className="bg-white rounded-xl border flex gap-1 min-h-[130px]">
                    <img
                        src={gym.images[0]}
                        alt={gym.name}
                        className="w-[85px] min-h-full rounded-tl-lg rounded-bl-lg object-cover"
                    />

                    <div className="flex-1 p-3">
                        <h2 className="font-semibold">{gym.name}</h2>

                        <div className="flex items-center text-xs text-gray-500 gap-1 mt-2">
                            <IoLocationOutline size={12} />
                            <span>0.8Km, Pallavaram</span>
                            <span>•</span>
                            <span>Open Till 10 PM</span>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-md">
                                Restroom
                            </span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-md">
                                Locker
                            </span>
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                            <p className="font-semibold">₹280/Hr</p>
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

                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                                <IoCalendarOutline size={14} />
                                <span>{formattedShortDate}</span>
                                <span>•</span>
                                <span>{selectedHours?.label}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                                <IoInformationCircleOutline size={14} />
                                <span>Enter anytime during the day</span>
                            </div>
                        </div>

                        <button
                            onClick={() =>
                                navigate(`/gyms/${gym.slug}`)
                            }
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
                            <span>9:00 AM – 10:00 PM</span>
                        </div>
                    </div>

                    <hr />

                    {/* Peak hours */}
                    <div>
                        <h4 className="font-medium">Peak hours</h4>

                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                            <IoPeopleOutline size={14} />
                            <span>6:00–9:00 AM · 7:00–8:00 PM</span>
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
                        <span>1.5 Hours x 1</span>
                        <span>Rs. {basePrice}</span>
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

            {/* ===== Info Strip ===== */}
            <div className="bg-blue-50 text-blue-700 text-sm px-4 py-3 font-medium text-center">
                Last entry for selected duration: {lastEntryTime}
            </div>

            {/* ===== Sticky Bottom Pay Bar ===== */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 flex justify-between items-center">
                <div>
                    <p className="text-xs text-[#475569] border-b border-[#475569] mb-2">
                        Valid on {formattedLongDate} till 11:59 PM
                    </p>

                    <p className="text-xl font-bold">
                        ₹{total}/{selectedHours?.label}
                    </p>
                </div>

                <button
                    onClick={handlePayment}
                    className="bg-blue-600 text-white px-6 py-3 w-[123px] rounded-md font-medium"
                >
                    Pay Now
                </button>
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
    );
}

// import { Navigate, useLocation, useNavigate } from "react-router-dom";
// import { gyms } from "../data/gyms";

// import {
//     IoLocationOutline,
//     IoCalendarOutline,
//     IoTimeOutline,
//     IoPeopleOutline,
//     IoInformationCircleOutline,
// } from "react-icons/io5";
// import { motion, AnimatePresence } from "framer-motion";
// import { useEffect, useState } from "react";
// import { FaCheckCircle } from "react-icons/fa";
// import PageHeader from "../components/PageHeader";
// import PaymentSuccess from "./PaymentSuccess";

// export default function ReviewPay() {
//     const navigate = useNavigate();
//     const location = useLocation();
//     const [showSuccess, setShowSuccess] = useState(false);
//     const [showSecondSuccess, setShowSecondSuccess] = useState(false);

//     // Hardcoded gym for now
//     const gym = gyms[0];

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
//         return <Navigate to={`/gyms/${gym.slug}`} replace />;
//     }

//     const { selectedDate, selectedHours } = initialState;

//     const basePrice = 410;
//     const platformFee = 12;
//     const gst = 3;
//     const total = basePrice + platformFee + gst;

//     // ===== Restore modal on refresh =====
//     useEffect(() => {
//         const stored = localStorage.getItem("paymentSuccess");

//         if (stored === "true") {
//             setShowSecondSuccess(true);
//         }
//     }, []);

//     // ===== Clear modal on route change =====
//     useEffect(() => {
//         return () => {
//             localStorage.removeItem("paymentSuccess");
//         };
//     }, [location.pathname]);

//     const convertTo24Hour = (time12h: string) => {
//         const [time, modifier] = time12h.split(" ");

//         let hours = parseInt(time, 10);

//         if (modifier === "PM" && hours !== 12) {
//             hours += 12;
//         }

//         if (modifier === "AM" && hours === 12) {
//             hours = 0;
//         }

//         return `${hours.toString().padStart(2, "0")}:00`;
//     };

//     const closingTime = convertTo24Hour(gym.closeTime);


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

//     const handlePayment = () => {

//         localStorage.setItem("paymentSuccess", "true");

//         // Show success modal
//         setShowSuccess(true);

//         setTimeout(() => {
//             // navigate("/payment/success");
//             setShowSecondSuccess(true);
//             localStorage.removeItem("bookingData");
//             window.scrollTo(0, 0);
//         }, 3000);
//     };

//     const handleClose = () => {
//         localStorage.removeItem("paymentSuccess");
//         setShowSecondSuccess(false);
//         // navigate("/");
//     };

//     return (
//         <div className="pb-36 min-h-screen">

//             {/* ===== Header ===== */}
//             <PageHeader text="Review and Pay" />

//             <div className="pt-14" />

//             <div className="p-4 space-y-4">

//                 {/* ===== Gym Summary Card ===== */}
//                 <div className="bg-white rounded-xl border flex gap-1 min-h-[130px]">
//                     <img
//                         src={gym.images[0]}
//                         alt={gym.name}
//                         className="w-[85px] min-h-full rounded-tl-lg rounded-bl-lg object-cover"
//                     />

//                     <div className="flex-1 p-3">
//                         <h2 className="font-semibold">{gym.name}</h2>

//                         <div className="flex items-center text-xs text-gray-500 gap-1 mt-2">
//                             <IoLocationOutline size={12} />
//                             <span>0.8Km, Pallavaram</span>
//                             <span>•</span>
//                             <span>Open Till 10 PM</span>
//                         </div>

//                         <div className="flex gap-2 mt-4">
//                             <span className="text-xs bg-gray-100 px-2 py-1 rounded-md">
//                                 Restroom
//                             </span>
//                             <span className="text-xs bg-gray-100 px-2 py-1 rounded-md">
//                                 Locker
//                             </span>
//                         </div>

//                         <div className="flex items-center gap-2 mt-4">
//                             <p className="font-semibold">₹280/Hr</p>
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

//                             <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
//                                 <IoCalendarOutline size={14} />
//                                 <span>{formattedShortDate}</span>
//                                 <span>•</span>
//                                 <span>{selectedHours?.label}</span>
//                             </div>

//                             <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
//                                 <IoInformationCircleOutline size={14} />
//                                 <span>Enter anytime during the day</span>
//                             </div>
//                         </div>

//                         <button
//                             onClick={() =>
//                                 navigate(`/gyms/${gym.slug}`)
//                             }
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
//                             <span>9:00 AM – 10:00 PM</span>
//                         </div>
//                     </div>

//                     <hr />

//                     {/* Peak hours */}
//                     <div>
//                         <h4 className="font-medium">Peak hours</h4>

//                         <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
//                             <IoPeopleOutline size={14} />
//                             <span>6:00–9:00 AM · 7:00–8:00 PM</span>
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
//                         <span>1.5 Hours x 1</span>
//                         <span>Rs. {basePrice}</span>
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
//             <div className="bg-blue-50 text-blue-700 text-sm px-4 py-3 font-medium text-center">
//                 Last entry for selected duration: {lastEntryTime}
//             </div>

//             {/* ===== Sticky Bottom Pay Bar ===== */}
//             <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 flex justify-between items-center">
//                 <div>
//                     <p className="text-xs text-[#475569] border-b border-[#475569] mb-2">
//                         Valid on {formattedLongDate} till 11:59 PM
//                     </p>

//                     <p className="text-xl font-bold">
//                         ₹{total}/{selectedHours?.label}
//                     </p>
//                 </div>

//                 <button
//                     onClick={handlePayment}
//                     className="bg-blue-600 text-white px-6 py-3 w-[123px] rounded-md font-medium"
//                 >
//                     Pay Now
//                 </button>
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

//             {/* Second Success Modal */}
//             {showSecondSuccess && (
//                 <PaymentSuccess onClose={handleClose} />
//             )}
//         </div>
//     );
// }
