import { useEffect, useState } from "react";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import { IoArrowBack, IoShareOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

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
        <div className="min-h-screen bg-gray-50 px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <IoArrowBack
                        size={22}
                        className="cursor-pointer"
                        onClick={() => navigate(-1)}
                    />
                    <h1 className="text-lg font-semibold">Support</h1>
                </div>
                <IoShareOutline size={20} className="cursor-pointer" />
            </div>

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
                        className={`px-4 py-2 rounded-lg border text-sm whitespace-nowrap transition 
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
                                        <IoChevronUp size={18} />
                                    ) : (
                                        <IoChevronDown size={18} />
                                    )}
                                </button>

                                {isOpen && (
                                    <div className="px-4 pb-4 text-sm font-medium text-[#475569] leading-relaxed">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}