import { FiArrowLeft } from "react-icons/fi";
// import { FaRegClock } from "react-icons/fa";
import { useCallback, useEffect, useMemo, useState, type JSX } from "react";
// import { PiUserGearFill } from "react-icons/pi";
import { HiLocationMarker, HiShare, HiUserAdd } from "react-icons/hi";
import ImageCarousel from "./ImageCarousel";

import BottomSheet from "./BottomSheet";
import { useNavigate } from "react-router";
import { FaCircleCheck } from "react-icons/fa6";
import { MdError } from "react-icons/md";
import logoUrl from "../assets/icon2.png";
import edit from "../assets/edit.png";
// import * as htmlToImage from "html-to-image";
import { FaRegClock } from "react-icons/fa";
import { normalizeImagePath } from "../context/AppContext";
import { snapdom } from "@zumer/snapdom";

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
    gender_preference: "EVERYONE" | "WOMEN_ONLY" | "MEN_ONLY"
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

    peak_morning?: ([string, string] | { start: string; end: string })[];
    peak_evening?: ([string, string] | { start: string; end: string })[];
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

        // Save original styles
        if (bottomBar) {

            bottomBar.style.position = "relative";
            bottomBar.style.bottom = "0px";
        }
        try {
            await document.fonts.ready;

            // 🧠 SNAPDOM (replaces html-to-image)
            const canvasEl = await snapdom.toCanvas(element, {
                scale: 2, // similar to pixelRatio
                backgroundColor: "#ffffff",
            });

            const baseImage = new Image();
            baseImage.src = canvasEl.toDataURL("image/png");

            await new Promise((res) => {
                baseImage.onload = res;
            });

            // 🎨 FINAL CANVAS
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Adjust header height dynamically if needed
            const headerHeight = 150 * 3; // taller header for bigger logo/text

            canvas.width = baseImage.width;
            canvas.height = baseImage.height + headerHeight;

            // 🔷 Gradient header
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, "#2563EB");
            gradient.addColorStop(1, "#3B82F6");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, headerHeight);

            // 🧠 Logo
            const logo = new Image();
            logo.crossOrigin = "anonymous";
            logo.src = logoUrl;
            await new Promise((res) => { logo.onload = res; logo.onerror = res; });

            // Scale logo bigger
            const logoHeight = 80 * 3; // bigger than before
            const logoWidth = logoHeight * (logo.width / logo.height);

            // 🧠 Text
            const text = "Viigo";
            ctx.font = `bold ${70 * 3}px sans-serif`; // larger font
            ctx.fillStyle = "#fff";

            // Center logo + text horizontally
            const textWidth = ctx.measureText(text).width;
            const gap = 20;
            const totalWidth = logoWidth + gap + textWidth;
            const startX = (canvas.width - totalWidth) / 2;

            // Draw logo
            ctx.drawImage(
                logo,
                startX,
                (headerHeight - logoHeight) / 2, // vertically center
                logoWidth,
                logoHeight
            );

            // Draw text vertically centered
            ctx.textBaseline = "middle";
            ctx.fillText(
                text,
                startX + logoWidth + gap,
                headerHeight / 2
            );

            // 🖼 Draw main content
            ctx.drawImage(baseImage, 0, headerHeight);

            // 📦 Export
            // const finalUrl = canvas.toDataURL("image/png");
            const blob = await new Promise<Blob | null>((resolve) =>
                canvas.toBlob(resolve, "image/png")
            );

            if (blob) {
                const file = new File([blob], "viigo-share.png", { type: "image/png" });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: "Viigo Gym Share",
                        text: "Check out my gym!",
                        files: [file],
                    });
                } else {
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(file);;
                    link.download = "viigo-gym.png";
                    link.click();
                }
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
        if ((amenitiesOpen || rulesOpen) && window.innerWidth < 850) {
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

    // Open Amenities Modal
    const openAmenities = () => {
        setAmenitiesOpen(true);
        window.history.pushState({ modal: "amenities" }, "", window.location.pathname);
    };

    // Close Amenities Modal
    const closeAmenities = () => {
        setAmenitiesOpen(false);
        if (window.history.state?.modal === "amenities") window.history.back();
    };

    // Open Rules Modal
    const openRules = () => {
        setRulesOpen(true);
        window.history.pushState({ modal: "rules" }, "", window.location.pathname);
    };

    // Close Rules Modal
    const closeRules = () => {
        setRulesOpen(false);
        if (window.history.state?.modal === "rules") window.history.back();
    };

    useEffect(() => {
        const handlePopState = (e: PopStateEvent) => {
            const modal = e.state?.modal;

            // Close all modals by default
            setAmenitiesOpen(false);
            setRulesOpen(false);

            // Open modal if state exists
            if (modal === "amenities") setAmenitiesOpen(true);
            if (modal === "rules") setRulesOpen(true);

            // Restore display state if included
            if (e.state?.display) {
                setDisplay(e.state.display as "details" | "edit" | "create");
            } else {
                // default to details if no display state
                setDisplay("details");
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [setDisplay]);

    if (!gym) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center animate-fadeIn">

                    {/* Icon */}
                    <div className="text-3xl mb-3">⚠️</div>

                    {/* Title */}
                    <h2 className="text-xl font-semibold text-[#0F172A] mb-2">
                        Gym not found
                    </h2>

                    {/* Description */}
                    <p className="text-sm text-[#475569] mb-6">
                        We couldn’t find the gym you’re looking for. It might have been removed or there was a temporary issue.
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                        >
                            Refresh
                        </button>

                        {/* <button
                            onClick={() => window.history.back()}
                            className="border border-[#CBD5E1] text-[#475569] px-5 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
                        >
                            Go Back
                        </button> */}
                    </div>
                </div>
            </div>
        );
    }

    const visibleAmenities = gym?.amenities?.slice(0, 4);
    const visibleAmenities2 = gym?.amenities?.slice(0, 9);
    const visibleRules = gym?.rules?.slice(0, 3);
    const visibleRules2 = gym?.rules?.slice(0, 9);

    return (
        <div className="min-h-screen pb-28 mk:pb-0 mk:bg-[#CBD5E1] max-w-[1900px] mx-auto">

            {/* HEADER */}
            <div className="flex items-center justify-between px-4 py-3 mk:py-4 mk:px-5 bg-white">
                <div className="flex items-center gap-2">
                    <FiArrowLeft onClick={() => navigate(-1)} size={20} className="mk:hidden" />
                    <p className="font-medium text-lg mk:block hidden">Gym Details</p>
                    <p className="font-medium text-lg block mk:hidden">Your Gym Details</p>
                </div>
                <HiShare onClick={handleShare} size={20} className="text-[#475569] mk:hidden" />

                <button onClick={() => {
                    setDisplay("edit")
                    localStorage.setItem("gymDisplay", "edit");
                    // navigate('/gym/edit')
                    window.history.pushState({ display: "edit" }, "", window.location.pathname);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }} className="bg-blue-600 text-white px-5 text-sm font-semibold w-[150px] mr-14 py-2 rounded-md h-[50px] hidden mk:flex items-center justify-center gap-2">
                    <img src={edit} className="size-[16px]" alt="" />
                    Edit Details
                </button>
            </div>

            <div id="share-area" className="min-h-screen mk:min-h-0 bg-white mk:bg-transparent">

                <div className="mk:rounded-lg mk:border-t mk:border-b border-[#E2E8F0] bg-white">
                    {/* IMAGE */}
                    <div className="mk:pt-5">
                        <ImageCarousel
                            images={gym.images.map(img => ({
                                ...img,
                                image: normalizeImagePath(img.image)
                            }))}
                            height="h-48 mk:h-80"
                        />
                    </div>

                    {toast && <Toast type={toast.type} text={toast.message} onClose={handleToastClose} />}

                    {/* CONTENT */}
                    <div className="bg-white p-4 px-5 space-y-6 mb-3">

                        {/* Gym Name */}
                        <div>
                            <div className="flex items-center justify-between gap-3 w-full">
                                <div className="w-full">
                                    <div className="flex justify-between items-center gap-3">
                                        <h1 className="text-xl font-bold text-[#0F172A] text-nowrap">{gym.name}</h1>

                                        {/* <div
                                        className="bg-[#DBEAFE] text-[#2563EB] p-2 rounded cursor-pointer transition"
                                    >
                                        <HiOutlineLocationMarker size={16} />
                                    </div> */}

                                    </div>

                                    <div className="flex flex-wrap items-center text-xs text-[#475569] gap-1 text-nowrap">
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
                                        className="flex items-center gap-1 text-nowrap bg-[#DBEAFE] text-[#2563EB] text-xs px-3 py-2 rounded-full"
                                    >
                                        {tagIcons[tag]}
                                        <span className="text-nowrap">
                                            {tag}
                                        </span>
                                    </span>
                                ))}
                            </div>

                            <div className="mk:block hidden mt-5 space-y-2">
                                <p className="text-xs font-medium text-gray-500">Your Gym Price Per hour</p>
                                <p className="font-semibold text-[22px]">
                                    ₹{gym?.hourly_rate}/Hr
                                </p>
                            </div>
                        </div>

                        <div className="border border-dashed border-[#CBD5E1] mk:hidden"></div>

                        {/* ===== Amenities ===== */}
                        <div className="mk:hidden">
                            <h2 className="text-lg font-semibold mb-3">
                                What’s Included
                            </h2>

                            <div className="space-y-3">
                                {visibleAmenities.map((item) => (
                                    <div key={item.id} className="flex items-center gap-2">
                                        <img src={`https://api.viigo.in/${normalizeImagePath(item?.icon)}`} alt={item.name} className="w-3 h-3" />
                                        <p className="text-sm text-gray-700">
                                            {item.name}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {gym.amenities.length > 4 && (
                                <button
                                    onClick={openAmenities}
                                    className="mt-4 w-full bg-[#DBEAFE] py-3 rounded-xl text-[#2563EB] font-medium"
                                >
                                    Show all {gym?.amenities.length} amenities
                                </button>
                            )}
                        </div>

                        <div className="border border-dashed border-[#CBD5E1] mk:hidden"></div>

                        {/* ===== Rules ===== */}
                        <div className="mk:hidden">
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
                                    onClick={openRules}
                                    className="mt-4 w-full bg-[#DBEAFE] py-3 mb-2 rounded-xl text-[#2563EB] font-medium"
                                >
                                    View all rules
                                </button>
                            )}
                        </div>


                        {/* TIMINGS */}
                        <Section title="Manage Gym Availability">
                            <div className="bg-white rounded-xl border p-3 h-[300px] overflow-y-auto space-y-3 mb-8">

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
                </div>

                <div className="lj:flex mk:grid lg:grid-cols-2 items-stretch p-10 justify-between gap-6 hidden">
                    {/* TIMINGS */}
                    <Section2 title="Manage Gym Availability">
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
                    </Section2>

                    {/* ===== Amenities ===== */}
                    <div className="lj:w-[70%] w-full bg-white p-6 rounded-lg flex flex-col relative">
                        <h2 className="text-lg font-semibold mb-3">
                            What’s Included
                        </h2>

                        <div className="flex-1">
                            <div className="space-y-3">
                                {visibleAmenities2.map((item) => (
                                    <div key={item.id} className="flex items-center gap-2">
                                        <img src={`https://api.viigo.in/${normalizeImagePath(item?.icon)}`} alt={item.name} className="w-3 h-3" />
                                        <p className="text-sm text-gray-700">
                                            {item.name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {gym.amenities.length > 4 && (
                            <button
                                onClick={openAmenities}
                                className="mt-4 w-full bg-[#DBEAFE] py-3 rounded-xl text-[#2563EB] font-medium"
                            >
                                Show all {gym?.amenities.length} amenities
                            </button>
                        )}

                        <BottomSheet
                            open={amenitiesOpen}
                            onClose={closeAmenities}
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
                    </div>

                    {/* ===== Rules ===== */}
                    <div className="w-full bg-white p-6 rounded-lg flex flex-col relative">
                        <h2 className="text-lg font-semibold mb-3">
                            Rules
                        </h2>

                        <div className="flex-1">
                            <div className="space-y-2 text-sm text-gray-600">
                                {visibleRules2.map((rule, i) => (
                                    <p key={`${rule.id}-${i}`}>
                                        {i + 1}. {rule.description}
                                    </p>
                                ))}
                            </div>
                        </div>

                        {gym.rules.length > 3 && (
                            <button
                                onClick={openRules}
                                className="mt-4 w-full bg-[#DBEAFE] py-3 mb-2 rounded-xl text-[#2563EB] font-medium"
                            >
                                View all rules
                            </button>
                        )}

                        <BottomSheet
                            open={rulesOpen}
                            onClose={closeRules}
                            title="Things to Know"
                        >
                            {gym?.rules.map((rule, i) => (
                                <p key={rule.id} className="mb-3 text-sm">
                                    {i + 1}. {rule.description}
                                </p>
                            ))}
                        </BottomSheet>
                    </div>
                </div>

                {/* FOOTER FIXED */}
                <div id="share-bottom-bar" className="fixed mk:hidden bottom-14 left-0 right-0 bg-white border-t border-[#F1F5F9] px-4 py-3 pb-8 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500 text-nowrap">Your Gym Price Per hour</p>
                        <p className="font-semibold text-[22px] text-nowrap">
                            ₹{gym?.hourly_rate}/Hr
                        </p>
                    </div>

                    <button onClick={() => {
                        setDisplay("edit")
                        localStorage.setItem("gymDisplay", "edit");
                        // navigate('/gym/edit')
                        window.history.pushState({ display: "edit" }, "", window.location.pathname);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }} className="bg-blue-600 text-white px-5 text-sm font-semibold w-[170px] py-2 rounded-md h-[50px]">
                        Edit Gym Details
                    </button>
                </div>

            </div>




            {/* ===== Amenities Bottom Sheet ===== */}
            <div className="mk:hidden">
                <BottomSheet
                    open={amenitiesOpen}
                    onClose={closeAmenities}
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
            </div>


            <div className="mk:hidden">
                {/* ===== Rules Bottom Sheet ===== */}
                <BottomSheet
                    open={rulesOpen}
                    onClose={closeRules}
                    title="Things to Know"
                >
                    {gym?.rules.map((rule, i) => (
                        <p key={rule.id} className="mb-3 text-sm">
                            {i + 1}. {rule.description}
                        </p>
                    ))}
                </BottomSheet>
            </div>

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
        <div className="mk:hidden">
            <h3 className="font-semibold text-base text-[#0F172A] mb-2">{title}</h3>
            <p className="text-xs text-[#0F172A] mb-4">Turn your gym ON or OFF for the upcoming dates. Control bookings in advance and avoid last-minute confusion.</p>
            {children}
        </div>
    );
}

function Section2({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="lj:w-[70%] w-full bg-white p-6 rounded-lg flex flex-col h-full">
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