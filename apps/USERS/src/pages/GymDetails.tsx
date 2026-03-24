import { useNavigate, useParams } from "react-router-dom";
import BottomSheet from "../components/BottomSheet";
import ImageCarousel from "../components/ImageCarousel";
import { useEffect, useState } from "react";
import logoUrl from "../assets/icon2.png";
import {
    IoInformationCircleOutline,
    IoWarningOutline,
} from "react-icons/io5";
import { HiLocationMarker, HiOutlineLocationMarker } from "react-icons/hi";
// import { FaRegClock } from "react-icons/fa6";
// import { PiUserGearFill } from "react-icons/pi";
import Footer from "../components/Footer";
import { MdPhone } from "react-icons/md";
// import PickHoursSheet from "../components/PickHoursSheet";
import PageHeader from "../components/PageHeader";
// import { FaRegEdit } from "react-icons/fa";
import { useAppContext, type GymCard } from "../context/AppContext";
import type { Gym } from "../components/types/gym";
import html2canvas from "html2canvas";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function GymDetails() {

    const { gyms } = useAppContext()

    const navigate = useNavigate();
    // const location = useLocation();

    const { slug } = useParams();

    const [gym, setGym] = useState<GymCard | null>(null);
    const [loading, setLoading] = useState(true);

    const [amenitiesOpen, setAmenitiesOpen] = useState(false);
    const [rulesOpen, setRulesOpen] = useState(false);
    const [priceBreakdownOpen, setPriceBreakdownOpen] = useState(false);

    // const [open, setOpen] = useState(initialBookingState?.reopenSheet || false);

    // const [open, setOpen] = useState(
    //     location.state?.reopenSheet || false
    // );


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
            const blob = await (await fetch(dataUrl)).blob();

            const file = new File([blob], `${gym?.name || "gym"}-Viigo.png`, { type: "image/png" });
            const shareText = `${gym?.name}\n\nMore info: https://viigousers.vercel.app/gyms/${gym?.slug}`;

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], text: shareText });
            } else {
                window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");

                const link = document.createElement("a");
                link.href = dataUrl;
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

    // const tagIcons: Record<string, JSX.Element> = {
    //     "Hourly Access": <FaRegClock size={12} />,
    //     "Beginner Friendly": <PiUserGearFill size={12} />,
    // };

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

    // const storedBooking = localStorage.getItem("bookingData");

    // const initialBookingState = storedBooking
    //     ? (() => {
    //         const parsed = JSON.parse(storedBooking);

    //         return {
    //             ...parsed,
    //             selectedDate: parsed.selectedDate
    //                 ? new Date(parsed.selectedDate)
    //                 : null,
    //         };
    //     })()
    //     : null;

    // const selectedHours = initialBookingState?.selectedHours;

    // const editSelectedHr = initialBookingState?.selectedHours.value === 1 ? "Hr" : initialBookingState?.selectedHours.label

    // const totalWithHr = (initialBookingState?.selectedHours && gym)
    //     ? gym.hourly_rate * initialBookingState?.selectedHours.value
    //     : gym?.hourly_rate;

    // const formatWithOrdinal = (date: Date) => {
    //     const day = date.getDate();

    //     const getSuffix = (d: number) => {
    //         if (d > 3 && d < 21) return "th";
    //         switch (d % 10) {
    //             case 1: return "st";
    //             case 2: return "nd";
    //             case 3: return "rd";
    //             default: return "th";
    //         }
    //     };

    //     const month = date.toLocaleDateString("en-US", { month: "long" });

    //     return `${day}${getSuffix(day)} ${month}`;
    // };

    // const calculateLastEntry = () => {
    //     if (!selectedHours?.value || !gym?.close_time) return "";

    //     const [hour, minute] = gym.close_time.split(":").map(Number);

    //     const closingDate = new Date();
    //     closingDate.setHours(hour, minute, 0, 0);

    //     // subtract selected duration
    //     const durationInMinutes = selectedHours?.value * 60;

    //     closingDate.setMinutes(closingDate.getMinutes() - durationInMinutes);

    //     return closingDate.toLocaleTimeString("en-GB", {
    //         hour: "numeric",
    //         minute: "2-digit",
    //         hour12: true,
    //     });
    // };

    // const lastEntryTime = calculateLastEntry();

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
                <div className="h-60">
                    <ImageCarousel images={gym.images} />
                </div>

                {/* ===== Content ===== */}
                <div className="bg-white p-4 px-5 space-y-6">

                    {/* Gym Name */}
                    <div>

                        <div className="flex justify-between items-center gap-3">
                            <h1 className="text-xl font-bold">{gym.name}</h1>

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

                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1 leading-none">
                            <HiLocationMarker size={14} className="flex-shrink-0" />
                            <span className="flex items-center gap-1">
                                <span>{gym.distance} {gym.area}</span>
                                <span>•</span>
                                <span>{gym.open_status || `Open Till ${formatTime12Hour(gym.close_time)}`}</span>
                            </span>
                        </div>

                        {/* Tags */}
                        {/* <div className="flex gap-2 mt-3 flex-wrap">
                        {gym.tags.map((tag, i) => (
                            <span
                                key={i}
                                className="flex items-center gap-1 bg-blue-100 text-blue-600 text-xs px-3 py-2 rounded-full"
                            >
                                {tagIcons[tag]}
                                {tag}
                            </span>
                        ))}
                    </div> */}
                    </div>

                    <div className="border border-dashed border-[#CBD5E1]"></div>

                    {/* ===== Amenities ===== */}
                    <div>
                        <h2 className="text-lg font-semibold mb-3">
                            What’s Included
                        </h2>

                        <div className="space-y-3">
                            {visibleAmenities.map((item, i) => (
                                <p key={i} className="text-sm text-gray-700 flex items-center gap-2">
                                    <img
                                        src={item?.icon}
                                        alt={item?.name}
                                        className="w-3 h-3 object-contain"
                                    />
                                    {item.name}
                                </p>
                            ))}
                        </div>

                        {gym.amenities.length > 4 && (
                            <button style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                width: "100%",
                                height: "48px",
                                backgroundColor: "#DBEAFE",
                                color: "#2563EB",
                                borderRadius: "6px",
                                fontWeight: 500,
                                fontSize: "16px",
                                marginTop: "16px",
                                padding: "0",
                            }}
                            >
                                Show all {gym.amenities.length} amenities
                            </button>
                        )}
                    </div>

                    <div className="border border-dashed border-[#CBD5E1]"></div>

                    {/* ===== Rules ===== */}
                    <div className="pb-20">
                        <h2 className="text-lg font-semibold mb-3">
                            Rules
                        </h2>

                        <div className="space-y-2 text-sm text-gray-600">
                            {visibleRules.map((rule, i) => (
                                <p key={i}>
                                    {i + 1}. {rule.description}
                                </p>
                            ))}
                        </div>

                        {gym.rules.length > 3 && (
                            <button style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                width: "100%",
                                height: "48px",
                                backgroundColor: "#DBEAFE",
                                color: "#2563EB",
                                borderRadius: "6px",
                                fontWeight: 500,
                                fontSize: "16px",
                                marginTop: "16px",
                                padding: "0",
                            }}
                            >
                                View all rules
                            </button>
                        )}
                    </div>
                </div>

                {/* ===== Sticky Bottom CTA ===== */}

                {/* {storedBooking ? (
                <div className="fixed bottom-14 left-0 right-0 bg-white">
                    <div className="bg-blue-50 text-blue-700 text-sm px-4 py-3 font-medium text-center">
                        Last entry for selected duration: {lastEntryTime}
                    </div>

                    <div className="flex justify-between items-center px-4 pb-5 pt-2">
                        <div className="space-y-2">

                            <p className="text-xs font-semibold text-[#4A4A4A] mt-2">
                                {initialBookingState?.selectedDate &&
                                    formatWithOrdinal(initialBookingState.selectedDate)}
                                <span
                                    className="ml-1 cursor-pointer text-[#2563EB] inline-flex items-center"
                                    onClick={() => setOpen(true)}
                                >
                                    <FaRegEdit />
                                </span>
                            </p>

                            <div className="flex items-center gap-1">
                                <p className="text-xl font-bold">
                                    ₹{totalWithHr && totalWithHr + 12 + 2.16}{initialBookingState?.selectedHours?.label ? `/${editSelectedHr}` : "Hr"}
                                </p>
                            </div>
                        </div>

                        <button onClick={() => navigate("/reviewpay")} className="bg-blue-600 text-white px-6 py-3 rounded-md w-[163px] font-medium">
                            Confirm
                        </button>
                    </div>
                </div>
            ) : ( */}
                <div id="share-bottom-bar" className="fixed bottom-14 left-0 right-0 bg-white border-t px-3 py-3 flex justify-between items-center">
                    <div className="space-y-2">
                        <p className="text-[11px] text-gray-500">
                            Gym timings : {formatTime12Hour(gym.open_time)} - {formatTime12Hour(gym.close_time)}
                        </p>

                        <div className="flex items-center gap-2 leading-none">
                            <p className="text-xl font-bold flex items-center">
                                ₹{Number(gym.hourly_rate) + 12 + 2.16}/Hr
                            </p>

                            <IoInformationCircleOutline
                                size={20}
                                onClick={() => setPriceBreakdownOpen(true)}
                                className="text-gray-400 flex-shrink-0"
                                style={{ transform: "translateY(1px)" }}
                            />
                        </div>
                    </div>

                    <button
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "153px",
                            height: "48px",
                            backgroundColor: "#DBEAFE",
                            color: "#2563EB",
                            borderRadius: "6px",
                            fontWeight: 500,
                            fontSize: "16px",
                            marginTop: "16px",
                            padding: "0",
                        }}

                        onClick={() => navigate(`/gyms/${gym.slug}/plan`)}
                    //   className="bg-blue-600 text-white px-6 py-3 rounded-md w-[153px] font-medium"
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
