import { useState, useMemo } from "react";
import { FiClock, FiUsers } from "react-icons/fi";
import BottomSheet from "./BottomSheet";
import { useNavigate } from "react-router";

interface Props {
    total?: number;
    open: boolean;
    onClose: () => void;
    defaultDate?: Date;
    defaultHours?: {
        index: number;
        value: number;
        label: string;
    };
}

const gymOpenHour = 9;  // 9 AM
const gymCloseHour = 22; // 10 PM (24hr format)

const formatTo12Hour = (hour: number) => {
    const suffix = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour} ${suffix}`;
};

const hoursOptions = [
    { label: "1 Hr", value: 1 },
    { label: "1.5 Hrs", value: 1.5 },
    { label: "2 Hrs", value: 2 },
    { label: "2.5 Hrs", value: 2.5 },
    { label: "3 Hrs", value: 3 },
];

export default function PickHoursSheet({ total, open, onClose, defaultDate, defaultHours }: Props) {
    const navigate = useNavigate();

    const [selectedDate, setSelectedDate] = useState<Date | null>(
        defaultDate ?? null
    );

    const [selectedHours, setSelectedHours] = useState(
        defaultHours ?? null
    );

    const [error, setError] = useState({ type: "", message: "" });

    // ✅ 1️⃣ Generate Live Dates (Next 7 Days)
    const dates = useMemo(() => {
        const today = new Date();

        return Array.from({ length: 7 }).map((_, index) => {
            const date = new Date();
            date.setDate(today.getDate() + index);

            return {
                day: index === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" }),
                date: date.getDate().toString().padStart(2, "0"),
                month: date.toLocaleDateString("en-US", { month: "short" }),
                fullDate: date,
            };
        });
    }, []);

    // ✅ 3️⃣ Check if duration exceeds closing time
    const isDurationInvalid = (duration: number) => {
        if (selectedDate === null) return false;

        const now = new Date();

        // Only restrict if booking is today
        if (
            selectedDate.toDateString() === now.toDateString()
        ) {
            const currentHour = now.getHours();
            const endHour = currentHour + duration;

            return endHour > gymCloseHour;
        }

        return false;
    };

    const handleApply = () => {
        if (selectedDate === null && !selectedHours) {
            setError({ type: "general", message: "Please select a workout date and duration to continue." });
            return;
        }

        if (selectedDate === null) {
            setError({ type: "date", message: "Please select a workout date to continue." });
            return;
        }

        if (!selectedHours) {
            setError({ type: "hours", message: "Please select a workout duration to continue." });
            return;
        }

        // ✅ Save booking data to localStorage
        const bookingData = {
            selectedDate,
            selectedHours,
            reopenSheet: true
        };
        localStorage.setItem("bookingData", JSON.stringify(bookingData));

        setError({ type: "", message: "" });

        navigate("/reviewpay");

        window.scrollTo(0, 0);
    };

    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            title="Pick Your Hours"
            footer={
                <div>

                    {error.type === 'general' && (
                        <p className="text-red-500 text-sm mb-2">{error.message}</p>
                    )}
                    <div className="flex items-center justify-between">
                        <p className="font-semibold text-2xl">
                            ₹{total || 425}{selectedHours?.label ? `/${selectedHours.label}` : ""}
                        </p>

                        <button
                            onClick={handleApply}
                            className="bg-blue-600 w-[163px] text-white px-6 py-3 rounded-md font-medium"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            }
        >
            {/* Date Selector */}
            <div className="flex gap-3 overflow-x-auto pb-2">
                {dates.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => {
                            // Store the actual date object (or string)
                            setSelectedDate(item.fullDate);
                            setError({ type: "", message: "" });
                        }}
                        className={`min-w-[70px] text-center p-1.5 py-2 font-medium rounded-md space-y-2 border cursor-pointer transition ${selectedDate &&
                            selectedDate.toDateString() === item.fullDate.toDateString()
                            ? "bg-[#DBEAFE] border-[#2563EB] text-[#2563EB]"
                            : "border-[#DBEAFE] text-[#0F172A]"
                            }`}
                    >
                        <p className="text-xs">{item.day}</p>
                        <p className="font-semibold text-lg">{item.date}</p>
                        <p className="text-xs">{item.month}</p>
                    </div>
                ))}

            </div>
            {error.type === 'date' && (
                <p className="text-red-500 text-sm mt-2">{error.message}</p>
            )}

            {/* Hours Selection */}
            <div className="mt-6">
                <h4 className="font-medium mb-3">
                    How many hours do you want to workout
                </h4>

                <div className="flex flex-wrap gap-2">
                    {hoursOptions.map((hour, index) => {
                        const disabled = isDurationInvalid(hour.value);

                        return (
                            <button
                                key={index}
                                disabled={disabled}
                                onClick={() => {
                                    if (disabled) return;

                                    setSelectedHours({
                                        index,
                                        value: hour.value,
                                        label: hour.label,
                                    });
                                    setError({ type: "", message: "" });
                                }}
                                className={`px-2.5 py-1.5 rounded-md text-sm font-medium border transition ${disabled
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                                    : selectedHours?.index === index
                                        ? "bg-[#DBEAFE] border-[#2563EB] text-[#2563EB]"
                                        : "border-[#DBEAFE] text-[#0F172A]"
                                    }`}
                            >
                                {hour.label}
                            </button>
                        );
                    })}
                </div>

                {error.type === 'hours' && (
                    <p className="text-red-500 text-sm mt-2">{error.message}</p>
                )}
            </div>

            {/* Info Card */}
            <div className="mt-6 bg-[#F1F5F9] border border-[#DBEAFE] py-2.5 px-[17px] rounded-lg space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                    <FiClock size={16} />
                    <span>
                        <strong>Gym Timings :</strong> {formatTo12Hour(gymOpenHour)} - {formatTo12Hour(gymCloseHour)}
                    </span>
                </div>

                <div className="flex items-start gap-2 text-gray-600">
                    <FiUsers size={16} className="mt-1" />
                    <div>
                        <p>
                            <strong>Peak Hours :</strong> 6AM-9AM , 10AM-11AM
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            (Workouts during peak hours may use more minutes)
                        </p>
                    </div>
                </div>
            </div>
        </BottomSheet>
    );
}
