import { FaRegClock, FaUserCircle } from "react-icons/fa";
import { HiOutlineCalendar } from "react-icons/hi2";
import type { Booking } from "../context/AppContext";
import Countdown from "./Countdown";

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
        slot_type,
        contextual_text,
        display_date,
        status,
    } = booking;

    // 🔥 STATUS MAPPING — order matters!
    const isActive = status === "ACTIVE";
    const isCancelled = display_status === "Cancelled" || status === "CANCELLED";
    const isUpcoming = !isCancelled && (display_status === "Upcoming" || status === "CONFIRMED");
    const isCompleted = status === "COMPLETED" || display_status === "Completed";

    let statusText = "";
    if (isActive) statusText = `${contextual_text}`;
    else if (isUpcoming) statusText = `${contextual_text}`;
    else if (isCancelled) statusText = `${contextual_text}`;
    else statusText = "Session Ended";

    return (
        <div
            onClick={onClick}
            className="flex items-center gap-4 p-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white w-full cursor-pointer"
        >
            {/* Avatar */}
            <div className="w-[66px] h-[66px] flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
                {client_image ? (
                    <img
                        src={`https://api.viigo.in/${client_image}`}
                        alt={client_name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <FaUserCircle className="text-gray-400 text-7xl" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1 mk:flex items-center justify-between">
                <div>
                    {/* Name + Status */}
                    <div className="flex items-center gap-3 min-w-0">
                        <p className="font-semibold text-[#0F172A] text-sm truncate">
                            {client_name}
                        </p>

                        <span
                            className={`text-xs px-3 py-1.5 rounded-full font-medium ${isActive
                                ? "bg-[#22C55E] text-white"
                                : isUpcoming
                                    ? "bg-[#FACC15] text-white"
                                    : isCancelled
                                        ? "bg-[#FDECEA] text-[#F43F5E]"
                                        : isCompleted
                                            ? "bg-[#CBD5E1] text-[#ffffff]"
                                            : "bg-[#CBD5E1] text-[#FFFFFF]"
                                }`}
                        >
                            {display_status}
                        </span>
                    </div>

                    <div className="mk:flex items-center flex-wrap gap-1 mk:mt-1 mt-0">
                        {/* Date */}
                        <p className="text-xs text-[#475569] mk:mt-0 mt-1 flex items-center gap-1">
                            <HiOutlineCalendar className="inline mr-" />
                            {display_date}
                        </p>

                        {/* Duration */}
                        <p className="text-[12px] text-[#475569] flex items-center flex-wrap gap-1">
                            <FaRegClock className="" />
                            {duration_text}
                            {slot_type && (
                                <span className={`text-xs font-medium ${slot_type === 'NON_PEAK' ? 'text-[#22C55E]' : 'text-[#D32F2F]'
                                    }`}>
                                    {slot_type === 'NON_PEAK' ? '• Non-peak Hour' : slot_type === 'MORNING_PEAK'? '• Morning Peak Hour' : '• Evening Peak Hour'}
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Context */}
                <p className="text-[12px] mk:text-lg mk:font-semibold mk:text-right text-[#475569] font-medium mt-1">
                    {isActive && (
                        <>
                            Remaining time left <Countdown initialText={booking.contextual_text} />
                        </>
                    )}
                    {!isActive && statusText}
                </p>
            </div>
        </div>
    );
}
