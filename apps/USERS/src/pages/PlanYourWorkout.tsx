import { useEffect, useMemo, useRef, useState } from "react";
import { FaUser } from "react-icons/fa6";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAppContext, type GymCard } from "../context/AppContext";
import type { Gym } from "../components/types/gym";
import { HiLocationMarker, HiThumbUp } from "react-icons/hi";
import { FriendsModal } from "../components/FriendsModal";
import { IoArrowBack, IoMoonOutline } from "react-icons/io5";
import fire from '../assets/fire.png'
import most from '../assets/most.png'
import { GrSun } from "react-icons/gr";
import { getNowIST } from "../utils/ist";
import { PlanWorkoutSkeleton } from "../components/Gymskeletons ";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const hoursOptions = [
    { label: "1 Hr", value: 1 },
    { label: "1.5 Hrs", value: 1.5 },
    { label: "2 Hrs", value: 2 },
    { label: "2.5 Hrs", value: 2.5 },
    { label: "3 Hrs", value: 3 },
];

type SlotType = 'NON_PEAK' | 'MORNING_PEAK' | 'EVENING_PEAK';

// ── Time constants (minutes from midnight) ──────────────────────────────────
const MORNING_PEAK_END_MINUTES = 8 * 60;        // 8:00 AM  — morning peak ends
// const MORNING_PEAK_CUTOFF_MINUTES = 7 * 60;     // 7:00 AM  — last entry for 1 hr morning peak
const NON_PEAK_END_MINUTES = 17 * 60;            // 5:00 PM  — non-peak ends
const NON_PEAK_CUTOFF_MINUTES = 16 * 60;         // 4:00 PM  — last entry for 1 hr non-peak

