import { useEffect, useState } from "react";
import { HiLocationMarker, HiOutlineBell } from "react-icons/hi"
import { useNavigate } from "react-router";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface NotificationType {
    id: number;
    title: string;
    message: string;
    notification_type: "SESSION" | "PAYMENT" | "SYSTEM" | "PROMO";
    is_read: boolean;
    created_at: string;
}

interface Amenity {
    id: number;
    name: string;
    icon: string;
}

interface Rule {
    id: number;
    description: string;
}

interface GymType {
    id: string;
    name: string;
    hourly_rate: string;
    phone_number: string;
    location: string;
    open_time: string;
    close_time: string;
    longitude: string;
    latitude: string;
    amenities: Amenity[];
    rules: Rule[];
    images: { id: number; image: string }[];

    peak_morning?: [string, string][];
    peak_evening?: [string, string][];
    calendar_availability?: []

    owner_email: string
}

interface GymProps {
    gym?: GymType | null;
}

export default function Header({ gym }: GymProps) {
    const navigate = useNavigate();
    const [hasUnread, setHasUnread] = useState(false);

    useEffect(() => {
        const checkUnread = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await fetch(`${backendUrl}/notification/notifications/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const result = await res.json();
                const notifications: NotificationType[] = result.data || [];

                const unreadExists = notifications.some(
                    (item) => !item.is_read
                );

                setHasUnread(unreadExists);
            } catch (err) {
                console.error(err);
            }
        };

        checkUnread();
    }, []);

    return (
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
                <HiLocationMarker className="text-[#475569] text-xl" />
                <div className="leading-tight">
                    <div className="font-medium text-sm">{gym?.name}</div>
                    <div className="text-sm font-medium">{gym?.location}</div>
                </div>
            </div>

            <div className="relative">
                <HiOutlineBell
                    onClick={() => navigate("/notifications")}
                    className="text-2xl text-[#475569] cursor-pointer"
                />

                {hasUnread && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
            </div>
        </div>
    );
}
