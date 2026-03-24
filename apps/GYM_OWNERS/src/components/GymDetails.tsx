import { FiArrowLeft } from "react-icons/fi";
// import { FaRegClock } from "react-icons/fa";
import { useCallback, useEffect, useMemo, useState, type JSX } from "react";
// import { PiUserGearFill } from "react-icons/pi";
import { HiLocationMarker, HiOutlineLocationMarker, HiShare, HiUserAdd } from "react-icons/hi";
import ImageCarousel from "./ImageCarousel";
import Footer from "./Footer";
import BottomSheet from "./BottomSheet";
import { useNavigate } from "react-router";
import { FaCircleCheck } from "react-icons/fa6";
import { MdError } from "react-icons/md";
import logoUrl from "../assets/icon2.png";
import html2canvas from "html2canvas";
import { FaRegClock } from "react-icons/fa";

type ToastType = "success" | "error" | null;

interface Amenity {
    id: number;
    name: string;
    icon: string;
}

interface Rule {
    id: number;
    description: string;
}

interface CalendarAvailability {
    date: string;
    is_open: boolean;
}

interface GymType {
    id: string;
    name: string;
    hourly_rate: string;
    phone_number: string;
    location: string;
    distance: string;
    address_line_1: string,
    area: string,
    city: string,
    state: string,
    postal_code: string,
    open_time: string;
    close_time: string;
    longitude: string;
    latitude: string;
    amenities: Amenity[];
    rules: Rule[];
    images: { id: number; image: string }[];

    peak_morning?: [string, string][];
    peak_evening?: [string, string][];
    calendar_availability?: CalendarAvailability[]

    owner_email: string
}

interface GymDetailsProps {
    display: string,
    gym?: GymType | null;
    setDisplay: React.Dispatch<React.SetStateAction<"details" | "edit" | "create">>;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function GymDetails({ gym, setDisplay }: GymDetailsProps) {
    const navigate = useNavigate();

    const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

    const tags = ["Hourly Access", "Beginner Friendly"];

    const tagIcons: Record<string, JSX.Element> = {
        // "Premium": <MdStar size={14} />,
        "Hourly Access": <FaRegClock size={14} />,
        "Beginner Friendly": <HiUserAdd size={14} />,
    };

    const handleShare = async () => {
        const element = document.getElementById("share-area");
        const bottomBar = document.getElementById("share-bottom-bar");

        if (!element) return;

        if (bottomBar) {
            bottomBar.style.position = "relative";
            bottomBar.style.bottom = "0px";
        }

        try {
            await document.fonts.ready;

            const canvas = await html2canvas(element, {
                useCORS: true,
                allowTaint: false,
                scrollX: 0,
                scrollY: -window.scrollY,
                windowWidth: document.documentElement.clientWidth,
                windowHeight: document.documentElement.clientHeight,
                scale: 2,
            });

            const finalCanvas = document.createElement("canvas");
            const ctx = finalCanvas.getContext("2d");
            if (!ctx) return;

            const headerHeight = 100;
            const padding = 40; // 👈 adjust spacing here

            // ✅ Increase canvas size
            finalCanvas.width = canvas.width + padding * 2;
            finalCanvas.height = canvas.height + headerHeight + padding * 2;

            // 🔵 Header background (include padding)
            ctx.fillStyle = "#2563EB";
            ctx.fillRect(0, 0, finalCanvas.width, headerHeight + padding);

            // 🧠 Logo
            const logo = new Image();
            logo.src = logoUrl;

            await new Promise((resolve) => {
                logo.onload = resolve;
                logo.onerror = resolve;
            });

            const maxLogoHeight = 40;
            const logoRatio = logo.width / logo.height;
            const logoWidth = maxLogoHeight * logoRatio;
            const logoHeight = maxLogoHeight;

            // Text
            const text = "Viigo";
            ctx.font = "bold 50px sans-serif";
            ctx.fillStyle = "#fff";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";

            const textWidth = ctx.measureText(text).width;
            const gap = 20;

            // ✅ Center properly (with padding accounted)
            const totalWidth = logoWidth + gap + textWidth;
            const startX = (finalCanvas.width - totalWidth) / 2;

            // Draw logo
            ctx.drawImage(
                logo,
                startX,
                (headerHeight + padding - logoHeight) / 2,
                logoWidth,
                logoHeight
            );

            // Draw text
            ctx.fillText(
                text,
                startX + logoWidth + gap,
                (headerHeight + padding) / 2
            );

            // 🖼 Draw content with padding offset
            ctx.drawImage(canvas, padding, headerHeight + padding);

            const dataUrl = finalCanvas.toDataURL("image/png");

            // ✅ Share or fallback to download
            if (navigator.share) {
                await navigator.share({
                    title: "Viigo Gym Share",
                    text: "Check out my gym!",
                    url: dataUrl,
                });
            } else {
                const link = document.createElement("a");
                link.href = dataUrl;
                link.download = "viigo-gym.png";
                link.click();
            }
        } catch (err) {
            console.error("Share failed:", err);
        }

        if (bottomBar) {
            bottomBar.style.position = "fixed";
            bottomBar.style.bottom = "3.5rem";
        }
    };

    const initialAvailability = useMemo(() => {
        if (!gym) return [];

        const today = new Date();
        const endDate = new Date();
        // endDate.setMonth(today.getMonth() + 1);
        endDate.setDate(today.getDate() + 4)

        const backendMap = new Map(
            gym?.calendar_availability?.map((item) => [
                item.date,
                item.is_open,
            ]) || []
        );

        const dates: { date: string; is_open: boolean }[] = [];
        const current = new Date(today);

        while (current <= endDate) {
            const formatted = current.toISOString().split("T")[0];

            dates.push({
                date: formatted,
                is_open: backendMap.has(formatted)
                    ? backendMap.get(formatted)!
                    : true,
            });

            current.setDate(current.getDate() + 1);
        }

        return dates;
    }, [gym]);

    function formatTime12Hour(time24: string) {
        const [hourStr, minuteStr] = time24.split(":");
        let hour = Number(hourStr);
        const minute = minuteStr;
        const ampm = hour >= 12 ? "PM" : "AM";

        hour = hour % 12;
        if (hour === 0) hour = 12;

        return `${hour}:${minute} ${ampm}`;
    }

    const [availability, setAvailability] = useState<
        { date: string; is_open: boolean }[]
    >([]);


    useEffect(() => {
        setAvailability(initialAvailability);
    }, [initialAvailability]);

    const toggleDate = async (index: number) => {
        if (!gym) return;

        const originalItem = availability[index];
        const updatedItem = { ...originalItem, is_open: !originalItem.is_open };

        // Optimistic UI update
        const updated = availability.map((item, i) =>
            i === index ? updatedItem : item
        );
        setAvailability(updated);

        try {
            const res = await fetch(`${backendUrl}/gymowner/gyms/${gym.id}/`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...gym,
                    amenities: gym.amenities.map(a => a.id),
                    rules: gym.rules.map(r => r.id),
                    availability_data: [updatedItem],
                }),
            });

