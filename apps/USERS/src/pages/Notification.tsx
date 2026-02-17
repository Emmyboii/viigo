import { useState } from "react";
import {
    FiArrowLeft,
    FiCalendar,
    FiCreditCard,
} from "react-icons/fi";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { notifications as initialData } from "../data/notifications";
import Footer from "../components/Footer";
import { IoStopCircle } from "react-icons/io5";
import { IoMdPlayCircle } from "react-icons/io";
import { FaClock } from "react-icons/fa";

export default function Notifications() {
    const [data, setData] = useState(initialData);

    const markAllAsRead = () => {
        const updated = data.map((item) => ({ ...item, unread: false }));
        setData(updated);
    };

    const deleteNotification = (id: number) => {
        setData((prev) => prev.filter((item) => item.id !== id));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "booking":
                return <FiCalendar size={18} />;
            case "start":
                return <IoMdPlayCircle size={18} />;
            case "end":
                return <IoStopCircle size={18} />;
            case "payment":
                return <FiCreditCard size={18} />;
            case "warning":
                return <FaClock size={18} />;
            default:
                return <FiCalendar size={18} />;
        }
    };

    return (
        <div className="min-h-screen pb-24">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white">
                <div className="flex items-center gap-3">
                    <FiArrowLeft size={20} />
                    <h1 className="text-lg font-semibold">Notifications</h1>
                </div>

                <button
                    onClick={markAllAsRead}
                    className="text-blue-600 text-sm font-medium"
                >
                    Mark All as Read
                </button>
            </div>

            {/* List */}
            <div className="p-4 space-y-4">
                <AnimatePresence>
                    {data.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 100, opacity: 0 }}
                            layout
                            className="relative"
                        >
                            {/* Swipe-to-delete background */}
                            <div className="absolute inset-0 rounded-lg flex items-center justify-end pr-4">
                                <span className="text-white font-semibold">Delete</span>
                            </div>

                            {/* Notification card */}
                            <motion.div
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.2}
                                onDragEnd={(_, info: PanInfo) => {
                                    if (info.offset.x > 100 || info.offset.x < -100) {
                                        deleteNotification(item.id);
                                    }
                                }}
                                whileTap={{ cursor: "grabbing" }}
                                className={`flex gap-3 p-2 rounded-lg items-center border border-[#E2E8F0] relative z-10 cursor-grab transition ${item.unread
                                    ? "border-l-blue-500 border-l-4"
                                    : "border-[#E2E8F0] bg-white border"
                                    }`}
                            >
                                {/* Icon */}
                                <div className="w-10 h-10 rounded-full bg-[#CBD5E1] flex items-center justify-center text-[#0F172A]">
                                    {getIcon(item.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold text-base">{item.title}</h3>
                                        <span className="text-xs text-[#475569]">{item.time}</span>
                                    </div>

                                    <p className="text-xs text-[#0F172A] mt-1 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <Footer />
        </div>
    );
}
