import { type ReactNode, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    AppContext,
    type GymType,
    type UserType,
    type DisplayType,
    type Booking,
    type NotificationType
} from "./AppContext";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// provider
export const AppProvider = ({ children }: { children: ReactNode }) => {

    const navigate = useNavigate()
    const [loading, setLoading] = useState(true);

    const [userData, setUserData] = useState<UserType | null>(null);
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [display, setDisplay] = useState<DisplayType>("details");

    const hasUnread = notifications.some(n => !n.is_read);

    useEffect(() => {
        const stored = localStorage.getItem("gymDisplay");
        if (stored === "details" || stored === "edit" || stored === "create") {
            setDisplay(stored);
        }
    }, []);

    const [isLoading, setIsLoading] = useState(true);
    const [selectedGym, setSelectedGym] = useState<GymType | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [notificationsLoading, setNotificationsLoading] = useState(true);

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

    const fetchNotifications = useCallback(async () => {
        setNotificationsLoading(true);
        try {

            const token = localStorage.getItem("token");

            if (!token) return

            const res = await fetch(`${backendUrl}/notification/notifications/`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
            });

            const data = await res.json()
            const notificationsData: NotificationType[] = data.data || [];

            setNotifications(notificationsData);

        } catch (err) {
            console.error(err);
        } finally {
            setNotificationsLoading(false);
        }
    }, []);

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
        fetchNotifications()
    }, [fetchNotifications]);

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
            const recentSearches = localStorage.getItem("recentSearches");
            localStorage.clear();
            if (recentSearches) {
                localStorage.setItem("recentSearches", recentSearches);
            }
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
                hasUnread,
                notifications,
                setNotifications,
                setBookings,
                bookings,
                setNotificationsLoading,
                notificationsLoading,

                fetchBookings,
                fetchUser,
                fetchGyms,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};