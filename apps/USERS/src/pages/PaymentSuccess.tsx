import { motion } from "framer-motion";
import {
    FiMapPin,
    FiClock,
    FiUsers,
    FiCalendar,
    FiShare2,
} from "react-icons/fi";

import gym1 from "../assets/gymImg.png";
import { FaCheckCircle } from "react-icons/fa";

export default function PaymentSuccess() {
    return (
        <div className="min-h-screen bg-gray-50 pb-28">

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
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 12,
                }}
                className="mx-4 bg-gradient-to-b from-blue-600 to-blue-500 text-white rounded-3xl p-5 shadow-xl"
            >
                {/* Gym Header */}
                <div className="flex gap-3">
                    <img
                        src={gym1}
                        alt=""
                        className="w-20 h-20 rounded-xl object-cover"
                    />

                    <div className="flex-1">
                        <h2 className="font-semibold text-lg">
                            Fight To Fitness
                        </h2>

                        <div className="flex items-center gap-2 text-sm opacity-90">
                            <FiMapPin size={14} />
                            Pallavaram, Chennai
                        </div>

                        <div className="flex items-center gap-2 text-sm opacity-90">
                            <FiClock size={14} />
                            0.8Km · Open Till 11 PM
                        </div>

                        <div className="flex gap-2 mt-2">
                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs">
                                Restroom
                            </span>
                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs">
                                + More
                            </span>
                        </div>
                    </div>
                </div>

                {/* Details Row */}
                <div className="flex justify-between mt-6 text-sm border-t border-white/30 pt-4">
                    <div>
                        <p className="opacity-80">Guest Name</p>
                        <p className="font-medium">Harish</p>
                    </div>
                    <div>
                        <p className="opacity-80">Hours</p>
                        <p className="font-medium">1.5 Hrs</p>
                    </div>
                    <div>
                        <p className="opacity-80">Date</p>
                        <p className="font-medium">5th December</p>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-white/40 my-6" />

                {/* OTP Section */}
                <div className="text-center">
                    <p className="text-sm opacity-80">OTP</p>
                    <h1 className="text-4xl font-bold tracking-widest mt-2">
                        1384
                    </h1>
                    <p className="text-xs mt-2 opacity-80">
                        Use it at check-in. Valid 10 minutes before your session start time.
                    </p>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-white/40 my-6" />

                {/* Timings */}
                <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                        <FiClock size={16} />
                        Gym timings : 9 AM – 10 PM
                    </div>

                    <div className="flex items-start gap-2">
                        <FiUsers size={16} className="mt-1" />
                        <div>
                            Peak hours : 6–9 AM , 10–11 AM , 7–8 PM
                            <p className="text-xs opacity-80">
                                (Workouts during peak hours may use more minutes)
                            </p>
                        </div>
                    </div>

                    <p className="text-xs opacity-80">
                        Last entry for selected duration : 8:30 PM
                    </p>
                </div>
            </motion.div>

            {/* Change of Plans */}
            <div className="mx-4 mt-6 bg-gray-100 rounded-2xl p-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-medium">Change of Plans</h3>
                    <button className="text-red-500 text-sm border border-red-400 px-3 py-1 rounded-lg">
                        Cancel Booking
                    </button>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                    Cancel anytime before 12am during the day to get a refund.
                    After 12am bookings will be cancelled automatically without refund.
                </p>
            </div>

            {/* Price Details */}
            <div className="mx-4 mt-6 text-sm space-y-2">
                <div className="flex justify-between">
                    <span>1.5 Hours x 1</span>
                    <span>Rs. 400</span>
                </div>
                <div className="flex justify-between">
                    <span>Platform Fee</span>
                    <span>Rs. 10</span>
                </div>
                <div className="flex justify-between font-semibold mt-3">
                    <span>Total Paid Amount</span>
                    <span>Rs. 410</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mx-4 mt-6 flex gap-4">
                <button className="flex-1 bg-blue-100 text-blue-600 py-3 rounded-xl flex items-center justify-center gap-2">
                    <FiCalendar size={16} />
                    Add To Calendar
                </button>

                <button className="flex-1 bg-blue-100 text-blue-600 py-3 rounded-xl flex items-center justify-center gap-2">
                    <FiShare2 size={16} />
                    Share Pass
                </button>
            </div>

            {/* Bottom Buttons */}
            <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t flex gap-4">
                <button className="flex-1 text-blue-600">
                    Go To Home
                </button>

                <button className="flex-1 bg-blue-600 text-white py-3 rounded-xl">
                    View Bookings
                </button>
            </div>
        </div>
    );
}