const PlanYourWorkout = () => {

    const locations = useLocation()

    const { gyms, userData, latitude, longitude } = useAppContext()
    const navigate = useNavigate()

    const { slug } = useParams();

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
    const [selectedSlot, setSelectedSlot] = useState<SlotType>(() => {
        const stored = localStorage.getItem("bookingData");
        if (stored) {
            try {
                return JSON.parse(stored)?.slot_type ?? "NON_PEAK";
            } catch {
                return "NON_PEAK";
            }
        }
        return "NON_PEAK";
    });

    // --- Open modal function ---
    const openFriendsModal = () => {
        setFriendsModalOpen(true);
        window.history.pushState({ modal: true }, "");
    };

    // --- Close modal function ---
    const closeFriendsModal = () => {
        setFriendsModalOpen(false);
        if (window.history.state?.modal) {
            window.history.back();
        }
    };

    // --- Back button handler ---
    useEffect(() => {
        const handlePopState = () => {
            if (friendsModalOpen) {
                setFriendsModalOpen(false);
            }
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [friendsModalOpen]);

    // --- Handle route reopenSheet state ---
    const openedRef = useRef(false);

    useEffect(() => {
        if (locations.state?.reopenSheet && !openedRef.current) {
            setFriendsModalOpen(true);
            openedRef.current = true;
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [locations.state, navigate]);

    const storedBooking = localStorage.getItem("bookingData");

    const initialBookingState = storedBooking
        ? (() => {
            const parsed = JSON.parse(storedBooking);
            let restoredDate: Date | null = null;
            if (parsed.selectedDate) {
                // Parse as local date (YYYY-MM-DD) to avoid UTC midnight → previous day in IST
                const [y, m, d] = parsed.selectedDate.split("-").map(Number);
                restoredDate = new Date(y, m - 1, d, 0, 0, 0, 0);
            }
            return { ...parsed, selectedDate: restoredDate };
        })()
        : null;

    const [selectedDate, setSelectedDate] = useState<Date | null>(
        initialBookingState?.selectedDate ?? getNowIST()
    );

    const [selectedHours, setSelectedHours] = useState(
        initialBookingState?.selectedHours ?? { index: 0, value: 1, label: "1 Hr" }
    );

    const editSelectedHr = selectedHours.value === 1 ? "Hr" : selectedHours.label

    const peakMultiplier = (selectedSlot === 'MORNING_PEAK' || selectedSlot === 'EVENING_PEAK') ? 1.5 : 1;

    const totalWithHr = selectedHours && gym?.hourly_rate && peopleCount > 0
        ? gym?.hourly_rate * peakMultiplier * selectedHours.value * (peopleCount + 1)
        : gym?.hourly_rate
            ? Math.round(Number(gym.hourly_rate) * peakMultiplier * selectedHours.value)
            : 0;

    const id = gym?.id

    const [error, setError] = useState({ type: "", message: "" });

    useEffect(() => {
        const fetchGymById = async () => {
            if (!slug) return;
            setLoading(true);
            try {
                const localGym = gyms.find((g) => g.slug === slug);
                let gymId: number | undefined;
                if (localGym) {
                    gymId = localGym.id;
                } else {
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
                const detailRes = await fetch(`${backendUrl}/gymowner/gym/${gymId}/?lat=${latitude}&long=${longitude}`, {
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
        if (userData && latitude && longitude) {
            fetchGymById();
        }
    }, [slug, gyms, longitude, latitude, userData]);

    function formatTime12Hour(time24: string | undefined) {
        const [hourStr, minuteStr] = time24?.split(":") || [];
        let hour = Number(hourStr);
        const minute = minuteStr;
        const ampm = hour >= 12 ? "PM" : "AM";
        hour = hour % 12;
        if (hour === 0) hour = 12;
        return `${hour}:${minute} ${ampm}`;
    }

    // ── Gym close time as total minutes from midnight ────────────────────────
    const gymCloseMinutes = useMemo(() => {
        if (!gym?.close_time) return null;
        const [hourStr, minuteStr] = gym.close_time.split(":");
        return Number(hourStr) * 60 + Number(minuteStr);
    }, [gym?.close_time]);

    // ── Gym close time as a Date object (for display) ────────────────────────
    const gymCloseDate = useMemo(() => {
        if (!gym?.close_time) return null;
        const [hourStr, minuteStr] = gym.close_time.split(":");
        const date = getNowIST();
        date.setHours(Number(hourStr), Number(minuteStr), 0, 0);
        return date;
    }, [gym?.close_time]);

    // ── Generate next 7 dates ────────────────────────────────────────────────
    const dates = useMemo(() => {
        const today = getNowIST();
        return Array.from({ length: 7 }).map((_, index) => {
            const date = getNowIST();
            date.setDate(today.getDate() + index);
            return {
                day: index === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" }),
                date: date.getDate().toString().padStart(2, "0"),
                month: date.toLocaleDateString("en-US", { month: "short" }),
                fullDate: date,
            };
        });
    }, []);

    // ── Is selected date today? ──────────────────────────────────────────────
    const isToday = useMemo(() => {
        if (!selectedDate) return false;
        const nowIST = getNowIST();
        return (
            selectedDate.getFullYear() === nowIST.getFullYear() &&
            selectedDate.getMonth() === nowIST.getMonth() &&
            selectedDate.getDate() === nowIST.getDate()
        );
    }, [selectedDate]);

    // ── Current time in minutes — updates every minute so slots close on time ──
    const [nowMinutes, setNowMinutes] = useState(() => {
        const now = getNowIST();
        return now.getHours() * 60 + now.getMinutes();
    });

    useEffect(() => {
        const tick = () => {
            const now = getNowIST();
            setNowMinutes(now.getHours() * 60 + now.getMinutes());
        };
        const interval = setInterval(tick, 60_000);
        return () => clearInterval(interval);
    }, []);

    // ── Slot closed states (today only) ─────────────────────────────────────

    // Morning Peak: closed when no valid duration can fit before 8:00 AM.
    // The minimum valid session is 1hr, so cutoff = 8:00 AM - 1hr = 7:00 AM.
    // But if gym opens later (e.g. 7:30 AM), the slot is always closed since even 1hr can't fit.
    const morningPeakLastEntryMinutes = MORNING_PEAK_END_MINUTES - 60; // 7:00 AM
    const isMorningPeakClosedToday = isToday && nowMinutes >= morningPeakLastEntryMinutes;

    // Non-Peak: closed once past 4:00 PM
    const isNonPeakClosedToday = isToday && nowMinutes >= NON_PEAK_CUTOFF_MINUTES;

    // Evening Peak: closed 1hr before gym close time
    const isEveningPeakClosedToday = useMemo(() => {
        if (!isToday || gymCloseMinutes === null) return false;
        return nowMinutes >= gymCloseMinutes - 60;
    }, [isToday, gymCloseMinutes, nowMinutes]);

    // ── Duration validation per slot (today only) ───────────────────────────

    // ── Gym open time as total minutes from midnight ─────────────────────────
    const gymOpenMinutes = useMemo(() => {
        if (!gym?.open_time) return null;
        const [hourStr, minuteStr] = gym.open_time.split(":");
        return Number(hourStr) * 60 + Number(minuteStr);
    }, [gym?.open_time]);

    const isMorningPeakDurationInvalid = (duration: number): boolean => {
        // The morning peak window is gym open time → 8:00 AM.
        // A duration is only valid if it fits within that window.
        // e.g. gym opens at 7:00 AM → window = 60 min → only 1 Hr fits.
        const windowStart = gymOpenMinutes ?? 0; // fallback to midnight if unknown
        const windowSizeMinutes = MORNING_PEAK_END_MINUTES - windowStart; // e.g. 480 - 420 = 60 min
        if (duration * 60 > windowSizeMinutes) return true;

        // Also apply time-of-day check for today: session must still end by 8:00 AM
        if (isToday && nowMinutes + duration * 60 > MORNING_PEAK_END_MINUTES) return true;

        return false;
    };

    const isNonPeakDurationInvalid = (duration: number): boolean => {
        if (!isToday) return false;
        // Session must end by 5:00 PM
        return nowMinutes + duration * 60 > NON_PEAK_END_MINUTES;
    };

    const isEveningPeakDurationInvalid = (duration: number): boolean => {
        if (!isToday || gymCloseMinutes === null) return false;
        // Session must end by gym close time
        return nowMinutes + duration * 60 > gymCloseMinutes;
    };

    const isDurationInvalid = (duration: number): boolean => {
        if (selectedSlot === 'MORNING_PEAK') return isMorningPeakDurationInvalid(duration);
        if (selectedSlot === 'NON_PEAK') return isNonPeakDurationInvalid(duration);
        return isEveningPeakDurationInvalid(duration);
    };

    const allHoursDisabled = hoursOptions.every((hour) => isDurationInvalid(hour.value));

    // ── Auto-reset selected duration when switching slots if it becomes invalid
    // Note: no isToday guard — Morning Peak window restriction applies on all dates
    useEffect(() => {
        const currentDurationInvalid = isDurationInvalid(selectedHours.value);
        if (!currentDurationInvalid) return;

        const firstValid = hoursOptions.find((h) => !isDurationInvalid(h.value));

        if (firstValid) {
            setSelectedHours({ index: hoursOptions.indexOf(firstValid), value: firstValid.value, label: firstValid.label });
            const slotLabel = selectedSlot === 'MORNING_PEAK' ? 'Morning Peak' : selectedSlot === 'EVENING_PEAK' ? 'Evening Peak' : 'Non-Peak';
            setError({
                type: "duration_reset",
                message: `Your selected duration isn't available for ${slotLabel} hours. We've selected the next available option.`,
            });
        } else {
            setError({ type: "", message: "" });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSlot]);

    // ── Last entry time calculation ──────────────────────────────────────────
    const calculateLastEntry = (): string => {
        if (!selectedHours?.value) return "";

        const durationMs = selectedHours.value * 60 * 60 * 1000;

        if (selectedSlot === 'MORNING_PEAK') {
            // Last entry = 8:00 AM minus selected duration
            const lastEntry = getNowIST();
            lastEntry.setHours(8, 0, 0, 0);
            lastEntry.setTime(lastEntry.getTime() - durationMs);
            return lastEntry.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true });
        }

        if (selectedSlot === 'NON_PEAK') {
            // Last entry = 5:00 PM minus selected duration
            const lastEntry = getNowIST();
            lastEntry.setHours(17, 0, 0, 0);
            lastEntry.setTime(lastEntry.getTime() - durationMs);
            return lastEntry.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true });
        }

        // Evening Peak: last entry = gym close time minus selected duration
        if (!gymCloseDate) return "";
        const lastEntryDate = new Date(gymCloseDate);
        lastEntryDate.setTime(lastEntryDate.getTime() - durationMs);
        return lastEntryDate.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true });
    };

    const lastEntryTime = calculateLastEntry();

    // ── Slot closed banner message ───────────────────────────────────────────
    const slotClosedMessage = useMemo(() => {
        if (!isToday) return null;

        if (selectedSlot === 'MORNING_PEAK' && isMorningPeakClosedToday) {
            return "Morning Peak bookings for today are closed. Bookings close at 7:00 AM (1 hour before morning peak ends at 8:00 AM).";
        }

        if (selectedSlot === 'NON_PEAK' && isNonPeakClosedToday) {
            return "Non-peak bookings for today are closed. Bookings close at 4:00 PM (1 hour before non-peak ends at 5:00 PM).";
        }

        if (selectedSlot === 'EVENING_PEAK' && isEveningPeakClosedToday) {
            const closeTime = gymCloseDate
                ? gymCloseDate.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true })
                : "closing time";
            return `Evening Peak bookings for today are closed. Bookings close 1 hour before the gym closes (${closeTime}).`;
        }

        return null;
    }, [selectedSlot, isMorningPeakClosedToday, isNonPeakClosedToday, isEveningPeakClosedToday, isToday, gymCloseDate]);

    // ── Duration disabled explanation ────────────────────────────────────────
    const durationDisabledMessage = useMemo(() => {
        const someDisabled = hoursOptions.some((h) => isDurationInvalid(h.value));
        const allDisabled = hoursOptions.every((h) => isDurationInvalid(h.value));
        if (!someDisabled || allDisabled) return null;

        if (selectedSlot === 'MORNING_PEAK') {
            // Window restriction applies always (not just today)
            return "Some durations are unavailable as they exceed the morning peak window (gym open – 8:00 AM).";
        }

        // For Non-Peak and Evening Peak, only relevant today
        if (!isToday) return null;

        if (selectedSlot === 'NON_PEAK') {
            return "Some durations are unavailable as the session would end after 5:00 PM.";
        }

        if (gymCloseDate) {
            const closeStr = gymCloseDate.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true });
            return `Some durations are unavailable as the session would exceed the gym's closing time (${closeStr}).`;
        }

        return null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSlot, isToday, nowMinutes, gymCloseDate]);

    // ── Gym closed for selected date ─────────────────────────────────────────
    // Format a Date as YYYY-MM-DD using LOCAL date parts (avoids UTC rollback on IST midnight dates)
    const toLocalDateString = (date: Date): string => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    const selectedDateAvailability = useMemo(() => {
        if (!selectedDate) return null;
        const selectedDateString = toLocalDateString(selectedDate);
        return gym?.calendar_availability?.find((item) => item.date === selectedDateString);
    }, [selectedDate, gym]);

    const isGymClosedForSelectedDate = useMemo(() => {
        if (selectedDateAvailability) return selectedDateAvailability.is_open === false;
        if (isToday) return !gym?.is_open;
        return false;
    }, [selectedDateAvailability, isToday, gym?.is_open]);

    const closedGymMessage = isToday
        ? "Gym is closed today. Please select another date."
        : "Gym will be closed on this day. Please choose another date.";

    // ── Is the currently selected slot closed today? ─────────────────────────
    const isSelectedSlotClosedToday = isToday && (
        (selectedSlot === 'MORNING_PEAK' && isMorningPeakClosedToday) ||
        (selectedSlot === 'NON_PEAK' && isNonPeakClosedToday) ||
        (selectedSlot === 'EVENING_PEAK' && isEveningPeakClosedToday)
    );

    // ── Handle Apply ─────────────────────────────────────────────────────────
    const handleApply = () => {
        if (isGymClosedForSelectedDate) {
            setError({ type: "general", message: closedGymMessage });
            return;
        }

        if (isSelectedSlotClosedToday) {
            const slotLabel = selectedSlot === 'MORNING_PEAK' ? 'Morning Peak' : selectedSlot === 'EVENING_PEAK' ? 'Evening Peak' : 'Non-Peak';
            setError({ type: "general", message: `${slotLabel} bookings for today are closed. Please select a future date or choose another slot.` });
            return;
        }

        if (selectedDate === null && !selectedHours && !selectedSlot) {
            setError({ type: "general", message: "Please complete all selections to continue." });
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

        if (!selectedSlot) {
            setError({ type: "slot", message: "Please choose your workout timing to continue." });
            return;
        }

        // Store date as a local YYYY-MM-DD string to avoid UTC rollback on serialization
        const bookingData = {
            selectedDate: toLocalDateString(selectedDate),
            selectedHours,
            peopleCount,
            id,
            slot_type: selectedSlot,
        };
        localStorage.setItem("bookingData", JSON.stringify(bookingData));
        navigate("/reviewpayment");
        setError({ type: "", message: "" });
        window.scrollTo(0, 0);
    };

    if (loading) { return <PlanWorkoutSkeleton />; }

    // ── Helpers for slot card styling ────────────────────────────────────────
    const slotCardClass = (slot: SlotType, isClosed: boolean) => {
        const isSelected = selectedSlot === slot;
        if (isClosed || isGymClosedForSelectedDate) {
            return "px-4 py-4 rounded-lg border-2 border-[#E2E8F0] bg-gray-50 opacity-60 cursor-not-allowed transition";
        }
        return `px-4 py-4 rounded-lg border-2 cursor-pointer transition ${isSelected ? 'border-[#2563EB] bg-white' : 'border-[#E2E8F0] bg-white'}`;
    };

    const radioClass = (slot: SlotType, isClosed: boolean) => {
        const isSelected = selectedSlot === slot;
        if (isClosed) return "mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 border-[#CBD5E1]";
        return `mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-[#2563EB]' : 'border-[#CBD5E1]'}`;
    };

    const handleSlotClick = (slot: SlotType, isClosed: boolean) => {
        if (isClosed || isGymClosedForSelectedDate) return;
        setSelectedSlot(slot);
        setError({ type: "", message: "" });
    };

    return (
        <div className="pb-40 min-h-screen sp:px-5 px-3.5 max-w-[1300px] mx-auto">

            {/* ===== Header ===== */}
            <div className="fixed max-w-[1300px] mx-auto top-0 left-0 right-0 z-40 bg-white flex items-center justify-between px-4 py-3">
                <div className='flex items-center gap-2'>
                    <button onClick={() => navigate(`/gyms/${gym?.slug}`)} aria-label="Go back" className="p-1">
                        <IoArrowBack size={20} />
                    </button>
                    <span className="font-semibold text-lg text-[#0F172A]">Plan Your Workout</span>
                </div>
            </div>

            <div className="pt-14" />

            <div className="space-y-4 relative">
                {/* ===== Gym Summary Card ===== */}
                <div className="bg-white rounded border flex gap-1 max-h-[115px]">
                    <img src={gym?.images[0]?.image} alt={gym?.name} className="w-[85px] object-cover rounded-tl rounded-bl" />
                    <div className="p-3">
                        <h2 className="font-semibold">{gym?.name}</h2>
                        <div className="flex items-center text-xs text-[#475569] gap-1 mt-1 flex-wrap">
                            <HiLocationMarker size={12} />
                            <span>{gym?.distance}, {gym?.area}</span>
                            <span>•</span>
                            <span>{gym?.open_status || `Open Till ${formatTime12Hour(gym?.close_time)}`}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="font-semibold">₹{Number(gym?.hourly_rate)}/Hr</p>
                        </div>
                    </div>
                </div>
            </div>

            <h4 className="text-lg font-semibold sm:text-center text-black mb-3 mt-3">
                Select the Date
            </h4>

            {/* Date Selector */}
            <div className="flex gap-3 overflow-x-auto sm:justify-center pb-2">
                {dates.map((item, index) => {
                    const dateString = toLocalDateString(item.fullDate);
                    const availability = gym?.calendar_availability?.find((cal) => cal.date === dateString);
                    const isClosed = availability?.is_open === false;

                    return (
                        <div
                            key={index}
                            onClick={() => {
                                if (isClosed) return;
                                setSelectedDate(item.fullDate);
                                setError({ type: "", message: "" });
                            }}
                            className={`min-w-[70px] text-center p-1.5 py-2 font-medium rounded-md space-y-2 border transition ${isClosed
                                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                : selectedDate && selectedDate.toDateString() === item.fullDate.toDateString()
                                    ? "bg-[#DBEAFE] border-[#2563EB] text-[#2563EB] cursor-pointer"
                                    : "border-[#DBEAFE] text-[#0F172A] cursor-pointer"
                                }`}
                        >
                            <p className="text-sm font-normal">{item.day}</p>
                            <p className="font-semibold text-[22px]">{item.date}</p>
                            <p className="text-sm font-normal">{item.month}</p>
                            {isClosed && <p className="text-[10px] font-medium text-red-500">Closed</p>}
                        </div>
                    );
                })}
            </div>

            {error.type === 'date' && (
                <p className="text-red-500 text-sm mt-2">{error.message}</p>
            )}

            {isGymClosedForSelectedDate && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm font-medium text-red-600">{closedGymMessage}</p>
                    <p className="text-xs text-red-500 mt-1">Bookings are unavailable for this date.</p>
                </div>
            )}

            {/* Hours Selection */}
            <div className="mt-6">
                <h4 className="font-semibold sm:text-center mb-3">
                    How long do you want to work out?
                </h4>

                <div className="flex flex-wrap sm:justify-center gap-2">
                    {hoursOptions.map((hour, index) => {
                        const disabled = isDurationInvalid(hour.value) || isGymClosedForSelectedDate;

                        return (
                            <button
                                key={index}
                                disabled={disabled}
                                onClick={() => {
                                    if (disabled) return;
                                    setSelectedHours({ index, value: hour.value, label: hour.label });
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

                {durationDisabledMessage && (
                    <p className="text-amber-600 text-xs mt-2">{durationDisabledMessage}</p>
                )}

                {error.type === 'hours' && (
                    <p className="text-red-500 text-sm mt-2">{error.message}</p>
                )}

                {error.type === 'duration_reset' && (
                    <p className="text-amber-600 text-sm mt-2">{error.message}</p>
                )}
            </div>

            <div className="pt-7 space-y-4">
                <h4 className="text-base font-semibold sm:text-center text-black">
                    Who's joining? <span className="text-[#94A3B8] text-xs">(Optional)</span>
                </h4>

                <div className="flex items-center sm:justify-center gap-1.5">
                    <FaUser className="text-[#475569] size-3" />

                    {peopleCount === 0 ? (
                        <>
                            <p className="break-all font-semibold">{userData?.full_name.split(" ")[0] || userData?.email}</p>
                            <button onClick={openFriendsModal} className="bg-[#DBEAFE] text-[#2563EB] px-2 py-2 rounded-lg text-sm font-medium ml-3">
                                + Add Friends
                            </button>
                        </>
                    ) : (
                        <>
                            <span className="font-normal break-all">
                                {userData?.full_name.split(" ")[0] || userData?.email} +{peopleCount}
                            </span>
                            <button onClick={openFriendsModal} className="bg-[#DBEAFE] text-[#2563EB] px-2 py-2 rounded-lg text-sm font-medium ml-3">
                                Edit
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="mt-6">
                <h4 className="font-semibold mb-1">Choose your workout timings</h4>
                <p className="text-xs text-[#000000] mb-3">
                    Your selection determines pricing. Entry should be within selected timing.
                </p>

                <div className="space-y-3">

                    {/* ── Morning Peak ── */}
                    <div
                        onClick={() => handleSlotClick('MORNING_PEAK', isMorningPeakClosedToday)}
                        className={slotCardClass('MORNING_PEAK', isMorningPeakClosedToday)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div className={radioClass('MORNING_PEAK', isMorningPeakClosedToday)}>
                                    {selectedSlot === 'MORNING_PEAK' && !isMorningPeakClosedToday && (
                                        <div className="w-2 h-2 rounded-full bg-[#2563EB]" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-[12px] font-medium text-[#DC2626] flex items-center gap-1 mb-0.5">
                                        <img src={fire} className="w-[10px]" alt="" /> HIGH DEMAND
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-[#101828] text-base">Morning Peak</p>
                                        {isMorningPeakClosedToday && (
                                            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">Closed</span>
                                        )}
                                    </div>
                                    <p className="text-xs gap-1 inline-flex text-[#4A5565] mt-1">
                                        <GrSun className="mt-0.5" /> {gym?.recommended_workout_timings?.peak_hours?.morning || "Gym open – 8:00 AM"}
                                    </p>
                                </div>
                            </div>
                            <div className="text-center flex-shrink-0">
                                <p className="text-lg font-semibold text-[#0F172A]">₹{Math.round(Number(gym?.hourly_rate) * 1.5)}</p>
                                <p className="text-xs text-[#94A3B8] font-medium">/Hour</p>
                            </div>
                        </div>
                    </div>

                    {/* Closed banner for Morning Peak */}
                    {isToday && selectedSlot === 'MORNING_PEAK' && isMorningPeakClosedToday && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                            <p className="text-sm font-medium text-red-600">{slotClosedMessage}</p>
                        </div>
                    )}

                    {/* ── Non-Peak ── */}
                    <div
                        onClick={() => handleSlotClick('NON_PEAK', isNonPeakClosedToday)}
                        className={slotCardClass('NON_PEAK', isNonPeakClosedToday)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div className={radioClass('NON_PEAK', isNonPeakClosedToday)}>
                                    {selectedSlot === 'NON_PEAK' && !isNonPeakClosedToday && (
                                        <div className="w-2 h-2 rounded-full bg-[#2563EB]" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-[12px] font-medium text-[#0F7D37] flex items-center gap-1 mb-0.5">
                                        <HiThumbUp /> RECOMMENDED / BEST VALUE
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-[#101828] text-base">Non-Peak Hours</p>
                                        <span className="text-[10px] bg-[#DCFCE7] text-[#166534] px-1.5 py-0.5 rounded-full font-medium">Save 50%</span>
                                        {isNonPeakClosedToday && (
                                            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">Closed</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-[#4A5565] mt-1">
                                        Timings : {gym?.recommended_workout_timings?.less_crowded_hours}
                                    </p>
                                </div>
                            </div>
                            <div className="text-center flex-shrink-0">
                                <p className="text-xs font-medium text-center text-[#475569] line-through">₹{Math.round(Number(gym?.hourly_rate) * 1.5)}</p>
                                <p className="text-lg font-semibold text-[#0F172A]">₹{Number(gym?.hourly_rate)}</p>
                                <p className="text-xs text-[#94A3B8] font-medium">/Hour</p>
                            </div>
                        </div>
                    </div>

                    {/* Closed banner for Non-Peak */}
                    {isToday && selectedSlot === 'NON_PEAK' && isNonPeakClosedToday && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                            <p className="text-sm font-medium text-red-600">{slotClosedMessage}</p>
                        </div>
                    )}

                    <div className="flex items-center gap-1">
                        <img src={most} className="size-3" alt="" />
                        <p className="text-xs text-[#0F172A]">Most users save by choosing Non-Peak</p>
                    </div>

                    {/* ── Evening Peak ── */}
                    <div
                        onClick={() => handleSlotClick('EVENING_PEAK', isEveningPeakClosedToday)}
                        className={slotCardClass('EVENING_PEAK', isEveningPeakClosedToday)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div className={radioClass('EVENING_PEAK', isEveningPeakClosedToday)}>
                                    {selectedSlot === 'EVENING_PEAK' && !isEveningPeakClosedToday && (
                                        <div className="w-2 h-2 rounded-full bg-[#2563EB]" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-[12px] font-medium text-[#DC2626] flex items-center gap-1 mb-0.5">
                                        <img src={fire} className="w-[10px]" alt="" /> HIGH DEMAND
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-[#101828] text-base">Evening Peak</p>
                                        {isEveningPeakClosedToday && (
                                            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">Closed</span>
                                        )}
                                    </div>
                                    <p className="text-xs gap-1 inline-flex text-[#4A5565] mt-1">
                                        <IoMoonOutline className="mt-0.5" /> {gym?.recommended_workout_timings?.peak_hours?.evening || "5:00 PM – Gym close"}
                                    </p>
                                </div>
                            </div>
                            <div className="text-center flex-shrink-0">
                                <p className="text-lg font-semibold text-[#0F172A]">₹{Math.round(Number(gym?.hourly_rate) * 1.5)}</p>
                                <p className="text-xs text-[#94A3B8] font-medium">/Hour</p>
                            </div>
                        </div>
                    </div>

                    {/* Closed banner for Evening Peak */}
                    {isToday && selectedSlot === 'EVENING_PEAK' && isEveningPeakClosedToday && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                            <p className="text-sm font-medium text-red-600">{slotClosedMessage}</p>
                        </div>
                    )}
                </div>

                {error.type === 'slot' && (
                    <p className="text-red-500 text-sm mt-2">{error.message}</p>
                )}
            </div>

            {/* ===== Sticky Bottom Pay Bar ===== */}
            <div className="fixed max-w-[1300px] mx-auto bottom-0 left-0 right-0 bg-white">
                <div className="bg-blue-50 text-blue-700 text-sm px-4 py-3 font-medium text-center">
                    Last entry for selected duration: {lastEntryTime}
                </div>

                <div className="px-3 py-3">
                    {error.type === 'general' && (
                        <p className="text-red-500 text-sm mb-2">{error.message}</p>
                    )}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1.5">
                            {selectedSlot && (
                                <p className={`text-sm font-normal ${selectedSlot === 'NON_PEAK'
                                        ? 'text-[#0F7D37]'
                                        : 'text-[#DC2626]'
                                    }`}>
                                    {selectedSlot === 'NON_PEAK'
                                        ? 'Non-Peak Hours'
                                        : selectedSlot === 'MORNING_PEAK'
                                            ? 'Morning Peak'
                                            : 'Evening Peak'}
                                </p>
                            )}
                            <p className="text-[22px] font-semibold">
                                ₹{totalWithHr}{selectedHours?.label ? `/${editSelectedHr}` : ""}
                            </p>
                        </div>

                        <button
                            disabled={allHoursDisabled || isGymClosedForSelectedDate || isSelectedSlotClosedToday}
                            onClick={handleApply}
                            className={`w-[130px] text-white px-6 py-3 rounded-md font-semibold cursor-pointer text-sm ${allHoursDisabled || isGymClosedForSelectedDate || isSelectedSlotClosedToday
                                    ? "bg-[#a6a7a8] cursor-not-allowed"
                                    : "bg-blue-600 cursor-pointer"
                                }`}
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>

            <FriendsModal
                open={friendsModalOpen}
                onClose={closeFriendsModal}
                value={peopleCount}
                onApply={(val) => setPeopleCount(val)}
            />
        </div>
    )
}

export default PlanYourWorkout