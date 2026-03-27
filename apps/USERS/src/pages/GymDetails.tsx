import { useNavigate, useParams } from "react-router-dom";
import BottomSheet from "../components/BottomSheet";
import ImageCarousel from "../components/ImageCarousel";
import { useEffect, useState, type JSX } from "react";
import logoUrl from "../assets/icon2.png";
import {
    IoInformationCircleOutline,
    IoWarningOutline,
} from "react-icons/io5";
import { HiLocationMarker, HiOutlineLocationMarker, HiUserAdd } from "react-icons/hi";
// import { FaRegClock } from "react-icons/fa6";
// import { PiUserGearFill } from "react-icons/pi";
import Footer from "../components/Footer";
import { MdPhone } from "react-icons/md";
// import PickHoursSheet from "../components/PickHoursSheet";
import PageHeader from "../components/PageHeader";
// import { FaRegEdit } from "react-icons/fa";
import { normalizeImagePath, useAppContext, type GymCard } from "../context/AppContext";
import type { Gym } from "../components/types/gym";
// import * as htmlToImage from "html-to-image";
import { FaRegClock } from "react-icons/fa";
import { snapdom } from "@zumer/snapdom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function GymDetails() {

    const { gyms } = useAppContext()

    const navigate = useNavigate();

    const { slug } = useParams();

    const [gym, setGym] = useState<GymCard | null>(null);
    const [loading, setLoading] = useState(true);

    const [amenitiesOpen, setAmenitiesOpen] = useState(false);
    const [rulesOpen, setRulesOpen] = useState(false);
    const [priceBreakdownOpen, setPriceBreakdownOpen] = useState(false);

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
            const finalUrl = canvas.toDataURL("image/png");
            const blob = await (await fetch(finalUrl)).blob();

            const file = new File(
                [blob],
                `${gym?.name || "gym"}-Viigo.png`,
                { type: "image/png" }
            );

            const shareText = `${gym?.name}\n\nMore info: https://viigousers.vercel.app/gyms/${gym?.slug}`;

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], text: shareText });
            } else {
                window.open(
                    `https://wa.me/?text=${encodeURIComponent(shareText)}`,
                    "_blank"
                );

                const link = document.createElement("a");
                link.href = finalUrl;
                link.download = `${gym?.name || "gym"}.png`;
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

    function formatTime12Hour(time24: string) {
        const [hourStr, minuteStr] = time24.split(":");
        let hour = Number(hourStr);
        const minute = minuteStr;
        const ampm = hour >= 12 ? "PM" : "AM";

        hour = hour % 12;
        if (hour === 0) hour = 12;

        return `${hour}:${minute} ${ampm}`;
    }

    const tags = ["Hourly Access", "Beginner Friendly"];

    const tagIcons: Record<string, JSX.Element> = {
        "Hourly Access": <FaRegClock size={14} />,
        "Beginner Friendly": <HiUserAdd size={14} />,
    };

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

    useEffect(() => {
        if (amenitiesOpen || rulesOpen || priceBreakdownOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "auto"
        }

        return () => {
            document.body.style.overflow = "auto"
        }
    }, [amenitiesOpen, rulesOpen, priceBreakdownOpen, open])

    const handlePhoneClick = () => {
        if (gym?.phone_number) {
            // Open the phone dialer
            window.location.href = `tel:${gym.phone_number}`;
        }
    };

    const handleLocationClick = () => {
        if (!gym) return;

        // Navigate to /explore with coordinates and gym info
        navigate("/explore", {
            state: {
                gym,
                latitude: gym.latitude,
                longitude: gym.longitude,
            }
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4 p-8 bg-white animate-fadeIn">
                    <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-700 text-lg font-medium">
                        Fetching gym details...
                    </p>
                    <p className="text-gray-400 text-sm text-center">
                        This might take a few seconds. Sit tight!
                    </p>
                </div>
            </div>
        );
    }

    if (!gym) return (
        <div className="flex items-center justify-center min-h-screen px-4">
            <div className="flex flex-col items-center gap-6 p-8 bg-white animate-fadeIn max-w-sm text-center">
                <IoWarningOutline className="text-4xl text-yellow-500" />
                <p className="text-gray-800 text-xl font-semibold">
                    Gym Not Found
                </p>
                <p className="text-gray-500 text-sm">
                    Sorry, we couldn’t find the gym you’re looking for. Please check the link or try another search.
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    Go Back
                </button>
            </div>
        </div>
    )

    const visibleAmenities = gym.amenities.slice(0, 4);
    const visibleRules = gym.rules.slice(0, 3);

    return (
        <div className="pb-32 bg-white min-h-screen">

            {/* ===== Header ===== */}
            <PageHeader text="Details" onShare={handleShare} />

            <div className="pt-14" />

            <div id="share-area" className="min-h-screen bg-white">

                {/* ===== Image Carousel ===== */}
                <div className="h-[174px]">
                    <ImageCarousel
                        images={gym.images.map(img => ({
                            ...img,
                            image: normalizeImagePath(img.image)
                        }))}
                    />
                </div>

                {/* ===== Content ===== */}
                <div className="bg-white p-4 space-y-6">

                    {/* Gym Name */}
                    <div>
                        <div className="flex justify-between items-center gap-3 mt-1">
                            <h1 className="text-xl font-bold text-nowrap">{gym.name}</h1>

                            {/* Call & Map Buttons */}
                            <div className="flex gap-3">
                                {/* Phone */}
                                <div
                                    onClick={handlePhoneClick}
                                    className="bg-[#DBEAFE] text-[#2563EB] p-2 rounded cursor-pointer transition"
                                >
                                    <MdPhone size={16} />
                                </div>

                                {/* Location */}
                                <div
                                    onClick={handleLocationClick}
                                    className="bg-[#DBEAFE] text-[#2563EB] p-2 rounded cursor-pointer transition"
                                >
                                    <HiOutlineLocationMarker size={16} />
                                </div>
                            </div>

                        </div>

                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1 leading-none w-full">
                            <HiLocationMarker size={14} className="flex-shrink-0" />
                            <span className="flex items-center gap-1 w-full text-nowrap">
                                <span>{gym.distance} {gym.area}</span>
                                <span>•</span>
                                <span>{gym.open_status || `Open Till ${formatTime12Hour(gym.close_time)}`}</span>
                            </span>
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
                    </div>

                    <div className="border border-dashed border-[#CBD5E1]"></div>

                    {/* ===== Amenities ===== */}
                    <div>
                        <h2 className="text-base font-semibold mb-3">
                            What’s Included
                        </h2>

                        <div className="space-y-3">
                            {visibleAmenities.map((item, i) => (
                                <p key={i} className="text-xs text-[#0F172A] flex items-center gap-2">
                                    <img
                                        src={`https://api.viigo.in/${normalizeImagePath(item?.icon)}`}
                                        alt={item?.name}
                                        className="w-3 h-3 object-contain"
                                    />
                                    {item.name}
                                </p>
                            ))}
                        </div>

                        {gym.amenities.length > 4 && (
                            <button
                                onClick={() => setAmenitiesOpen(true)}
                                className="flex items-center justify-center w-full h-12 mt-6 rounded-md bg-blue-100 text-blue-400 font-semibold text-sm"
                            >
                                Show all {gym.amenities.length} amenities
                            </button>
                        )}
                    </div>

                    <div className="border border-dashed border-[#CBD5E1]"></div>

                    {/* ===== Rules ===== */}
                    <div className="pb-20">
                        <h2 className="text-base font-semibold mb-3">
                            Rules
                        </h2>

                        <div className="space-y-3 text-xs text-[#0F172A]">
                            {visibleRules.map((rule, i) => (
                                <p key={i}>
                                    {i + 1}. {rule.description}
                                </p>
                            ))}
                        </div>

                        {gym.rules.length > 3 && (
                            <button
                                className="flex items-center justify-center w-full h-12 mt-6 rounded-md bg-blue-100 text-blue-400 font-semibold text-sm"
                                onClick={() => setRulesOpen(true)}
                            >
                                View all rules
                            </button>
                        )}
                    </div>
                </div>

                {/* ===== Sticky Bottom CTA ===== */}

                <div id="share-bottom-bar" className="fixed bottom-14 left-0 right-0 bg-white border-t px-3 pb-4 pt-2.5 flex justify-between items-center">
                    <div className="space-y-2">
                        <p className="text-[11px] text-[#475569] font-medium">
                            Gym timings : {formatTime12Hour(gym.open_time)} - {formatTime12Hour(gym.close_time)}
                        </p>

                        <div className="flex items-center gap-2 leading-none">
                            <p className="text-[22px] font-semibold flex items-center text-nowrap text-[#0F172A]">
                                ₹{Number(gym.hourly_rate) + 12 + 2.16}/Hr
                            </p>

                            <IoInformationCircleOutline
                                size={20}
                                onClick={() => setPriceBreakdownOpen(true)}
                                className="text-[#94A3B8] flex-shrink-0"
                                style={{ transform: "translateY(1px)" }}
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(`/gyms/${gym.slug}/plan`)}
                        className="bg-blue-600 text-white px-6 py-4 text-sm rounded-md w-[153px] font-medium"
                    >
                        Book Hour
                    </button>
                </div>

            </div>
            {/* )} */}

            <Footer />

            {/* ===== Amenities Bottom Sheet ===== */}
            <BottomSheet
                open={amenitiesOpen}
                onClose={() => setAmenitiesOpen(false)}
                title="What This Place Offers"
            >
                {gym.amenities.map((item, i) => (
                    <p key={i} className="mb-3 text-sm flex items-center gap-2">
                        <img
                            src={item?.icon}
                            alt={item?.name}
                            className="w-3 h-3 object-contain"
                        />
                        {item.name}
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
                        {i + 1}. {rule.description}
                    </p>
                ))}
            </BottomSheet>

            {/* ===== Price Breakdown Bottom Sheet ===== */}
            <BottomSheet
                open={priceBreakdownOpen}
                onClose={() => setPriceBreakdownOpen(false)}
                title="Price Breakdown"
            >
                <div className="border border-[#DBEAFE] py-3 px-4 rounded-md space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[#6A6A6A]">1 Hour</p>
                        <p className="text-sm font-medium text-[#0F172A]">Rs. {Number(gym.hourly_rate)}</p>
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[#6A6A6A]">Platform Fee</p>
                        <p className="text-sm font-medium text-[#0F172A]">Rs. 12</p>
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[#6A6A6A]">Gst Fee</p>
                        <p className="text-sm font-medium text-[#0F172A]">Rs. 2.16</p>
                    </div>

                    <div className="border border-dashed border-[#CBD5E1]"></div>

                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[#6A6A6A]">Total</p>
                        <p className="text-sm font-medium text-[#0F172A]">Rs. {Number(gym.hourly_rate) + 12 + 2.16}</p>
                    </div>
                </div>
            </BottomSheet>

            {/* <PickHoursSheet
                open={open}
                setOpen={setOpen}
                onClose={() => setOpen(false)}
                defaultDate={initialBookingState?.selectedDate}
                defaultHours={initialBookingState?.selectedHours}
                gym={gym}
            /> */}
        </div>
    );
}
