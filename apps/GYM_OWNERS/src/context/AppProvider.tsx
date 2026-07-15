import { type ReactNode, useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    AppContext,
    type GymType,
    type WalletType,
    type UserType,
    type DisplayType,
    type Booking,
    type NotificationType,
    type WalletDashboard,
    type WalletTransaction,
    ApiRequestError,
    type ApiErrorPayload,
} from "./AppContext";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// interface ApiErrorPayload {
//     message?: string;
//     data?: {
//         error?: string;
//         errors?: string;
//         [key: string]: unknown;
//     };
//     [key: string]: unknown;
// }

interface ApiResponse<T = unknown> {
    status?: string;
    message?: string;
    data?: T;
    [key: string]: unknown;
}

// class ApiRequestError extends Error {
//     data?: ApiErrorPayload | null;

//     constructor(message: string, data?: ApiErrorPayload | null) {
//         super(message);
//         this.name = "ApiRequestError";
//         this.data = data;
//     }
// }

// provider
export const AppProvider = ({ children }: { children: ReactNode }) => {

    const navigate = useNavigate()
    const [loading, setLoading] = useState(true);

    const location = useLocation();

    const publicRoutes = ["/login", "/register", "/forgot-password"];
    const isPublicRoute = publicRoutes.includes(location.pathname);

    const getValidToken = () => {
        const token = localStorage.getItem("token");
        const timestamp = localStorage.getItem("tokenTimestamp");

        if (!token || !timestamp) return null;

        const TWO_HOURS = 2 * 60 * 60 * 1000;
        const isExpired = Date.now() - Number(timestamp) > TWO_HOURS;

        if (isExpired) {
            localStorage.removeItem("token");
            localStorage.removeItem("tokenTimestamp");
            return null;
        }

        return token;
    };

    const isAuthenticated = Boolean(getValidToken());

    const [userData, setUserData] = useState<UserType | null>(null);
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [display, setDisplay] = useState<DisplayType>(
        () => (localStorage.getItem("gymDisplay") as "details" | "edit" | "create") || "details"
    );
    const savedDisplay = localStorage.getItem("gymDisplay");
    const [displayWallet, setDisplayWallet] = useState<DisplayType>("details");
    const [walletDashboard, setWalletDashboard] = useState<WalletDashboard | null>(null);
    const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);

    const hasUnread = notifications.some(n => !n.is_read);

    const [isLoading, setIsLoading] = useState(true);
    const [selectedGym, setSelectedGym] = useState<GymType | null>(null);
    const [wallet, setWallet] = useState<WalletType | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [notificationsLoading, setNotificationsLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [networkError, setNetworkError] = useState(false);
    const [isWalletDashboardLoading, setIsWalletDashboardLoading] = useState(false);

    useEffect(() => {
        const handleOffline = () => setIsOffline(true);
        const handleOnline = () => {
            setIsOffline(false);
            setNetworkError(false);
        };

        window.addEventListener("offline", handleOffline);
        window.addEventListener("online", handleOnline);

        return () => {
            window.removeEventListener("offline", handleOffline);
            window.removeEventListener("online", handleOnline);
        };
    }, []);

    const isNetworkError = (err: unknown) =>
        err instanceof TypeError && /fetch/i.test(err.message);

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

    const request = useCallback(async function request<T = ApiResponse>(
        url: string,
        options?: RequestInit
    ): Promise<T> {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("No token");
        }

        const res = await fetch(`${backendUrl}${url}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                ...(options?.headers || {}),
            },
        });

        if (res.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("tokenTimestamp");
            navigate("/login", { replace: true });
            throw new Error("Unauthorized");
        }

        let body: ApiErrorPayload | null = null;
        try {
            body = (await res.json()) as ApiErrorPayload;
        } catch {
            // response wasn't valid JSON — leave body as null
        }

        if (!res.ok) {
            throw new ApiRequestError(body?.message || "Request failed", body);
        }

        return body as T;
    }, [navigate]);

    const fetchUser = useCallback(async () => {
        try {
            const data = await request<ApiResponse<UserType>>("/api/user/profile/");
            setUserData(data?.data ?? null);
        } catch (err) {
            console.error(err);
        }
    }, [request]);

    const fetchGyms = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await request<ApiResponse<GymType[]>>("/gymowner/gyms/");
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
                if (savedDisplay === "edit") {
                    setDisplay("edit");
                } else {
                    setDisplay("details");
                }
            }

        } catch (err) {
            console.error(err);
            setDisplay("details");
            if (isNetworkError(err) || !navigator.onLine) {
                setNetworkError(true);
            }
        } finally {
            setIsLoading(false);
        }
    }, [request, savedDisplay]);

    const fetchWallet = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await request<ApiResponse<WalletType>>("/wallet/");
            const wallet: WalletType | null = data.data || null;

            if (!wallet) {
                setDisplayWallet("create");
                return;
            }

            setWallet(wallet);

            if (!wallet.account_holder_name) {
                setDisplayWallet("edit");
                // } else if (wallet.account_holder_name && displayWallet === 'details') {
            } else {

                setDisplayWallet("details");
            }

        } catch (err) {
            console.error(err);
            setDisplayWallet("details");
            if (isNetworkError(err) || !navigator.onLine) {
                setNetworkError(true);
            }
        } finally {
            setIsLoading(false);
        }
    }, [request]);

    const fetchWalletDashboard = useCallback(async (period: "week" | "month" = "week") => {

        const token = localStorage.getItem("token");

        if (!token) return

        setIsWalletDashboardLoading(true);
        try {
            const data = await request<ApiResponse<WalletDashboard>>(`/wallet/dashboard/?period=${period}`);
            setWalletDashboard(data.data ?? null);
        } catch (err) {
            console.error(err);
            if (isNetworkError(err) || !navigator.onLine) {
                setNetworkError(true);
            }
        } finally {
            setIsWalletDashboardLoading(false);
        }
    }, [request]);

    const fetchWalletTransactions = useCallback(async () => {
        try {
            const data = await request<ApiResponse<WalletTransaction[]>>("/transactions/history/");
            setWalletTransactions(data.data || []);
        } catch (err) {
            console.error("Error fetching wallet transactions:", err);
            setWalletTransactions([]);
            if (isNetworkError(err) || !navigator.onLine) {
                setNetworkError(true);
            }
        }
    }, [request]);

    const fetchNotifications = useCallback(async () => {
        setNotificationsLoading(true);

        try {
            const data = await request<ApiResponse<NotificationType[]>>("/notification/notifications/");
            setNotifications(data.data || []);
        } catch (err) {
            console.error(err);
            if (isNetworkError(err) || !navigator.onLine) {
                setNetworkError(true);
            }
        } finally {
            setNotificationsLoading(false);
        }
    }, [request]);

    const fetchBookings = useCallback(async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        try {
            const data = await request<ApiResponse<Booking[]>>("/gymowner/owner/bookings/");
            setBookings(data?.data || []);
        } catch (err) {
            console.error(err);
            if (isNetworkError(err) || !navigator.onLine) {
                setNetworkError(true);
            }
        } finally {
            setIsLoading(false);
        }
    }, [request]);

    // useEffect(() => {
    //     if (!isAuthenticated || isPublicRoute) return;

    //     fetchUser();
    // }, [isAuthenticated, isPublicRoute, fetchUser]);

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
        if (!isAuthenticated || isPublicRoute) return;

        fetchUser();
        // fetchWalletDashboard();
        fetchWalletTransactions();
        fetchNotifications();
        fetchBookings();
    }, [
        isAuthenticated,
        isPublicRoute,
        fetchUser,
        // fetchWalletDashboard,
        fetchWalletTransactions,
        fetchNotifications,
        fetchBookings,
    ]);

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
                isWalletDashboardLoading,

                fetchWalletDashboard,
                fetchWalletTransactions,
                fetchNotifications,
                fetchBookings,
                fetchUser,
                fetchGyms,
                fetchWallet,
                isOffline,
                networkError,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};