            if (!res.ok) throw new Error("Failed to update availability");

            setToast({
                type: "success",
                message: `Gym is now ${updatedItem.is_open ? "Open" : "Closed"
                    } on ${new Date(updatedItem.date).toDateString()}`
            });
        } catch (err) {
            console.error("Failed to update availability", err);

            // Revert back
            setAvailability((prev) =>
                prev.map((item, i) =>
                    i === index ? originalItem : item
                )
            );

            setToast({
                type: "error",
                message: "Failed to update availability, please try again",
            });
        }
    };

    const [amenitiesOpen, setAmenitiesOpen] = useState(false);
    const [rulesOpen, setRulesOpen] = useState(false);



    // const tagIcons: Record<string, JSX.Element> = {
    //     "Hourly Access": <FaRegClock size={12} />,
    //     "Beginner Friend": <PiUserGearFill size={12} />,
    // };

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

    const handleToastClose = useCallback(() => {
        setToast(null);
    }, []);

    if (!gym) {
        return <div className="p-4">Gym not found</div>;
    }

    const visibleAmenities = gym?.amenities?.slice(0, 4);
    const visibleRules = gym?.rules?.slice(0, 3);

    return (
        <div className="min-h-screen pb-28">

            {/* HEADER */}
            <div className="flex items-center justify-between px-4 py-3 bg-white">
                <div className="flex items-center gap-2">
                    <FiArrowLeft onClick={() => navigate(-1)} size={20} />
                    <p className="font-medium text-lg">Your Gym Details</p>
                </div>
                <HiShare onClick={handleShare} size={20} className="text-[#475569]" />
            </div>

            <div id="share-area" className="min-h-screen bg-white">


                {/* IMAGE */}
                <ImageCarousel
                    images={gym?.images}
                    height="h-48"
                />

                {toast && <Toast type={toast.type} text={toast.message} onClose={handleToastClose} />}

                {/* CONTENT */}
                <div className="bg-white p-4 px-5 space-y-6 mb-10">

                    {/* Gym Name */}
                    <div>
                        <div className="flex items-center justify-between gap-3 w-full">
                            <div className="w-full">
                                <div className="flex justify-between items-center gap-3">
                                    <h1 className="text-xl font-bold text-[#0F172A]">{gym.name}</h1>

                                    <div
                                        className="bg-[#DBEAFE] text-[#2563EB] p-2 rounded cursor-pointer transition"
                                    >
                                        <HiOutlineLocationMarker size={16} />
                                    </div>

                                </div>

                                <div className="flex flex-wrap items-center text-xs text-[#475569] gap-1">
                                    <HiLocationMarker size={14} />
                                    <span>{gym?.distance} {gym?.area}</span>
                                    <span>•</span>
                                    <span>Open Till</span>
                                    <span>{formatTime12Hour(gym?.close_time)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="flex gap-2 mt-5 flex-wrap">
                            {tags.map((tag, i) => (
                                <span
                                    key={i}
                                    className="flex items-center gap-1 bg-[#DBEAFE] text-[#2563EB] text-xs px-3 py-2 rounded-full"
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
                            {visibleAmenities.map((item) => (
                                <div key={item.id} className="flex items-center gap-2">
                                    <img src={item.icon} alt={item.name} className="w-4 h-4" />
                                    <p className="text-sm text-gray-700">
                                        {item.name}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {gym.amenities.length > 4 && (
                            <button
                                onClick={() => setAmenitiesOpen(true)}
                                className="mt-4 w-full bg-[#DBEAFE] py-3 rounded-xl text-[#2563EB] font-medium"
                            >
                                Show all {gym?.amenities.length} amenities
                            </button>
                        )}
                    </div>

                    <div className="border border-dashed border-[#CBD5E1]"></div>

                    {/* ===== Rules ===== */}
                    <div>
                        <h2 className="text-lg font-semibold mb-3">
                            Rules
                        </h2>

                        <div className="space-y-2 text-sm text-gray-600">
                            {visibleRules.map((rule, i) => (
                                <p key={`${rule.id}-${i}`}>
                                    {i + 1}. {rule.description}
                                </p>
                            ))}
                        </div>

                        {gym.rules.length > 3 && (
                            <button
                                onClick={() => setRulesOpen(true)}
                                className="mt-4 w-full bg-[#DBEAFE] py-3 mb-2 rounded-xl text-[#2563EB] font-medium"
                            >
                                View all rules
                            </button>
                        )}
                    </div>


                    {/* TIMINGS */}
                    <Section title="Manage Gym Availability">
                        <div className="bg-white rounded-xl border p-3 h-[300px] overflow-y-auto space-y-3">

                            {availability.map((item, index) => (
                                <div
                                    key={item.date}
                                    className="flex items-center justify-between py-2"
                                >
                                    <p className="text-sm font-semibold text-[#0F172A]">
                                        {new Date(item.date).toDateString()}
                                    </p>

                                    <button
                                        onClick={() => toggleDate(index)}
                                        className={`relative w-16 h-7 rounded-full transition duration-300 ${item.is_open
                                            ? "bg-[#22C55E] border border-[#22C55E]"
                                            : "bg-[#94A3B8]"
                                            }`}
                                    >
                                        <span
                                            className={`absolute inset-0 flex items-center text-[10px] font-semibold px-2 ${item.is_open
                                                ? "justify-start text-white"
                                                : "justify-end text-white"
                                                }`}
                                        >
                                            {item.is_open ? "Open" : "Closed"}
                                        </span>

                                        <div
                                            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${item.is_open ? "right-1" : "left-1"
                                                }`}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Section>
                </div>

                {/* FOOTER FIXED */}
                <div id="share-bottom-bar" className="fixed bottom-14 left-0 right-0 bg-white border-t border-[#F1F5F9] px-4 py-3 pb-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500">Your Gym Price Per hour</p>
                        <p className="font-semibold text-[22px]">
                            ₹{gym?.hourly_rate}/Hr
                        </p>
                    </div>

                    <button onClick={() => {
                        setDisplay("edit")
                        localStorage.setItem("gymDisplay", "edit");
                        // navigate('/gym/edit')
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }} className="bg-blue-600 text-white px-5 text-sm font-semibold w-[170px] py-2 rounded-md h-[50px]">
                        Edit Gym Details
                    </button>
                </div>

            </div>


            <Footer />

            {/* ===== Amenities Bottom Sheet ===== */}
            <BottomSheet
                open={amenitiesOpen}
                onClose={() => setAmenitiesOpen(false)}
                title="What This Place Offers"
            >
                {gym?.amenities.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                        <img src={item.icon} alt={item.name} className="w-4 h-4" />
                        <p key={item.id} className="mb-3 text-sm">
                            {item.name}
                        </p>
                    </div>
                ))}
            </BottomSheet>

            {/* ===== Rules Bottom Sheet ===== */}
            <BottomSheet
                open={rulesOpen}
                onClose={() => setRulesOpen(false)}
                title="Things to Know"
            >
                {gym?.rules.map((rule, i) => (
                    <p key={rule.id} className="mb-3 text-sm">
                        {i + 1}. {rule.description}
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
            <p className="text-xs text-[#0F172A] mb-4">Turn your gym ON or OFF for the upcoming dates. Control bookings in advance and avoid last-minute confusion.</p>
            {children}
        </div>
    );
}

function Toast({ text, type, onClose }: { text: string; type: ToastType; onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const isSuccess = type === "success";

    return (
        <div
            className={`fixed w-[280px] bottom-20 z-50 left-1/2 justify-center -translate-x-1/2 
      bg-white px-4 py-3 rounded-lg flex items-center gap-3
      shadow-[0_10px_40px_rgba(0,0,0,0.18)] animate-[fadeIn_0.2s_ease-out]`}
        >
            <span className={`text-xl ${isSuccess ? "text-green-500" : "text-red-500"}`}>
                {isSuccess ? <FaCircleCheck /> : <MdError />}
            </span>
            <p className="text-sm font-medium">{text}</p>
        </div>
    );
}