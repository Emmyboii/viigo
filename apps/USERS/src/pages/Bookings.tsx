import FilterChips from "../components/FilterChips"
import PageHeader from "../components/PageHeader"
import { HiLocationMarker } from "react-icons/hi"
import { CiCalendar } from "react-icons/ci"
import { FiClock } from "react-icons/fi"
import Footer from "../components/Footer"
import { useEffect, useState } from "react"
import BookingModal from "../components/BookingModal"
import logoUrl from "../assets/icon2.png";
// import * as htmlToImage from "html-to-image";
import { normalizeImagePath, useAppContext } from "../context/AppContext"
import { snapdom } from "@zumer/snapdom";
import { IoSearchSharp } from "react-icons/io5"

export type Booking = {
    id: number;
    booking_reference: string;
    gym_name: string;
    gym_location: string;
    gym_image: string;
    display_date: string;
    display_time: string;
    price_tag: string;
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "ACTIVE" | "COMPLETED";
};

const Bookings = () => {

    const chipData = [
        { id: "upcoming", label: "Upcoming", icon: '' },
        { id: "past", label: "Past", icon: '' },
        { id: "cancelled", label: "Cancelled", icon: '' },
        { id: "all", label: "All", icon: '' },
    ];

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const { userData } = useAppContext()

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("all");
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [query, setQuery] = useState("");

    useEffect(() => {
        const handlePopState = () => {
            if (showModal) {
                setShowModal(false);
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [showModal]);

    const openBookingModal = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowModal(true);

        window.history.pushState({ modal: "booking" }, "");
    };

    const closeBookingModal = () => {
        setShowModal(false);

        if (window.history.state?.modal === "booking") {
            window.history.back();
        }
    };

    const token = localStorage.getItem("token");

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

            const fileName = `${userData?.full_name}-bookings.png`;
            const file = new File([blob], fileName, { type: "image/png" });

            const shareText = `My Bookings`;

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], text: shareText });
            } else {
                window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");

                const link = document.createElement("a");
                link.href = finalUrl;
                link.download = fileName;
                link.click();
            }
        } catch (err) {
            console.error("Share failed:", err);
        }
    };

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await fetch(`${backendUrl}/client/bookings/my-bookings/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();
                setBookings(data.data);
            } catch (err) {
                console.error("Error fetching bookings", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const formatLocation = (address: string) => {
        if (!address) return "";

        const parts = address.split(",").map(p => p.trim());

        const cleaned = parts.map(p =>
            p.replace(/\d+$/, "").trim() // remove trailing numbers
        );

        return cleaned.slice(-2).join(", ");
    };

    const filteredBookings = bookings.filter((b) => {
        if (b.status === "PENDING") return false;

        // 🔍 SEARCH FILTER
        const matchesSearch =
            b.gym_name.toLowerCase().includes(query.toLowerCase()) ||
            b.gym_location.toLowerCase().includes(query.toLowerCase());

        if (!matchesSearch) return false;

        // 🎯 STATUS FILTER
        switch (activeFilter) {
            case "upcoming":
                return b.status === "CONFIRMED";
            case "past":
                return b.status === "COMPLETED";
            case "cancelled":
                return b.status === "CANCELLED";
            case "all":
            default:
                return true;
        }
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4 p-8 bg-white animate-fadeIn">
                    <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-700 text-lg font-medium">
                        Loading Bookings...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>

            {!showModal && (
                <div className="min-h-screen py-4 max-w-[1300px] mx-auto">


                    <PageHeader text="Bookings" onShare={handleShare} />

                    <div className="pt-10" />

                    <div id="share-area" className="min-h-screen bg-white px-4 pt-4">


                        <div className="bg-white border rounded-lg flex items-center px-3 py-4">
                            <IoSearchSharp className="text-[#475569] mr-2 text-xl" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search for bookings"
                                className="outline-none w-full text-sm placeholder:text-[#0F172A] bg-transparent"
                            />
                        </div>
                        <FilterChips
                            items={chipData}
                            activeId={activeFilter}
                            onChange={(id) => setActiveFilter(id)}
                        />
                        <div className="space-y-4 mb-20 mt-8">
                            {filteredBookings.length == 0 ? (
                                <div className="text-center text-gray-500 mt-10">
                                    {query
                                        ? `No bookings match "${query}"`
                                        : `No bookings found for "${chipData.find(c => c.id === activeFilter)?.label}"`
                                    }
                                </div>
                            ) : (
                                filteredBookings.map((gym, index) => (
                                    <div
                                        key={index}
                                        onClick={() => {
                                            if (gym.status === "CANCELLED") return;
                                            if (gym.status === "COMPLETED") return;

                                            openBookingModal(gym);
                                            localStorage.setItem("selectedBookingId", String(gym.id));
                                        }}
                                        className="bg-white rounded border border-[#E2E8F0] min-h-[140px] h-full flex gap-3"
                                    >
                                        <img crossOrigin="anonymous" src={`https://api.viigo.in/${normalizeImagePath(gym.gym_image)}`} title="gym" className="w-20 min-h-full rounded-tl rounded-bl object-cover" />

                                        <div className="flex flex-col justify-between w-full p-3 pl-0">

                                            <div className="space-y-[7px]">
                                                <h3 className="font-normal">{gym.gym_name}</h3>
                                                <p className="text-xs text-[#475569] flex items-center gap-1">
                                                    <HiLocationMarker className="text-[#475569] text-base" />
                                                    {formatLocation(gym.gym_location)}
                                                </p>

                                                <p className="text-xs text-[#475569] flex items-center gap-1">
                                                    <CiCalendar className="text-[#475569] text-lg" />
                                                    Date and Time : {gym.display_date}
                                                </p>

                                                <p className="text-xs text-[#475569] flex items-center gap-1">
                                                    <FiClock className="text-[#475569] text-lg" />
                                                    Time : {gym.display_time}
                                                </p>
                                            </div>

                                            <div className="flex justify-between items-center mt-4 gap-2">
                                                <span className="font-normal text-xs text-nowrap text-[#0F172A]">{gym.price_tag}</span>
                                                <button className="bg-white rounded-full text-nowrap border border-[#CBD5E1] text-center text-[#475569] text-[10px] px-2 py-2">
                                                    Booking ID : #{gym.booking_reference}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <Footer />

                </div>
            )}

            {showModal && selectedBooking && (
                <BookingModal
                    booking={selectedBooking}
                    onClose={closeBookingModal}
                />
            )}
        </div>
    )
}

export default Bookings