import { useEffect, useState } from "react";
import {
    FiArrowLeft,
    FiCalendar,
    FiCreditCard,
} from "react-icons/fi";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import Footer from "../components/Footer";
// import { IoStopCircle } from "react-icons/io5";
import { IoMdPlayCircle } from "react-icons/io";
import { FaClock } from "react-icons/fa";
import { useNavigate } from "react-router";
import { FiBellOff } from "react-icons/fi";
import { useAppContext } from "../context/AppContext";
interface NotificationType {
    id: number;
    title: string;
    message: string;
    notification_type: "SESSION" | "PAYMENT" | "SYSTEM" | "PROMO";
    is_read: boolean;
    created_at: string;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const timeAgo = (dateString: string) => {
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


export default function Notifications({ Loading }: { Loading: boolean }) {

    const { hasUnread } = useAppContext()

    const [data, setData] = useState<NotificationType[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await fetch(`${backendUrl}/notification/notifications/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const result = await res.json();
                setData(result.data || []);
            } catch (err) {
                console.error("Failed to fetch notifications", err);
            }
        };

        fetchNotifications();
    }, []);

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
            setData((prev) =>
                prev.map((item) =>
                    item.id === id ? { ...item, is_read: true } : item
                )
            );
        } catch (err) {
            console.error("Failed to mark as read", err);
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
            setData((prev) =>
                prev.map(n => ({
                    ...n,
                    is_read: true,
                }))
            );
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "SESSION":
                return <FiCalendar size={18} />;
            case "PAYMENT":
                return <FiCreditCard size={18} />;
            case "SYSTEM":
                return <FaClock size={18} />;
            case "PROMO":
                return <IoMdPlayCircle size={18} />;
            default:
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


    return (
        <div className="min-h-screen pb-24">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white">
                <div onClick={() => navigate(-1)} className="flex items-center gap-3">
                    <FiArrowLeft size={20} />
                    <h1 className="text-lg font-semibold">Notifications</h1>
                </div>

                {data.length > 0 && (
                    <button
                        onClick={markAllAsRead}
                        disabled={hasUnread}
                        className="text-blue-600 text-sm font-medium"
                    >
                        Mark All as Read
                    </button>
                )}
            </div>

            {/* List */}
            <div className="p-4 space-y-4">
                {data.length === 0 ? (
                    <EmptyNotifications />
                ) : (
                    <AnimatePresence>
                        {data.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ x: 100, opacity: 0 }}
                                animate={controls}
                                exit={{ x: 100, opacity: 0 }}
                                layout
                                className="relative"
                            >
                                {/* Swipe-to-delete background */}
                                {/* <div className="absolute inset-0 rounded-lg flex items-center justify-end pr-4">
                                    <span className="text-white font-semibold">Delete</span>
                                </div> */}

                                {/* Notification card */}
                                <motion.div
                                    onClick={() => {
                                        if (!item.is_read) {
                                            markAsRead(item.id);
                                        }
                                    }}
                                    drag="x"
                                    // dragConstraints={{ left: 0, right: 0 }}
                                    // dragElastic={0.2}
                                    // onDragEnd={(_, info: PanInfo) => {
                                    //     if (info.offset.x > 100 || info.offset.x < -100) {
                                    //         deleteNotification(item.id);
                                    //     }
                                    // }}
                                    // whileTap={{ cursor: "grabbing" }}
                                    className={`flex gap-3 p-2 rounded-lg items-center border border-[#E2E8F0] relative z-10 cursor-grab transition ${!item.is_read
                                        ? "border-l-blue-500 border-l-4"
                                        : "border-[#E2E8F0] bg-white border"
                                        }`}
                                >
                                    {/* Icon */}
                                    <div className="w-10 h-10 rounded-full bg-[#CBD5E1] flex items-center justify-center text-[#0F172A]">
                                        {getIcon(item.notification_type)}
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

            <Footer />
        </div >
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