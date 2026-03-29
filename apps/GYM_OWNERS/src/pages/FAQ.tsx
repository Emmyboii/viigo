import { useEffect, useState } from "react";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import { IoArrowBack } from "react-icons/io5";
// import { useNavigate } from "react-router-dom";
import logoUrl from "../assets/icon2.png";
// import * as htmlToImage from "html-to-image";
import { HiShare } from "react-icons/hi";
import Footer from "../components/Footer";
import { snapdom } from "@zumer/snapdom";

type Category = "BOOKINGS" | "PAYMENTS" | "ACCOUNT" | "ABOUT_US";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface FAQ {
    question: string;
    answer: string;
}

interface FAQType {
    id: number;
    question: string;
    answer: string;
    category: "BOOKINGS" | "PAYMENTS" | "ACCOUNT" | "ABOUT_US";
}

const categoryLabels: Record<Category, string> = {
    BOOKINGS: "Bookings",
    PAYMENTS: "Payments",
    ACCOUNT: "Account",
    ABOUT_US: "About Us",
};

export default function FAQ({ setFaq }: { setFaq: (value: boolean) => void }) {
    // const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState<Category>("BOOKINGS");
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const [faqs, setFaqs] = useState<FAQType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true)

        const fetchFaqs = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await fetch(`${backendUrl}/api/support/faqs/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                setFaqs(Array.isArray(data) ? data : data?.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchFaqs();
    }, []);

    const filteredFaqs = faqs?.filter(
        (faq) => faq.category === activeCategory.toUpperCase()
    );

    const isEmpty = !filteredFaqs || filteredFaqs.length === 0;

    const toggleAccordion = (index: number) => {
        setOpenIndex((prev) => (prev === index ? null : index));
    };

    const handleShare = async () => {
        const element = document.getElementById("share-area");
        const bottomBar = document.getElementById("share-bottom-bar");

        if (!element) return;


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
            const file = new File([blob], "viigo-faq.png", { type: "image/png" });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: "Viigo FAQ",
                    text: "Check out these FAQs",
                });
            } else {
                const link = document.createElement("a");
                link.href = finalUrl;
                link.download = "viigo-faq.png";
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

    const closeModal = () => {
        setFaq(false);

        if (window.history.state?.modal === "faq") {
            window.history.back();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 bg-white p-5 z-50">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500">Loading FAQs...</p>
                </div>
            </div>
        );
    }

    return (
        // <div className="min-h-screen py-6">
        <div className={`fixed mk:flex flex-col justify-center z-50 bg-white overflow-y-auto inset-0 mk:inset-auto mk:right-0 mk:top-0 mk:min-h-screen mk:w-[480px] mk:p-5 ${window.innerWidth >= 850 ? "animate-slideRight" : "animate-slideUp"}`}>

            {/* Header */}
            <div className="flex mk:hidden items-center justify-between px-4 mt-4">
                <div className="flex items-center gap-3">
                    <IoArrowBack
                        size={22}
                        className="cursor-pointer"
                        onClick={closeModal}
                    />
                    <h1 className="text-lg font-semibold">Support</h1>
                </div>
                <HiShare onClick={handleShare} size={20} className="cursor-pointer text-[#475569]" />
            </div>

            <div id="share-area" className="min-h-screen bg-white px-4 mk:px-2 pt-4 mk:pt-32">

                <p className="text-sm mk:text-lg mk:font-semibold text-[#0F172A] text-nowrap mb-4">
                    Please find common FAQ’s here
                </p>

                {/* Category Tabs */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar mb-6">
                    {(Object.keys(categoryLabels) as Category[]).map((category) => (
                        <button
                            key={category}
                            onClick={() => {
                                setActiveCategory(category);
                                setOpenIndex(0);
                            }}
                            className={`px-4 py-2 rounded-lg border font-medium text-xs whitespace-nowrap transition 
                                ${activeCategory === category
                                    ? "bg-[#DBEAFE] text-[#2563EB] border-[#2563EB]"
                                    : "bg-white text-[#0F172A] border-[#CBD5E1]"
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Accordion */}
                <div className="space-y-3">
                    {isEmpty ? (
                        <div className="flex flex-col items-center justify-center text-center bg-white rounded-xl py-10 px-6">
                            <div className="w-12 h-12 rounded-full bg-[#DBEAFE] flex items-center justify-center mb-4">
                                <span className="text-[#2563EB] text-xl">?</span>
                            </div>

                            <p className="text-sm font-semibold text-nowrap text-[#0F172A] mb-1">
                                No FAQs available
                            </p>

                            <p className="text-xs text-gray-500 max-w-[250px]">
                                There are no FAQs under this category yet. Please check back later.
                            </p>
                        </div>
                    ) : (
                        filteredFaqs.map((faq, index) => {
                            const isOpen = openIndex === index;

                            return (
                                <div
                                    key={index}
                                    className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                                >
                                    <button
                                        onClick={() => toggleAccordion(index)}
                                        className="w-full flex justify-between items-center px-4 py-4 text-left"
                                    >
                                        <span className="text-sm font-semibold text-[#0F172A]">
                                            {faq.question}
                                        </span>
                                        {isOpen ? (
                                            <IoChevronUp size={18} className="text-[#475569]" />
                                        ) : (
                                            <IoChevronDown size={18} className="text-[#475569]" />
                                        )}
                                    </button>

                                    {isOpen && (
                                        <div className="px-4 pb-4 text-xs font-medium text-[#475569] leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}