import { useState } from "react";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import { IoArrowBack, IoShareOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

type Category = "Bookings" | "Payments" | "Account" | "About Us";

interface FAQ {
    question: string;
    answer: string;
}

const faqData: Record<Category, FAQ[]> = {
    Bookings: [
        {
            question: "How do I cancel my booking?",
            answer:
                "To cancel, go to your Bookings tab, select the upcoming session, and tap 'Cancel Booking'. Cancellations made 2 hours prior are fully refundable.",
        },
        {
            question: "Can I reschedule a session?",
            answer:
                "Yes. Go to your booking details and select 'Reschedule'. You can change the time based on gym availability.",
        },
        {
            question: "What happens if I miss a session?",
            answer:
                "Missed sessions are non-refundable. We recommend cancelling at least 2 hours before the session.",
        },
        {
            question: "How do I book hourly sessions?",
            answer:
                "Select a gym, choose your preferred time slots, confirm availability, and proceed to payment.",
        },
    ],
    Payments: [
        {
            question: "What payment methods are supported?",
            answer:
                "We support debit cards, credit cards, UPI, and wallet payments.",
        },
        {
            question: "When will I receive my refund?",
            answer:
                "Refunds are processed within 3–5 business days depending on your bank.",
        },
        {
            question: "Is my payment information secure?",
            answer:
                "Yes. We use encrypted and PCI-compliant payment gateways to protect your data.",
        },
    ],
    Account: [
        {
            question: "How do I update my profile?",
            answer:
                "Go to Account Settings and tap 'Edit Profile' to update your details.",
        },
        {
            question: "How do I change my phone number?",
            answer:
                "You can update your phone number under Account Settings. OTP verification will be required.",
        },
        {
            question: "How do I delete my account?",
            answer:
                "Please contact support from the Account section to request account deletion.",
        },
    ],
    "About Us": [
        {
            question: "What is Viigo?",
            answer:
                "Viigo allows users to book gym sessions on an hourly basis — pay only for what you use.",
        },
        {
            question: "How does Viigo work?",
            answer:
                "Browse gyms, select hours, make payment, and start training. It’s flexible and convenient.",
        },
        {
            question: "How can gyms partner with Viigo?",
            answer:
                "Gym owners can register via our onboarding page and list their available time slots.",
        },
    ],
};

export default function FAQ() {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState<Category>("Bookings");
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleAccordion = (index: number) => {
        setOpenIndex((prev) => (prev === index ? null : index));
    };

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
                {(Object.keys(faqData) as Category[]).map((category) => (
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
                {faqData[activeCategory].map((faq, index) => {
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
                })}
            </div>
        </div>
    );
}