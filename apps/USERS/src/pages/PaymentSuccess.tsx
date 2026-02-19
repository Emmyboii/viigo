import { motion, useAnimation } from "framer-motion";
import {
    FiMapPin,
    FiClock,
} from "react-icons/fi";
import { HiShare } from "react-icons/hi";

import gym1 from "../assets/gymImg.png";
import three from "../assets/three.png";
import halfCircle from "../assets/paymentWhiteImg.png";
import { FaCheckCircle } from "react-icons/fa";
import { GrRestroom } from "react-icons/gr";
import { BiSolidCalendarAlt } from "react-icons/bi";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function PaymentSuccess({ Loading }: { Loading: boolean }) {

    const navigate = useNavigate();
    const controls = useAnimation();

    useEffect(() => {
        if (!Loading) {
            controls.start({
                scale: 1,
                rotate: 0,
                opacity: 1,
                transition: {
                    type: "spring",
                    stiffness: 20,
                    damping: 11,
                    mass: 1.2,
                },
            });
        }
    }, [Loading, controls]);

    return (
        <div className="min-h-screen bg-gray-50 pb-28 overflow-x-hidden">

            {/* Top Success Section */}
            <div className="flex flex-col items-center pt-10 pb-6">
                <FaCheckCircle className="text-green-500 text-[65px]" />

                <h1 className="mt-4 text-xl font-semibold">
                    Payment Successful
                </h1>
                <p className="text-gray-500 text-sm">
                    Booked through UPI : hari@okicici
                </p>
            </div>

            {/* 🎯 Animated Blue Card */}
            <motion.div
                initial={{ scale: 0.2, rotate: -180, opacity: 0 }}
                animate={controls}
                className="relative mx-3 bg-gradient-to-b from-blue-600 to-blue-500 text-white rounded-2xl p-4 shadow-xl"
            >

                <img src={halfCircle} alt="Half Circle" className="absolute bottom-32 left-[-13px] w-[48px] h-[55px]" />
                <img src={halfCircle} alt="Half Circle" className="absolute bottom-32 right-[-13px] rotate-180 w-[48px] h-[55px]" />

                {/* Gym Header */}
                <div className="flex gap-3">
                    <img
                        src={gym1}
                        alt=""
                        className="w-[110px] h-[110px] rounded object-cover"
                    />

                    <div className="flex-1">
                        <h2 className="font-semibold text-lg">
                            Fight To Fitness
                        </h2>

                        <div className="flex items-center gap-2 text-sm text-[#CBD5E1]">
                            Pallavaram, Chennai
                        </div>

                        <div className="flex items-center gap-1 text-sm opacity-90">
                            <FiMapPin size={14} />
                            0.8Km <span className="pl-2">Open Till 11 PM</span>
                        </div>

                        <div className="flex gap-2 mt-2">
                            <span className="bg-white flex items-center gap-1 text-[#2563EB] px-2 font-medium py-1.5 rounded-full text-xs">
                                <GrRestroom className="size-4" />
                                Restroom
                            </span>
                            <span className="bg-white text-[#2563EB] px-2 font-medium py-1.5 rounded-full text-xs">
                                + More
                            </span>
                        </div>
                    </div>
                </div>

                {/* Details Row */}
                <div className="grid grid-cols-3 justify-between mt-6 text-sm border-b border-white/30 py-4">
                    <div>
                        <p className="text-[#DBEAFE]">Guest Name</p>
                        <p>Harish</p>
                    </div>
                    <div className="border-l border-[#FFFFFF33] pl-2">
                        <p className="text-[#DBEAFE]">Hours</p>
                        <p>1.5 Hrs</p>
                    </div>
                    <div className="border-l border-[#FFFFFF33] pl-2">
                        <p className="text-[#DBEAFE]">Date</p>
                        <p>5th December</p>
                    </div>
                </div>

                {/* OTP Section */}
                <div className="text-center mt-6">
                    <p className="text-[48px] font-semibold">OTP : 1384</p>
                    <p className="text-xs mt-2 max-w-[261px] mx-auto">
                        Use it at check-in. Valid 10 minutes before your session start time.
                    </p>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-white/40 my-6" />

                {/* Timings */}
                <div className="space-y-3 text-sm">
                    <div className="flex items-center text-[#DBEAFE] justify-center gap-2">
                        <FiClock size={24} />
                        Gym timings : 9 AM – 10 PM
                    </div>

                    <div className="flex items-center gap-2">
                        <img src={three} alt="Three" className="mt-1 w-6" />
                        <div>
                            Peak hours : 6–9 AM , 10–11 AM
                            <p className="text-[11px] text-[#BFDBFE]">
                                (Workouts during peak hours may use more minutes)
                            </p>
                        </div>
                    </div>

                    <p className="text-xs text-[#BFDBFE] text-center pt-2">
                        Last entry for selected duration : 8:30 PM
                    </p>
                </div>
            </motion.div>

            {/* Change of Plans */}
            <div className="mx-4 mt-6 bg-[#F1F5F9] rounded-lg p-4">
                <div className="flex gap-3 items-center">
                    <h3 className="font-semibold text-sm">Change of Plans</h3>
                    <button onClick={() => navigate('/cancelbookings')} className="text-[#F43F5E] font-medium text-sm border border-[#F43F5E] px-3 py-1 rounded-md">
                        Cancel Booking
                    </button>
                </div>

                <p className="text-xs text-[#0F172A] mt-3">
                    Cancel anytime before 12am during the day to get a refund.
                    After 12am bookings will be cancelled automatically without refund.
                </p>
            </div>

            {/* Price Details */}
            <div className="mx-4 mt-6 text-sm space-y-2">
                <p className="text-sm">Price Details</p>
                <div className="flex justify-between">
                    <span className="text-[#6A6A6A]">1.5 Hours x 1</span>
                    <span>Rs. 400</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-[#6A6A6A]">Platform Fee</span>
                    <span>Rs. 10</span>
                </div>
                <div className="flex justify-between pt-3">
                    <span>Total Paid Amount</span>
                    <span>Rs. 410</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mx-4 mt-6 flex gap-2">
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
                <button onClick={() => navigate('/')} className="text-blue-600">
                    Go To Home
                </button>

                <button onClick={() => navigate('/bookings')} className="bg-blue-600 text-white py-3 rounded-md w-[209px]">
                    View Bookings
                </button>
            </div>
        </div>
    );
}

// import { motion, useAnimation } from "framer-motion";
// import {
//     FiMapPin,
//     FiClock,
// } from "react-icons/fi";
// import { HiShare } from "react-icons/hi";

// import gym1 from "../assets/gymImg.png";
// import three from "../assets/three.png";
// import halfCircle from "../assets/paymentWhiteImg.png";
// import { FaCheckCircle } from "react-icons/fa";
// import { GrRestroom } from "react-icons/gr";
// import { BiSolidCalendarAlt } from "react-icons/bi";
// import { useEffect } from "react";
// import { useNavigate } from "react-router";

// type PaymentSuccessProps = {
//     Loading?: boolean;
//     onClose: () => void;
// };

// export default function PaymentSuccess({ Loading = false, onClose }: PaymentSuccessProps) {

//     const navigate = useNavigate();
//     const controls = useAnimation();

//     useEffect(() => {
//         if (!Loading) {
//             controls.start({
//                 scale: 1,
//                 rotate: 0,
//                 opacity: 1,
//                 transition: {
//                     type: "spring",
//                     stiffness: 20,
//                     damping: 11,
//                     mass: 1.2,
//                 },
//             });
//         }
//     }, [Loading, controls]);

//     return (
//         <div className="min-h-screen bg-gray-50 pb-28 overflow-x-hidden">

//             {/* Top Success Section */}
//             <div className="flex flex-col items-center pt-10 pb-6">
//                 <FaCheckCircle className="text-green-500 text-[65px]" />

//                 <h1 className="mt-4 text-xl font-semibold">
//                     Payment Successful
//                 </h1>
//                 <p className="text-gray-500 text-sm">
//                     Booked through UPI : hari@okicici
//                 </p>
//             </div>

//             {/* 🎯 Animated Blue Card */}
//             <motion.div
//                 initial={{ scale: 0.2, rotate: -180, opacity: 0 }}
//                 animate={controls}
//                 className="relative mx-3 bg-gradient-to-b from-blue-600 to-blue-500 text-white rounded-2xl p-4 shadow-xl"
//             >

//                 <img src={halfCircle} alt="Half Circle" className="absolute bottom-32 left-[-13px] w-[48px] h-[55px]" />
//                 <img src={halfCircle} alt="Half Circle" className="absolute bottom-32 right-[-13px] rotate-180 w-[48px] h-[55px]" />

//                 {/* Gym Header */}
//                 <div className="flex gap-3">
//                     <img
//                         src={gym1}
//                         alt=""
//                         className="w-[110px] h-[110px] rounded object-cover"
//                     />

//                     <div className="flex-1">
//                         <h2 className="font-semibold text-lg">
//                             Fight To Fitness
//                         </h2>

//                         <div className="flex items-center gap-2 text-sm text-[#CBD5E1]">
//                             Pallavaram, Chennai
//                         </div>

//                         <div className="flex items-center gap-1 text-sm opacity-90">
//                             <FiMapPin size={14} />
//                             0.8Km <span className="pl-2">Open Till 11 PM</span>
//                         </div>

//                         <div className="flex gap-2 mt-2">
//                             <span className="bg-white flex items-center gap-1 text-[#2563EB] px-2 font-medium py-1.5 rounded-full text-xs">
//                                 <GrRestroom className="size-4" />
//                                 Restroom
//                             </span>
//                             <span className="bg-white text-[#2563EB] px-2 font-medium py-1.5 rounded-full text-xs">
//                                 + More
//                             </span>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Details Row */}
//                 <div className="grid grid-cols-3 justify-between mt-6 text-sm border-b border-white/30 py-4">
//                     <div>
//                         <p className="text-[#DBEAFE]">Guest Name</p>
//                         <p>Harish</p>
//                     </div>
//                     <div className="border-l border-[#FFFFFF33] pl-2">
//                         <p className="text-[#DBEAFE]">Hours</p>
//                         <p>1.5 Hrs</p>
//                     </div>
//                     <div className="border-l border-[#FFFFFF33] pl-2">
//                         <p className="text-[#DBEAFE]">Date</p>
//                         <p>5th December</p>
//                     </div>
//                 </div>

//                 {/* OTP Section */}
//                 <div className="text-center mt-6">
//                     <p className="text-[48px] font-semibold">OTP : 1384</p>
//                     <p className="text-xs mt-2 max-w-[261px] mx-auto">
//                         Use it at check-in. Valid 10 minutes before your session start time.
//                     </p>
//                 </div>

//                 {/* Divider */}
//                 <div className="border-t border-dashed border-white/40 my-6" />

//                 {/* Timings */}
//                 <div className="space-y-3 text-sm">
//                     <div className="flex items-center text-[#DBEAFE] justify-center gap-2">
//                         <FiClock size={24} />
//                         Gym timings : 9 AM – 10 PM
//                     </div>

//                     <div className="flex items-center gap-2">
//                         <img src={three} alt="Three" className="mt-1 w-6" />
//                         <div>
//                             Peak hours : 6–9 AM , 10–11 AM
//                             <p className="text-[11px] text-[#BFDBFE]">
//                                 (Workouts during peak hours may use more minutes)
//                             </p>
//                         </div>
//                     </div>

//                     <p className="text-xs text-[#BFDBFE] text-center pt-2">
//                         Last entry for selected duration : 8:30 PM
//                     </p>
//                 </div>
//             </motion.div>

//             {/* Change of Plans */}
//             <div className="mx-4 mt-6 bg-[#F1F5F9] rounded-lg p-4">
//                 <div className="flex gap-3 items-center">
//                     <h3 className="font-semibold text-sm">Change of Plans</h3>
//                     <button className="text-[#F43F5E] font-medium text-sm border border-[#F43F5E] px-3 py-1 rounded-md">
//                         Cancel Booking
//                     </button>
//                 </div>

//                 <p className="text-xs text-[#0F172A] mt-3">
//                     Cancel anytime before 12am during the day to get a refund.
//                     After 12am bookings will be cancelled automatically without refund.
//                 </p>
//             </div>

//             {/* Price Details */}
//             <div className="mx-4 mt-6 text-sm space-y-2">
//                 <p className="text-sm">Price Details</p>
//                 <div className="flex justify-between">
//                     <span className="text-[#6A6A6A]">1.5 Hours x 1</span>
//                     <span>Rs. 400</span>
//                 </div>
//                 <div className="flex justify-between">
//                     <span className="text-[#6A6A6A]">Platform Fee</span>
//                     <span>Rs. 10</span>
//                 </div>
//                 <div className="flex justify-between pt-3">
//                     <span>Total Paid Amount</span>
//                     <span>Rs. 410</span>
//                 </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="mx-4 mt-6 flex gap-2">
//                 <button className="flex-1 bg-blue-100 text-[#2563EB] py-2 px-2 rounded-full text-xs flex items-center justify-center gap-2">
//                     <BiSolidCalendarAlt size={16} />
//                     Add To Calendar
//                 </button>

//                 <button className="flex-1 bg-blue-100 text-[#2563EB] py-2 px-2 rounded-full text-xs flex items-center justify-center gap-2">
//                     <HiShare size={16} />
//                     Share Pass
//                 </button>
//             </div>

//             {/* Bottom Buttons */}
//             <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-[#F1F5F9] flex gap-4 items-center justify-center">
//                 <button onClick={() => {
//                     onClose();
//                     navigate('/')
//                 }}
//                     className="text-blue-600"
//                 >
//                     Go To Home
//                 </button>

//                 <button onClick={() => {
//                     onClose();
//                     navigate('/bookings')
//                 }}
//                     className="bg-blue-600 text-white py-3 rounded-md w-[209px]"
//                 >
//                     View Bookings
//                 </button>
//             </div>
//         </div>
//     );
// }
