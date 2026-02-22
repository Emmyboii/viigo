import { FiArrowLeft } from "react-icons/fi";
import { FaRegClock } from "react-icons/fa";
import { gyms } from "../data/gyms";
import { useEffect, useState, type JSX } from "react";
import { PiUserGearFill } from "react-icons/pi";
import { HiLocationMarker, HiOutlineLocationMarker, HiShare } from "react-icons/hi";
import ImageCarousel from "./ImageCarousel";
import Footer from "./Footer";
import BottomSheet from "./BottomSheet";
import { useNavigate } from "react-router";

type Day = {
    day: string;
    open: boolean;
};

interface GymDetailsProps {
    setDisplay: React.Dispatch<React.SetStateAction<"details" | "edit">>;
}

export default function GymDetails({ setDisplay }: GymDetailsProps) {

    const navigate = useNavigate();

    const [days, setDays] = useState<Day[]>([
        { day: "Mon, 12th Oct", open: true },
        { day: "Tue, 13th Oct", open: true },
        { day: "Wed, 14th Oct", open: false },
        { day: "Thu, 15th Oct", open: true },
        { day: "Fri, 16th Oct", open: true },
    ]);

    const toggleDay = (index: number) => {
        setDays((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, open: !item.open } : item
            )
        );
    };

    const gym = gyms[0];


    const [amenitiesOpen, setAmenitiesOpen] = useState(false);
    const [rulesOpen, setRulesOpen] = useState(false);



    const tagIcons: Record<string, JSX.Element> = {
        "Hourly Access": <FaRegClock size={12} />,
        "Beginner Friend": <PiUserGearFill size={12} />,
    };

    useEffect(() => {
        if (amenitiesOpen || rulesOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "auto"
        }

        return () => {
            document.body.style.overflow = "auto"
        }
    }, [amenitiesOpen, rulesOpen])

    if (!gym) return <div className="p-4">Gym not found</div>;

    const visibleAmenities = gym.amenities.slice(0, 4);
    const visibleRules = gym.rules.slice(0, 3);
    return (
        <div className="min-h-screen pb-28">

            {/* HEADER */}
            <div className="flex items-center justify-between px-4 py-3 bg-white">
                <div className="flex items-center gap-2">
                    <FiArrowLeft onClick={() => navigate(-1)} size={20} />
                    <p className="font-medium">Your Gym Details</p>
                </div>
                <HiShare size={20} />
            </div>

            {/* IMAGE */}
            <ImageCarousel images={gym.images} height="h-60" />

            {/* CONTENT */}
            <div className="bg-white p-4 px-5 space-y-6 mb-10">

                {/* Gym Name */}
                <div>
                    <h1 className="text-xl font-bold">{gym.name}</h1>

                    <div className="flex items-center justify-between gap-2">

                        <div className="flex items-center text-sm text-gray-500 mt-1 gap-1">
                            <HiLocationMarker size={14} />
                            <span>{gym.distance}</span>
                            <span>•</span>
                            <span>Open Till {gym.closeTime}</span>
                        </div>

                        {/* Call & Map Buttons */}
                        <div className="flex gap-3 mt-3">
                            {/* <div className="bg-[#F1F5F9] text-[#94A3B8] p-2 rounded-lg">
                            <MdPhone size={16} />
                        </div> */}
                            <div className="bg-[#F1F5F9] text-[#94A3B8] p-2 rounded-lg">
                                <HiOutlineLocationMarker size={16} />
                            </div>
                        </div>

                    </div>

                    {/* Tags */}
                    <div className="flex gap-2 mt-3 flex-wrap">
                        {gym.tags.map((tag, i) => (
                            <span
                                key={i}
                                className="flex items-center gap-1 bg-blue-100 text-blue-600 text-xs px-3 py-2 rounded-full"
                            >
                                {tagIcons[tag]}
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="border border-dashed border-[#CBD5E1]"></div>

                {/* ===== Amenities ===== */}
                <div>
                    <h2 className="text-lg font-semibold mb-3">
                        What’s Included
                    </h2>

                    <div className="space-y-3">
                        {visibleAmenities.map((item, i) => (
                            <p key={i} className="text-sm text-gray-700">
                                {item}
                            </p>
                        ))}
                    </div>

                    {gym.amenities.length > 4 && (
                        <button
                            onClick={() => setAmenitiesOpen(true)}
                            className="mt-4 w-full bg-gray-100 py-3 rounded-xl text-[#94A3B8] font-medium"
                        >
                            Show all {gym.amenities.length} amenities
                        </button>
                    )}
                </div>

                <div className="border border-dashed border-[#CBD5E1]"></div>

                {/* ===== Rules ===== */}
                <div>
                    <h2 className="text-lg font-semibold mb-3">
                        Things to Keep in Mind
                    </h2>

                    <div className="space-y-2 text-sm text-gray-600">
                        {visibleRules.map((rule, i) => (
                            <p key={i}>
                                {i + 1}. {rule}
                            </p>
                        ))}
                    </div>

                    {gym.rules.length > 3 && (
                        <button
                            onClick={() => setRulesOpen(true)}
                            className="mt-4 w-full bg-gray-100 py-3 rounded-xl mb-10 text-[#94A3B8] font-medium"
                        >
                            View all rules
                        </button>
                    )}
                </div>

                <hr />

                {/* TIMINGS */}
                <Section title="Manage Gym Timings">
                    <div className="bg-white rounded-xl border p-3 space-y-3">
                        {days.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between py-2"
                            >
                                <p className="text-sm font-semibold text-[#0F172A]">{item.day}</p>

                                {/* Toggle */}
                                <button
                                    onClick={() => toggleDay(index)}
                                    className={`relative w-16 h-7 rounded-full transition duration-300 ${item.open
                                        ? "bg-[#22C55E] border border-[#22C55E]"
                                        : "bg-[#94A3B8]"
                                        }`}
                                >
                                    {/* Text inside colored track */}
                                    <span
                                        className={`absolute inset-0 flex items-center text-[10px] font-semibold px-2 ${item.open ? "justify-start text-white" : "justify-end text-white"
                                            }`}
                                    >
                                        {item.open ? "Open" : "Closed"}
                                    </span>

                                    {/* White knob */}
                                    <div
                                        className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${item.open ? "right-1" : "left-1"
                                            }`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </Section>
            </div>

            {/* FOOTER FIXED */}
            <div className="fixed bottom-14 left-0 right-0 bg-white border-t border-[#F1F5F9] px-4 py-3 flex items-center justify-between">
                <div>
                    <p className="text-xs text-gray-500">Your Gym Price Per hour</p>
                    <p className="font-semibold text-lg">₹410/1.5Hrs</p>
                </div>

                <button onClick={() => {
                    setDisplay("edit")
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }} className="bg-blue-600 text-white px-5 py-2 rounded-md h-[50px]">
                    Edit Gym Details
                </button>
            </div>

            <Footer />

            {/* ===== Amenities Bottom Sheet ===== */}
            <BottomSheet
                open={amenitiesOpen}
                onClose={() => setAmenitiesOpen(false)}
                title="What This Place Offers"
            >
                {gym.amenities.map((item, i) => (
                    <p key={i} className="mb-3 text-sm">
                        {item}
                    </p>
                ))}
            </BottomSheet>

            {/* ===== Rules Bottom Sheet ===== */}
            <BottomSheet
                open={rulesOpen}
                onClose={() => setRulesOpen(false)}
                title="Things to Know"
            >
                {gym.rules.map((rule, i) => (
                    <p key={i} className="mb-3 text-sm">
                        {i + 1}. {rule}
                    </p>
                ))}
            </BottomSheet>
        </div>
    );
}

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <h3 className="font-semibold text-base text-[#0F172A] mb-2">{title}</h3>
            {children}
        </div>
    );
}