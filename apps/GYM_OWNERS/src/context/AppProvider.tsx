import { type ReactNode, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    AppContext,
    type GymType,
    type UserType,
    type DisplayType,
    type Booking
} from "./AppContext";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface NotificationType {
    id: number;
    title: string;
    message: string;
    notification_type: "SESSION" | "PAYMENT" | "SYSTEM" | "PROMO";
    is_read: boolean;
    created_at: string;
}

// provider
export const AppProvider = ({ children }: { children: ReactNode }) => {

    const navigate = useNavigate()
    const [loading, setLoading] = useState(true);

    const [userData, setUserData] = useState<UserType | null>(null);
    const [hasUnread, setHasUnread] = useState(false);

    const [display, setDisplay] = useState<DisplayType>("details");

    useEffect(() => {
        const stored = localStorage.getItem("gymDisplay");
        if (stored === "details" || stored === "edit" || stored === "create") {
            setDisplay(stored);
        }
    }, []);

    const [isLoading, setIsLoading] = useState(true);
    const [selectedGym, setSelectedGym] = useState<GymType | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);

    useEffect(() => {
        localStorage.setItem("gymDisplay", display);
    }, [display]);

    const request = useCallback(async (url: string, options?: RequestInit) => {
        const token = localStorage.getItem("token");

        if (!token) return

        const res = await fetch(`${backendUrl}${url}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : "",
                ...(options?.headers || {}),
            },
        });

        if (res.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("tokenTimestamp");
            navigate("/login");
            throw new Error("Unauthorized");
        }

        if (!res.ok) {
            throw new Error("Request failed");
        }

        return res.json();
    }, [navigate]);

    const fetchUser = useCallback(async () => {
        try {
            const data = await request("/api/user/profile/");
            setUserData(data?.data);
        } catch (err) {
            console.error(err);
        }
    }, [request]);

    const fetchGyms = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await request("/gymowner/gyms/");
            const gyms: GymType[] = data.data || [];

            if (gyms.length === 0) {
                setDisplay("create");
                return;
            }

            setSelectedGym(gyms[0]);
            setDisplay("details");
        } catch (err) {
            console.error(err);
            setDisplay("create");
        } finally {
            setIsLoading(false);
        }
    }, [request]);

    const fetchBookings = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await request("/gymowner/owner/bookings/");
            const bookings = data.data || [];


            setBookings(bookings);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [request]);

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await request("/notification/notifications/");
            const notifications: NotificationType[] = data.data || [];

            const unreadExists = notifications.some(
                (item) => !item.is_read
            );

            setHasUnread(unreadExists);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [request]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        if (userData) {
            fetchGyms();
        }
    }, [userData, fetchGyms]);

    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications]);

    useEffect(() => {
        fetchBookings()
    }, [fetchBookings]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 3200);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const timestamp = localStorage.getItem("tokenTimestamp");
        if (!timestamp) return;

        const savedTime = Number(timestamp);
        const TWO_HOURS = 2 * 60 * 60 * 1000;

        const remainingTime = TWO_HOURS - (Date.now() - savedTime);

        if (remainingTime <= 0) {
            localStorage.clear();
            navigate("/login");
            return;
        }

        const timer = setTimeout(() => {
            localStorage.clear();
            navigate("/login");
        }, remainingTime);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <AppContext.Provider
            value={{
                userData,
                setUserData,
                selectedGym,
                setSelectedGym,
                loading,
                setLoading,
                isLoading,
                setIsLoading,
                display,
                setDisplay,
                setHasUnread,
                hasUnread,
                setBookings,
                bookings,

                fetchBookings,
                fetchUser,
                fetchGyms,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};