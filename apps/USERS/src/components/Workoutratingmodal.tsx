import { useEffect, useState } from "react";
import BottomSheet from "./BottomSheet";
import { FaStar } from "react-icons/fa";
import { BsCalendar2 } from "react-icons/bs";
import { useAppContext } from "../context/AppContext";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const TAGS = ["Cleanliness", "Equipment", "Crowd", "Vibe", "Spacious", "Friendly"];

async function submitRating(
    pendingRatingsCardId: number,
    rating: number,
    tags: string[]
): Promise<boolean> {
    try {
        const res = await fetch(`${backendUrl}/client/bookings/${pendingRatingsCardId}/rate/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ rating, tags }),
        });

        if (!res.ok) return false;

        return true;
    } catch (err) {
        console.error("Rating submission failed:", err);
        return false;
    }
}


export default function WorkoutRatingModal() {
    const { pendingRatings, pendingRatingsCard } = useAppContext();

    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleSubmit = async () => {
        if (!pendingRatings || !pendingRatingsCard || rating === 0) return;

        setSubmitting(true);
        setError(null);

        const ok = await submitRating(pendingRatingsCard.id, rating, selectedTags);

        setSubmitting(false);

        if (ok) {
            setSubmitted(true);
            setTimeout(() => setOpen(false), 1200);
        } else {
            setError("Failed to submit rating. Please try again.");
        }
    };

    useEffect(() => {
        if (pendingRatings && pendingRatingsCard) {
            setOpen(true);
        }
    }, [pendingRatings, pendingRatingsCard]);

    if (!pendingRatings || !pendingRatingsCard) return null;

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
                    src={`${pendingRatingsCard.gym_image}`}
                    alt={pendingRatingsCard.gym_name}
                    className="w-[90px] h-[90px] rounded-tl-lg rounded-bl-lg object-cover flex-shrink-0"
                    onError={e => {
                        (e.target as HTMLImageElement).src =
                            "https://placehold.co/90x90/e2e8f0/94a3b8?text=Gym";
                    }}
                />
                <div className="flex flex-col justify-center gap-1">
                    <p className="font-semibold text-gray-900">{pendingRatingsCard.gym_name}</p>
                    <div className="flex items-center gap-1 text-[#0F172A] text-sm">
                        <BsCalendar2 size={11} />
                        <span>{pendingRatingsCard.booking_date} • {pendingRatingsCard.duration_in_hours} hrs</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[#0F172A] text-base font-semibold">
                            ₹{pendingRatingsCard.gym_hourly_rate}/Hr
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

            {error && (
                <p className="text-red-500 text-sm text-center mt-3">
                    {error}
                </p>
            )}
        </BottomSheet>
    );
}