import { useEffect, useState } from "react";
import {
    FiArrowLeft,
} from "react-icons/fi";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import Footer from "../components/Footer";
// import { IoStopCircle } from "react-icons/io5";
// import { IoMdPlayCircle } from "react-icons/io";
// import { FaClock } from "react-icons/fa";
import { FiCalendar, FiCreditCard } from "react-icons/fi";
import { MdNotificationsActive, MdPayments } from "react-icons/md";
import { useNavigate } from "react-router";
import { FiBellOff } from "react-icons/fi";
import { useAppContext, type NotificationTypeEnum } from "../context/AppContext";
import { PiWarningCircleBold } from "react-icons/pi";
import { RiCoupon2Line } from "react-icons/ri";
import { FaWallet } from "react-icons/fa";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const timeAgo = (dateString: string) => {
    const now = new Date();
    const createdAt = new Date(dateString);
    const diff = now.getTime() - createdAt.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

    return createdAt.toLocaleDateString(); // fallback
};

export default function Notifications({ Loading = false }: { Loading?: boolean }) {

    const { hasUnread, notifications, setNotifications, isLoading } = useAppContext()
    const navigate = useNavigate();

    const [toast, setToast] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    useEffect(() => {
        if (!toast) return;

        const timer = setTimeout(() => {
            setToast(null);
        }, 2500);

        return () => clearTimeout(timer);
    }, [toast]);

    const markAsRead = async (id: number) => {
        try {
            const token = localStorage.getItem("token");

            await fetch(
                `${backendUrl}/notification/notifications/mark-read/${id}/`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Optimistic update
            setNotifications((prev) =>
                prev.map((item) =>
                    item.id === id ? { ...item, is_read: true } : item
                )
            );

            setToast({
                type: "success",
                message: "Marked as read",
            });

        } catch (err) {
            console.error("Failed to mark as read", err);
            setToast({
                type: "error",
                message: "Something went wrong",
            });
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem("token");

            await fetch(
                `${backendUrl}/notification/notifications/mark-all-read/`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Optimistic update
            setNotifications((prev) =>
                prev.map(n => ({
                    ...n,
                    is_read: true,
                }))
            );

            setToast({
                type: "success",
                message: "All notifications marked as read",
            });

        } catch (err) {
            console.error("Failed to mark as read", err);
            setToast({
                type: "error",
                message: "Something went wrong",
            });
        }
    };

    const getIcon = (type: NotificationTypeEnum) => {
        switch (type) {
            case "SESSION": // Booking started / in progress
                return <FiCalendar size={18} />;

            case "BOOKING": // General booking notifications
                return <MdNotificationsActive size={18} />;

            case "PAYMENT":
                return <MdPayments size={18} />;

            case "SYSTEM": // System alerts / warnings
                return <PiWarningCircleBold size={18} />;

            case "PROMO": // Promotions / coupons
                return <RiCoupon2Line size={18} />;

            case "WALLET": // Wallet updates
                return <FaWallet size={18} />;

            case "WITHDRAWAL": // Withdrawal notifications
                return <FiCreditCard size={18} />;

            default: // fallback
                return <FiCalendar size={18} />;
        }
    };

    const controls = useAnimation();

    useEffect(() => {
        if (!Loading) {
            controls.start({
                x: 0,
                opacity: 1,
                transition: {
                    type: "spring",
                    stiffness: 50,
                    damping: 11,
                    mass: 1.2,
                },
            });
        }
    }, [Loading, controls]);

    // const deleteNotification = (id: number) => {
    //     setData((prev) => prev.filter((item) => item.id !== id));
    // };

    // const markAllAsRead = () => {
    //     const updated = data.map((item) => ({ ...item, is_read: true }));
    //     setData(updated);
    // };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4 p-8 bg-white animate-fadeIn">
                    <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-700 text-lg font-medium">
                        Loading Notifications...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24 relative">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white">
                <div onClick={() => navigate(-1)} className="flex items-center gap-3">
                    <FiArrowLeft size={20} />
                    <h1 className="text-lg font-semibold">Notifications</h1>
                </div>

                {notifications.length > 0 && (
                    <button
                        disabled={!hasUnread}
                        onClick={markAllAsRead}
                        className="text-blue-600 text-sm font-medium"
                    >
                        Mark All as Read
                    </button>
                )}
            </div>

            {/* List */}
            <div className="p-4 space-y-4">
                {notifications.length === 0 ? (
                    <EmptyNotifications />
                ) : (
                    <AnimatePresence>
                        {notifications.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ x: 100, opacity: 0 }}
                                animate={controls}
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
                                    onClick={() => {
                                        if (!item?.is_read) {
                                            markAsRead(item.id);
                                        }
                                    }}
                                    // drag="x"
                                    // dragConstraints={{ left: 0, right: 0 }}
                                    // dragElastic={0.2}
                                    // onDragEnd={(_, info: PanInfo) => {
                                    //     if (info.offset.x > 100 || info.offset.x < -100) {
                                    //         deleteNotification(item.id);
                                    //     }
                                    // }}
                                    // whileTap={{ cursor: "grabbing" }}
                                    className={`flex gap-3 p-2 rounded-lg items-center border border-[#E2E8F0] relative z-10 cursor-gra transition ${!item.is_read
                                        ? "border-l-blue-500 border-l-4"
                                        : "border-[#E2E8F0] bg-white border"
                                        }`}
                                >
                                    {/* Icon */}
                                    <div className="w-10 h-10 rounded-full bg-[#CBD5E1] flex items-center justify-center text-[#0F172A]">
                                        {getIcon(item?.notification_type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <h3 className="font-semibold text-base">{item?.title}</h3>
                                                <p className="text-xs text-[#0F172A] mt-1 leading-relaxed">
                                                    {item.message}
                                                </p>
                                            </div>
                                            <span className="text-xs text-[#475569] text-nowrap">{timeAgo(item.created_at)}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.25 }}
                    >
                        <div className="fixed top-1/2 left-[50%] -translate-x-1/2 -translate-y-1/2 
                        bg-gray-300 text-black px-6 py-3 rounded-xl shadow-xl z-50 text-sm font-medium">
                            {toast.message}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
}


const EmptyNotifications = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center text-center mt-20 px-6"
        >
            {/* Icon */}
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 mb-4">
                <FiBellOff size={28} className="text-gray-400" />
            </div>

            {/* Title */}
            <h2 className="text-lg font-semibold text-[#0F172A]">
                No notifications yet
            </h2>

            {/* Description */}
            <p className="text-sm text-gray-500 mt-1 max-w-xs">
                You're all caught up! We'll notify you when something new happens.
            </p>
        </motion.div>
    );
};