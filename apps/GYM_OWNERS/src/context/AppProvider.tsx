import { type ReactNode, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    AppContext,
    type GymType,
    type WalletType,
    type UserType,
    type DisplayType,
    type Booking,
    type NotificationType,
    type WalletDashboard,
    type WalletTransaction
} from "./AppContext";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// provider
export const AppProvider = ({ children }: { children: ReactNode }) => {

    const navigate = useNavigate()
    const [loading, setLoading] = useState(true);

    const [userData, setUserData] = useState<UserType | null>(null);
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [display, setDisplay] = useState<DisplayType>("details");
    const [displayWallet, setDisplayWallet] = useState<DisplayType>("details");
    const [walletDashboard, setWalletDashboard] = useState<WalletDashboard | null>(null);
    const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);

    const hasUnread = notifications.some(n => !n.is_read);

    const [isLoading, setIsLoading] = useState(true);
    const [selectedGym, setSelectedGym] = useState<GymType | null>(null);
    const [wallet, setWallet] = useState<WalletType | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [notificationsLoading, setNotificationsLoading] = useState(true);

    useEffect(() => {
        localStorage.setItem("gymDisplay", display);
    }, [display]);

    useEffect(() => {
        localStorage.setItem("walletDisplay", displayWallet);
    }, [displayWallet]);

    useEffect(() => {
        const stored = localStorage.getItem("gymDisplay");
        if (stored === "details" || stored === "edit" || stored === "create") {
            setDisplay(stored);
        }
    }, []);

    useEffect(() => {
        const stored = localStorage.getItem("walletDisplay");
        if (stored === "details" || stored === "edit" || stored === "create") {
            setDisplayWallet(stored);
        }
    }, []);

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

            // No gyms created
            if (!gyms.length) {
                setDisplay("create");
                return;
            }

            const gym = gyms[0];

            // Store gym FIRST
            setSelectedGym(gym);

            // Gym exists but no images
            if (!gym.images || gym.images.length === 0) {
                setDisplay("edit");
            } else {
                setDisplay("details");
            }

        } catch (err) {
            console.error(err);
            setDisplay("create");
        } finally {
            setIsLoading(false);
        }
    }, [request]);

    const fetchWallet = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await request("/wallet/");
            const wallet: WalletType | null = data.data || null;

            if (!wallet) {
                setDisplayWallet("create");
                return;
            }

            setWallet(wallet);

            if (!wallet.account_holder_name) {
                setDisplayWallet("edit");
            } else if (wallet.account_holder_name && displayWallet === 'details') {
                setDisplayWallet("details");
            }

        } catch (err) {
            console.error(err);
            setDisplayWallet("create");
        } finally {
            setIsLoading(false);
        }
    }, [request, displayWallet]);

    const fetchWalletDashboard = useCallback(async () => {

        const token = localStorage.getItem("token");

        if (!token) return

        setIsLoading(true);
        try {
            const data = await request("/wallet/dashboard/");
            const dashboard: WalletDashboard = data[0];

            setWalletDashboard(dashboard);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [request]);

    const fetchWalletTransactions = useCallback(async () => {

        const token = localStorage.getItem("token");

        if (!token) return

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/wallet/transactions/`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to fetch wallet transactions");

            const data = await res.json();
            setWalletTransactions(data || []);
        } catch (err) {
            console.error("Error fetching wallet transactions:", err);
            setWalletTransactions([]);
        }
    }, []);

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
            const bookings = data?.data || [];


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
        if (userData) {
            fetchWallet();
        }
    }, [userData, fetchWallet]);

    useEffect(() => {
        fetchWalletDashboard();
    }, [fetchWalletDashboard]);

    useEffect(() => {
        fetchWalletTransactions();
    }, [fetchWalletTransactions]);

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
                request,
                userData,
                setUserData,
                selectedGym,
                setSelectedGym,
                wallet,
                setWallet,
                loading,
                setLoading,
                isLoading,
                setIsLoading,
                display,
                setDisplay,
                displayWallet,
                setDisplayWallet,
                hasUnread,
                notifications,
                setNotifications,
                setBookings,
                bookings,
                setNotificationsLoading,
                notificationsLoading,
                walletDashboard,
                walletTransactions,

                fetchWalletDashboard,
                fetchWalletTransactions,
                fetchBookings,
                fetchUser,
                fetchGyms,
                fetchWallet
            }}
        >
            {children}
        </AppContext.Provider>
    );
};