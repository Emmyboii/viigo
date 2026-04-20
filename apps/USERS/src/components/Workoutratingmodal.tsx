import { useEffect, useState } from "react";
import BottomSheet from "./BottomSheet";
import { FaStar } from "react-icons/fa";
import { BsCalendar2 } from "react-icons/bs";
import { useAppContext } from "../context/AppContext";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// ─── Types ───────────────────────────────────────────────────────────────────

type BookingForRating = {
    id: number;
    booking_reference: string;
    gym_name: string;
    gym_image: string;
    formatted_date: string;
    duration_in_hours: string;
    base_price: string;
    status: string;       // "COMPLETED"
    is_rated: boolean;    // key field
};

const TAGS = ["Cleanliness", "Equipment", "Crowd", "Vibe", "Spacious", "Friendly"];

// ─── Simulated GET (replace with real fetch when ready) ──────────────────────

async function fetchUnratedBooking(): Promise<BookingForRating | null> {
    // 🔧 SIMULATED — replace body with real API call:
    // const res = await fetch(`${backendUrl}/client/bookings/my-bookings/`, {
    //     headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    // });
    // const data = await res.json();
    // const bookings: BookingForRating[] = data.data ?? [];
    // return bookings.find(b => b.status === "COMPLETED" && !b.is_rated) ?? null;

    // Simulated response:
    return {
        id: 42,
        booking_reference: "VGO-2024-0042",
        gym_name: "Fight To Fitness",
        gym_image: "media/gyms/fight-to-fitness.jpg",
        formatted_date: "05 Dec",
        duration_in_hours: "1.5",
        base_price: "280",
        status: "COMPLETED",
        is_rated: true,
    };
}

// ─── POST rating ─────────────────────────────────────────────────────────────

async function submitRating(
    bookingId: number,
    rating: number,
    tags: string[]
): Promise<boolean> {
    try {
        const res = await fetch(`${backendUrl}/client/bookings/${bookingId}/rate/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ rating, tags }),
        });
        return res.ok;
    } catch {
        // Fallback: log and treat as success so UX isn't blocked
        console.error("Rating submission failed, using fallback.");
        return true;
    }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function WorkoutRatingModal() {
    const { userData } = useAppContext();

    const [booking, setBooking] = useState<BookingForRating | null>(null);
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (!userData) return; // 👈 skip entirely if not logged in

        (async () => {
            const unrated = await fetchUnratedBooking();
            if (unrated && !unrated.is_rated) {
                setBooking(unrated);
                setOpen(true);
            }
        })();
    }, [userData]);

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleSubmit = async () => {
        if (!booking || rating === 0) return;
        setSubmitting(true);
        const ok = await submitRating(booking.id, rating, selectedTags);
        setSubmitting(false);
        if (ok) {
            setSubmitted(true);
            setTimeout(() => setOpen(false), 1200);
        }
    };

    if (!booking) return null;

    return (
        <BottomSheet
            open={open}
            onClose={() => setOpen(false)}
            title="Workout Completed"
            footer={
                <button
                    onClick={handleSubmit}
                    disabled={rating === 0 || submitting || submitted}
                    className={`w-full py-4 rounded-xl font-semibold text-white text-base transition-all
                        ${rating === 0
                            ? "bg-blue-300 cursor-not-allowed"
                            : submitted
                                ? "bg-green-500"
                                : "bg-blue-600 active:scale-95"
                        }`}
                >
                    {submitted ? "Thanks for rating! ✓" : submitting ? "Submitting..." : "Submit"}
                </button>
            }
        >
            {/* ── Gym Card ── */}
            <div className="flex gap-3 border border-[#E2E8F0] rounded-lg  mb-6 shadow-sm">
                <img
                    src={`https://api.viigo.in/${booking.gym_image}`}
                    alt={booking.gym_name}
                    className="w-[90px] h-[90px] rounded-tl-lg rounded-bl-lg object-cover flex-shrink-0"
                    onError={e => {
                        (e.target as HTMLImageElement).src =
                            "https://placehold.co/90x90/e2e8f0/94a3b8?text=Gym";
                    }}
                />
                <div className="flex flex-col justify-center gap-1">
                    <p className="font-semibold text-gray-900">{booking.gym_name}</p>
                    <div className="flex items-center gap-1 text-[#0F172A] text-sm">
                        <BsCalendar2 size={11} />
                        <span>{booking.formatted_date} • {booking.duration_in_hours} hrs</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[#0F172A] text-base font-semibold">
                            ₹{booking.base_price}/Hr
                        </span>
                        <span className="bg-[#CBD5E1] text-[#475569] text-xs px-2 py-0.5 rounded-full">
                            Completed
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Star Rating ── */}
            <p className="text-center font-semibold text-lg text-gray-900 mb-4">
                Rate Your Experience
            </p>

            <div className="flex justify-center gap-3 mb-6">
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        title={`${star} Star${star > 1 ? "s" : ""}`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        className="transition-transform active:scale-90"
                    >
                        <FaStar
                            size={38}
                            className={`transition-colors duration-100 ${star <= (hovered || rating)
                                ? "text-yellow-400"
                                : "text-gray-200"
                                }`}
                        />
                    </button>
                ))}
            </div>

            {/* ── Tags ── */}
            <div className="flex flex-wrap gap-2 gap-y-3 justify-center">
                {TAGS.map(tag => {
                    const active = selectedTags.includes(tag);
                    return (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-4 py-1.5 rounded-lg border text-sm font-medium transition-all active:scale-95 ${active
                                ? "border-blue-500 text-blue-600 bg-blue-50"
                                : "border-[#CBD5E1] text-gray-600 bg-white"
                                }`}
                        >
                            {tag}
                        </button>
                    );
                })}
            </div>
        </BottomSheet>
    );
}