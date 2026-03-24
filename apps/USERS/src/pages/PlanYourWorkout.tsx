import { useEffect, useMemo, useState } from "react";
import { FaUser } from "react-icons/fa6";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAppContext, type GymCard } from "../context/AppContext";
import type { Gym } from "../components/types/gym";
import { HiLocationMarker } from "react-icons/hi";
import { FriendsModal } from "../components/FriendsModal";
import { IoArrowBack } from "react-icons/io5";
import { FiUsers } from "react-icons/fi";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const hoursOptions = [
    { label: "1 Hr", value: 1 },
    { label: "1.5 Hrs", value: 1.5 },
    { label: "2 Hrs", value: 2 },
    { label: "2.5 Hrs", value: 2.5 },
    { label: "3 Hrs", value: 3 },
];

const PlanYourWorkout = () => {

    const location = useLocation()

    const { gyms, userData } = useAppContext()
    const navigate = useNavigate()

    const { slug } = useParams();

    useEffect(() => {
        if (location.state?.reopenSheet) {
            setFriendsModalOpen(true);
        }
    }, [location.state]);

    const [gym, setGym] = useState<GymCard | null>(null);
    const [loading, setLoading] = useState(true);
    const [peopleCount, setPeopleCount] = useState(() => {
        const stored = localStorage.getItem("bookingData");

        if (!stored) return 0;

        try {
            const parsed = JSON.parse(stored);
            return parsed?.peopleCount ?? 0;
        } catch {
            return 0;
        }
    });
    const [friendsModalOpen, setFriendsModalOpen] = useState(false);

    const storedBooking = localStorage.getItem("bookingData");

    const initialBookingState = storedBooking
        ? (() => {
            const parsed = JSON.parse(storedBooking);

            return {
                ...parsed,
                selectedDate: parsed.selectedDate
                    ? new Date(parsed.selectedDate)
                    : null,
            };
        })()
        : null;

    const [selectedDate, setSelectedDate] = useState<Date | null>(
        initialBookingState?.selectedDate ?? new Date()
    );

    const [selectedHours, setSelectedHours] = useState(
        initialBookingState?.selectedHours ?? {
            index: 0,
            value: 1,
            label: "1 Hr",
        }
    );

    const editSelectedHr = selectedHours.value === 1 ? "Hr" : selectedHours.label

    const totalWithHr = selectedHours && gym?.hourly_rate
        ? gym?.hourly_rate * selectedHours.value
        : gym?.hourly_rate;

    const id = gym?.id

    const [error, setError] = useState({ type: "", message: "" });


    useEffect(() => {
        const fetchGymById = async () => {
            if (!slug) return;

            setLoading(true);

            try {
                // Try to find the gym locally first
                const localGym = gyms.find((g) => g.slug === slug);

                let gymId: number | undefined;
                if (localGym) {
                    gymId = localGym.id;
                } else {
                    // If not found locally, fetch all gyms to find the ID
                    const res = await fetch(`${backendUrl}/gymowner/gyms/all/`, {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: localStorage.getItem("token")
                                ? `Bearer ${localStorage.getItem("token")}`
                                : "",
                        },
                    });

                    if (!res.ok) throw new Error("Failed to fetch gyms list");

                    const data = await res.json();
                    const foundGym = data?.data?.find((g: Gym) => g.slug === slug);

                    if (!foundGym) {
                        setGym(null);
                        setLoading(false);
                        return;
                    }

                    gymId = foundGym.id;
                }

                // Now fetch gym details by ID
                const detailRes = await fetch(`${backendUrl}/gymowner/gym/${gymId}/`, {
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
    }, [slug, gyms]);

    function formatTime12Hour(time24: string | undefined) {
        const [hourStr, minuteStr] = time24?.split(":") || [];
        let hour = Number(hourStr);
        const minute = minuteStr;
        const ampm = hour >= 12 ? "PM" : "AM";

        hour = hour % 12;
        if (hour === 0) hour = 12;

        return `${hour}:${minute} ${ampm}`;
    }

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
            peopleCount,
            id
            // reopenSheet: true
        };
        localStorage.setItem("bookingData", JSON.stringify(bookingData));

        navigate("/reviewpay")

        setError({ type: "", message: "" });


        window.scrollTo(0, 0);
    };

    const allPeaks = [
        ...(Array.isArray(gym?.peak_morning) ? gym.peak_morning : []),
        ...(Array.isArray(gym?.peak_evening) ? gym.peak_evening : []),
    ];

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
        <div className="pb-40 min-h-screen px-5">

            {/* ===== Header ===== */}

            <div className="fixed top-0 left-0 right-0 z-40 bg-white flex items-center justify-between px-4 py-3" >

                <div className='flex items-center gap-2'>
                    <button
                        onClick={() => navigate(-1)}
                        aria-label="Go back"
                        className="p-1"
                    >
                        <IoArrowBack size={20} />
                    </button>

                    <span className="font-semibold text-lg text-[#0F172A]">Plan Your Workout</span>
                </div>
            </div>

            <div className="pt-14" />

            <div className="space-y-4 relative">

                {/* ===== Gym Summary Card ===== */}
                <div className="bg-white rounded border flex gap-1 h-fit">
                    <img
                        src={gym?.images[0]?.image}
                        alt={gym?.name}
                        className="w-[85px] h-[105px] rounded-tl rounded-bl object-cove"
                    />

                    <div className="p-3">
                        <h2 className="font-semibold">{gym?.name}</h2>

                        <div className="flex items-center text-xs text-[#475569] gap-1 mt-2 flex-wrap">
                            <HiLocationMarker size={12} />
                            <span>{gym?.distance} {gym?.area}</span>
                            <span>•</span>
                            <span>{gym?.open_status || `Open Till ${formatTime12Hour(gym?.close_time)}`}</span>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                            <p className="font-semibold">₹{Number(gym?.hourly_rate)}/Hr</p>
                        </div>
                    </div>
                </div>

                <div className="pt-1 space-y-4">
                    <h4 className="text-base font-semibold text-black">
                        How many people are working out?
                    </h4>

                    <div className="flex items-center gap-1.5 pb-7">
                        <FaUser className="text-[#475569] size-3" />

                        {peopleCount === 0 ? (
                            <>
                                <p className="break-all font-semibold">{userData?.full_name.split(" ")[0] || userData?.email}</p>

                                <button
                                    onClick={() => setFriendsModalOpen(true)}
                                    className="bg-[#DBEAFE] text-[#2563EB] px-2 py-2 rounded-lg text-sm font-medium ml-3"
                                >
                                    + Add Friends
                                </button>
                            </>
                        ) : (
                            <>
                                <span className="font-medium break-all">
                                    {userData?.full_name.split(" ")[0] || userData?.email} +{peopleCount}
                                </span>

                                <button
                                    onClick={() => setFriendsModalOpen(true)}
                                    className="bg-[#DBEAFE] text-[#2563EB] px-2 py-2 rounded-lg text-sm font-medium ml-3"
                                >
                                    Edit
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <h4 className="text-lg font-semibold text-black mb-3">
                Select the Date
            </h4>

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
                        <p className="text-sm font-normal">{item.day}</p>
                        <p className="font-semibold text-[22px]">{item.date}</p>
                        <p className="text-sm font-normal">{item.month}</p>
                    </div>
                ))}

            </div>

            {error.type === 'date' && (
                <p className="text-red-500 text-sm mt-2">{error.message}</p>
            )}

            {/* Hours Selection */}
            <div className="mt-6">
                <h4 className="font-semibold mb-3">
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

            {/* ===== Sticky Bottom Pay Bar ===== */}
            <div className="fixed bottom-0 left-0 right-0 bg-white">
                <div className="bg-blue-50 text-blue-700 text-sm px-4 py-3 font-medium text-center">
                    Last entry for selected duration: {lastEntryTime}
                </div>

                <div className="px-3 py-3">

                    {error.type === 'general' && (
                        <p className="text-red-500 text-sm mb-2">{error.message}</p>
                    )}
                    <div className="flex items-center justify-between">
                        {/* <p className="font-semibold text-2xl">
                            ₹{total || 425}{selectedHours?.label ? `/${selectedHours.label}` : ""}
                        </p> */}

                        <div className="space-y-2">
                            <p className="text-xs text-[#475569] font-medium">
                                Gym timings : {formatTime12Hour(gym?.open_time)} - {formatTime12Hour(gym?.close_time)}
                            </p>

                            <p className="text-[22px] font-semibold">
                                ₹{totalWithHr}{selectedHours?.label ? `/${editSelectedHr}` : ""}
                            </p>
                        </div>

                        <button
                            disabled={allHoursDisabled}
                            onClick={handleApply}
                            className={`w-[146px] text-white px-6 py-3 rounded-md font-semibold text-sm ${allHoursDisabled ? "bg-[#a6a7a8] cursor-not-allowed" : "bg-blue-600 cursor-pointer"}`}
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>

            <FriendsModal
                open={friendsModalOpen}
                onClose={() => setFriendsModalOpen(false)}
                value={peopleCount}
                onApply={(val) => setPeopleCount(val)}
            />
        </div>
    )
}

export default PlanYourWorkout