import { useNavigate } from "react-router-dom";
import { gyms } from "../data/gyms";

import {
    IoArrowBack,
    IoLocationOutline,
    IoCalendarOutline,
    IoTimeOutline,
    IoPeopleOutline,
    IoInformationCircleOutline,
} from "react-icons/io5";
import { HiShare } from "react-icons/hi";

export default function ReviewPay() {
    const navigate = useNavigate();

    // For now hardcoded selected gym
    const gym = gyms[0];

    const basePrice = 410;
    const platformFee = 12;
    const gst = 3;
    const total = basePrice + platformFee + gst;

    return (
        <div className="pb-36 bg-gray-50 min-h-screen">

            {/* ===== Header ===== */}
            <div className="fixed top-0 left-0 right-0 z-40 bg-white flex items-center justify-between px-4 py-3 shadow-sm">
                <button
                    onClick={() => navigate(-1)}
                    aria-label="Go back"
                >
                    <IoArrowBack size={20} />
                </button>

                <span className="font-medium">Review and Pay</span>

                <button aria-label="Share">
                    <HiShare className="text-[#475569]" size={20} />
                </button>
            </div>

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
                                <span>05 Dec</span>
                                <span>•</span>
                                <span>1.5 hrs</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                                <IoInformationCircleOutline size={14} />
                                <span>Enter anytime during the day</span>
                            </div>
                        </div>

                        <button className="text-sm text-[#2563EB] bg-[#DBEAFE] px-3 py-1 font-medium rounded-md">
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
                Last entry for selected duration: 8:30 PM
            </div>

            {/* ===== Sticky Bottom Pay Bar ===== */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 flex justify-between items-center">
                <div>
                    <p className="text-xs text-gray-500">
                        Valid on 5th December till 11:59 PM
                    </p>
                    <p className="text-xl font-bold">
                        ₹{total}/1.5Hrs
                    </p>
                </div>

                <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium">
                    Pay Now
                </button>
            </div>
        </div>
    );
}
