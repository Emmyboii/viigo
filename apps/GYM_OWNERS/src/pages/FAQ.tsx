import { useEffect, useState } from "react";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import logoUrl from "../assets/icon2.png";
import * as htmlToImage from "html-to-image";
import { HiShare } from "react-icons/hi";
import Footer from "../components/Footer";

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

export default function FAQ() {
    const navigate = useNavigate();
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

        if (bottomBar) {
            bottomBar.style.position = "relative";
            bottomBar.style.bottom = "0px";
        }

        try {
            await document.fonts.ready;

            // 🧠 Convert DOM → image
            const dataUrl = await htmlToImage.toPng(element, {
                pixelRatio: 2,
                cacheBust: true,
            });

            const baseImage = new Image();
            baseImage.src = dataUrl;

            await new Promise((res) => {
                baseImage.onload = res;
            });

            // 🎨 Create final canvas
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const headerHeight = 120;

            canvas.width = baseImage.width;
            canvas.height = baseImage.height + headerHeight;

            // 🔵 Background
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 🔷 Header gradient
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, "#2563EB");
            gradient.addColorStop(1, "#3B82F6");

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, headerHeight);

            // 🧠 Logo
            const logo = new Image();
            logo.src = logoUrl;

            await new Promise((res) => {
                logo.onload = res;
                logo.onerror = res;
            });


            // Max height constraint (this controls visual size)
            const maxLogoHeight = 50;

            // Calculate aspect ratio
            const aspectRatio = logo.width / logo.height;

            // Compute final dimensions
            const logoHeight = maxLogoHeight;
            const logoWidth = logoHeight * aspectRatio;

            // Center content
            const text = "Viigo";
            ctx.font = "bold 50px sans-serif";
            ctx.fillStyle = "#fff";

            // Measure text
            const textWidth = ctx.measureText(text).width;

            // spacing between logo & text
            const gap = 20;

            // total width for centering
            const totalWidth = logoWidth + gap + textWidth;
            const startX = (canvas.width - totalWidth) / 2;

            // draw logo (no distortion)
            ctx.drawImage(
                logo,
                startX,
                (headerHeight - logoHeight) / 2,
                logoWidth,
                logoHeight
            );

            // draw text
            ctx.fillText(
                text,
                startX + logoWidth + gap,
                headerHeight / 2 + 16
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
                link.href = dataUrl;
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500">Loading FAQs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-4">
                <div className="flex items-center gap-3">
                    <IoArrowBack
                        size={22}
                        className="cursor-pointer"
                        onClick={() => navigate(-1)}
                    />
                    <h1 className="text-lg font-semibold">Support</h1>
                </div>
                <HiShare onClick={handleShare} size={20} className="cursor-pointer text-[#475569]" />
            </div>

            <div id="share-area" className="min-h-screen bg-white px-4">

                <p className="text-sm text-[#0F172A] mb-4">
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

                            <p className="text-sm font-semibold text-[#0F172A] mb-1">
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