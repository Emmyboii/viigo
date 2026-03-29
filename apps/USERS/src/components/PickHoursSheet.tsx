import { useState, useMemo } from "react";
import { FiUsers } from "react-icons/fi";
import BottomSheet from "./BottomSheet";
import type { GymCard } from "../context/AppContext";

interface Props {
    total?: number;
    open: boolean;
    onClose: () => void;
    defaultDate?: Date;
    defaultHours?: {
        index: number;
        value: number;
        label: string;
    },
    gym: GymCard
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const hoursOptions = [
    { label: "1 Hr", value: 1 },
    { label: "1.5 Hrs", value: 1.5 },
    { label: "2 Hrs", value: 2 },
    { label: "2.5 Hrs", value: 2.5 },
    { label: "3 Hrs", value: 3 },
];

export default function PickHoursSheet({ open, onClose, defaultDate, defaultHours, gym, setOpen }: Props) {
    // const navigate = useNavigate();

    const [selectedDate, setSelectedDate] = useState<Date | null>(
        defaultDate ?? new Date()
    );

    const [selectedHours, setSelectedHours] = useState(
        defaultHours ?? {
            index: 0,
            value: 1,
            label: "1 Hr",
        }
    );

    const id = gym.id

    const editSelectedHr = selectedHours.value === 1 ? "Hr" : selectedHours.label

    const totalWithHr = selectedHours
        ? gym.hourly_rate * selectedHours.value
        : gym.hourly_rate;

    const [error, setError] = useState({ type: "", message: "" });

    // ✅ 1️⃣ Generate Live Dates (Next 7 Days)
    const dates = useMemo(() => {
        const today = new Date();

        return Array.from({ length: 90 }).map((_, index) => {
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

            const closeTimeHour = gym?.close_time ? parseInt(gym.close_time.split(":")[0], 10) : 24;
            return endHour > closeTimeHour;
        }

        return false;
    };

    const allHoursDisabled = hoursOptions.every((hour) =>
        isDurationInvalid(hour.value)
    );

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
            id
            // reopenSheet: true
        };
        localStorage.setItem("bookingData", JSON.stringify(bookingData));

        setError({ type: "", message: "" });


        setOpen(false)

        window.scrollTo(0, 0);
    };

    function formatTime12Hour(time24: string | undefined) {
        const [hourStr, minuteStr] = time24?.split(":") || [];
        let hour = Number(hourStr);
        const minute = minuteStr;
        const ampm = hour >= 12 ? "PM" : "AM";

        hour = hour % 12;
        if (hour === 0) hour = 12;

        return `${hour}:${minute} ${ampm}`;
    }

    function normalizePeak(p: [string, string] | { start: string, end: string } | any): [string, string] {
        if (Array.isArray(p) && p.length === 2) return [p[0], p[1]];
        if (p?.start && p?.end) return [p.start, p.end];
        return ["00:00", "00:00"];
    }

    // Ensure peak_morning and peak_evening are arrays
    const morningPeaks = Array.isArray(gym?.peak_morning)
        ? gym.peak_morning
        : gym?.peak_morning ? [gym.peak_morning] : [];

    const eveningPeaks = Array.isArray(gym?.peak_evening)
        ? gym.peak_evening
        : gym?.peak_evening ? [gym.peak_evening] : [];

    const allPeaks: [string, string][] = [
        ...morningPeaks.map(normalizePeak),
        ...eveningPeaks.map(normalizePeak),
    ];

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
                        {/* <p className="font-semibold text-2xl">
                            ₹{total || 425}{selectedHours?.label ? `/${selectedHours.label}` : ""}
                        </p> */}

                        <div className="space-y-2">
                            <p className="text-xs text-[#475569]">
                                Gym timings : {formatTime12Hour(gym.open_time)} - {formatTime12Hour(gym.close_time)}
                            </p>

                            <p className="text-xl font-bold">
                                ₹{totalWithHr}{selectedHours?.label ? `/${editSelectedHr}` : ""}
                            </p>
                        </div>

                        <button
                            disabled={allHoursDisabled}
                            onClick={handleApply}
                            className={`w-[163px] text-white px-6 py-3 rounded-md font-medium ${allHoursDisabled ? "bg-[#a6a7a8] cursor-not-allowed" : "bg-blue-600 cursor-pointer"}`}
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

                <div className="flex items-start gap-2 text-gray-600">
                    <FiUsers size={16} className="mt-1" />
                    <div>
                        <div>
                            <strong>Peak Hours :</strong>

                            <div className="flex gap-2 flex-wrap">
                                {allPeaks.map(([start, end], i) => (
                                    <span key={i}>
                                        {formatTime12Hour(start)} - {formatTime12Hour(end)}
                                        {i !== allPeaks.length - 1 && ","}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            (Workouts during peak hours may use more minutes)
                        </p>
                    </div>
                </div>
            </div>
        </BottomSheet>
    );
}
