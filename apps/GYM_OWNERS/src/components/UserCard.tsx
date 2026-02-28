import { FaRegClock, FaUserCircle } from "react-icons/fa";
import { HiOutlineCalendar } from "react-icons/hi2";
import type { Booking } from "../context/AppContext";

interface UserCardProps {
    booking: Booking;
    onClick?: () => void;
}

export default function UserCard({ booking, onClick }: UserCardProps) {
    const {
        client_name,
        client_image,
        display_status,
        duration_text,
        contextual_text,
        display_date,
        status,
    } = booking;

    // 🔥 STATUS MAPPING
    const isUpcoming = status === "PENDING";
    const isActive = status === "CONFIRMED";
    const isCancelled = status === "CANCELLED";

    let statusText = "";
    if (isActive) statusText = `${contextual_text}`;
    else if (isUpcoming) statusText = `${contextual_text}`;
    else if (isCancelled) statusText = "Session Cancelled";
    else statusText = "Session Ended";

    return (
        <div
            onClick={onClick}
            className="flex items-center gap-4 p-4 py-2 rounded-lg border border-[#E2E8F0] bg-white w-full cursor-pointer"
        >
            {/* Avatar */}
            <div className="w-12 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
                {client_image ? (
                    <img
                        src={client_image}
                        alt={client_name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <FaUserCircle className="text-gray-400 text-7xl" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-1">
                {/* Name + Status */}
                <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 text-nowrap">
                        {client_name}
                    </p>

                    <span
                        className={`text-xs px-3 py-1.5 rounded-full font-medium ${isActive
                                ? "bg-[#22C55E] text-white"
                                : isUpcoming
                                    ? "bg-[#FACC15] text-white"
                                    : isCancelled
                                        ? "bg-[#FDECEA] text-[#F43F5E]"
                                        : "bg-gray-200 text-gray-600"
                            }`}
                    >
                        {display_status}
                    </span>
                </div>

                {/* Date */}
                <p className="text-sm text-gray-500 mt-1">
                    <HiOutlineCalendar className="inline mr-1" />
                    {display_date}
                </p>

                {/* Duration */}
                <p className="text-[13px] text-gray-500">
                    <FaRegClock className="inline mr-1" />
                    {duration_text}
                </p>

                {/* Context */}
                <p className="text-[13px] text-gray-500 mt-1">
                    {statusText}
                </p>
            </div>
        </div>
    );
}