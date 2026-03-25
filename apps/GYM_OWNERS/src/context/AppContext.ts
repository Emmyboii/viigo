import { createContext, useContext, } from "react";

export type UserType = {
    full_name: string;
    profile_image: string | null;
    email: string;
    phone_number: string | null;
    user_type: string;
    total_fitness_hours: number;
};

export interface Amenity {
    id: number;
    name: string;
    icon: string;
}

export interface Rule {
    id: number;
    description: string;
}

export interface GymType {
    id: string;
    name: string;
    hourly_rate: string;
    phone_number: string;
    location: string;
    address_line_1: string,
    distance: string;
    area: string,
    city: string,
    state: string,
    postal_code: string,
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

export interface WalletType {
    account_holder_name: string;
    account_number: string;
    ifsc_code: string;
    gst_number: string;
    is_active: boolean;
    balance: string;
    verification_status: "unverified" | "pending" | "verified" | "failed";
    verified_at: string;
    is_locked: string;
}

export type Booking = {
    id: number;
    client_name: string;
    client_image: string;
    display_status: string;
    duration_text: string;
    contextual_text: string;
    display_date: string;
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "ACTIVE" | "COMPLETED";
};

export type NotificationTypeEnum =
    | "BOOKING_CANCELLED"
    | "PAYMENT_SUCCESS_CLIENT"
    | "BOOKING_CREATED"
    | "NEW_BOOKING_PAID_OWNER"
    | "NEW_BOOKING_RECEIVED"
    | "BOOKING_CREATED"
    | "BOOKING_CANCELLED_OWNER";


export interface NotificationType {
    id: number;
    title: string;
    message: string;
    notification_type: NotificationTypeEnum;
    is_read: boolean;
    created_at: string;
}

export interface WalletTransaction {
    id: number;
    guest_name: string;
    amount: string;
    transaction_type: "EARNING" | "REFUND" | "WITHDRAWAL";
    is_credit: string;
    date_formatted: string;
    created_at: string;
}

export interface WalletChartPoint {
    date: string;
    amount: number;
}

export interface WalletDashboard {
    account_balance: string;
    todays_earnings: string;
    todays_bookings: number;
    chart_data: WalletChartPoint[];
    recent_activity: WalletTransaction[];
}

export interface WalletTransaction {
    id: number;
    guest_name: string;
    amount: string;
    transaction_type: "EARNING" | "REFUND" | "WITHDRAWAL";
    is_credit: string;
    date_formatted: string;
    created_at: string;
}

export type DisplayType = "details" | "edit" | "create";

const BASE_URL = "http://api.viigo.in";

export const normalizeImagePath = (url?: string) => {
    if (!url) return "";

    // Remove base URL if it exists
    return url.replace(BASE_URL, "");
};

export const getFullImageUrl = (path: string) => {
    if (!path) return "";

    // If already full URL, return as is
    if (path.startsWith("http")) return path;

    return `${BASE_URL}${path}`;
};

export type AppContextType = {
    userData: UserType | null;
    setUserData: (user: UserType | null) => void;

    selectedGym: GymType | null;
    setSelectedGym: React.Dispatch<React.SetStateAction<GymType | null>>;

    walletDashboard: WalletDashboard | null;

    wallet: WalletType | null;
    setWallet: React.Dispatch<React.SetStateAction<WalletType | null>>;

    display: DisplayType;
    setDisplay: React.Dispatch<React.SetStateAction<DisplayType>>;

    displayWallet: DisplayType;
    setDisplayWallet: React.Dispatch<React.SetStateAction<DisplayType>>;

    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;

    notificationsLoading: boolean;
    setNotificationsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    hasUnread: boolean;

    notifications: NotificationType[];
    setNotifications: React.Dispatch<React.SetStateAction<NotificationType[]>>;

    bookings: Booking[];
    setBookings: (bookings: Booking[]) => void;

    walletTransactions: WalletTransaction[];

    // API FUNCTIONS 🔥
    request: <T = unknown>(url: string, options?: RequestInit) => Promise<T>;
    fetchUser: () => Promise<void>;
    fetchBookings: () => Promise<void>;
    fetchGyms: () => Promise<void>;
    fetchWallet: () => Promise<void>;
    fetchWalletDashboard: () => Promise<void>;
    fetchWalletTransactions: () => Promise<void>;
};

// create context
export const AppContext = createContext<AppContextType | undefined>(undefined);

// custom hook (VERY IMPORTANT)
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used inside AppProvider");
    }
    return context;
};