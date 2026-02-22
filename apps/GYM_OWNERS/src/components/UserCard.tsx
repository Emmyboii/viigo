import { FaRegClock, FaUserCircle } from "react-icons/fa";
import { HiOutlineCalendar } from "react-icons/hi2";

interface UserCardProps {
    name: string;
    status?: "active" | "upcoming" | "completed" | "cancelled" | "inactive";
    date: string;
    duration: string;
    remainingTime: string;
    image?: string;
    onClick?: () => void;
}

export default function UserCard({
    name,
    status = "active",
    date,
    duration,
    remainingTime,
    image,
    onClick,
}: UserCardProps) {
    const isActive = status === "active";
    const isUpcoming = status === "upcoming";
    const isCompleted = status === "completed";
    const isCancelled = status === "cancelled";

    let statusText = "";
    if (isActive) statusText = `Remaining time left ${remainingTime}`;
    else if (isUpcoming) statusText = `Last Entry is at ${remainingTime}`;
    else if (isCompleted || isCancelled) statusText = "Session Ended";

    return (
        <div onClick={onClick} className="flex items-center gap-4 p-4 py-2 rounded-lg border border-[#E2E8F0] bg-white w-full cursor-pointer">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
                {image ? (
                    <img
                        src={image}
                        alt={name}
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
                    <p className="font-semibold text-gray-900">{name}</p>

                    <span
                        className={`text-xs px-3 py-1.5 rounded-full font-medium ${isActive
                            ? "bg-[#22C55E] text-white"
                            : isUpcoming ? "bg-[#FACC15] text-white"
                                : isCompleted ? "bg-[#CBD5E1] text-white"
                                    : isCancelled ? "bg-[#FDECEA] text-[#F43F5E]"
                                        : "bg-gray-200 text-gray-600"
                            }`}
                    >
                        {isActive ? "Active" : isUpcoming ? "Upcoming" : isCompleted ? "Completed" : isCancelled ? "Cancelled" : "Unknown"}
                    </span>
                </div>

                {/* Date */}
                <p className="text-sm text-gray-500 mt-1"><HiOutlineCalendar className="inline mr-1" /> {date}</p>

                {/* Duration */}
                <p className="text-sm text-gray-500"><FaRegClock className="inline mr-1" />Duration: {duration} • Flexible Entry</p>

                {/* Remaining Time */}
                <p className="text-sm text-gray-500 mt-1">{statusText}</p>
            </div>
        </div>
    );
}