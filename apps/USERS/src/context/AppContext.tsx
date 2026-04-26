import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";


const backendUrl = import.meta.env.VITE_BACKEND_URL;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

type UserType = {
    full_name: string;
    profile_image: string | null;
    email: string;
    phone_number: string | null;
    user_type: string;
    total_fitness_hours: number;
};

interface Amenity {
    id: number;
    name: string;
    icon: string;
}

interface Rule {
    id: number;
    description: string;
}

export interface RecommendedWorkoutTimings {
    less_crowded_hours: string;
    peak_hours: {
        morning: string;
        evening: string;
    };
}

export interface GymType {
    id: number;
    name: string;
    slug: string;
    owner_email: string;
    phone_number: string;
    location: string;
    address_line_1: string,
    area: string,
    city: string,
    state: string,
    postal_code: string,
    latitude: string;
    recommended_workout_timings?: RecommendedWorkoutTimings;
    longitude: string;
    open_time: string;
    close_time: string;
    open_status: string;
    hourly_rate: number;
    distance: string;
    images: Image[];
    amenities: Amenity[];
    rules: Rule[];
    peak_morning?: ([string, string] | { start: string; end: string })[];
    peak_evening?: ([string, string] | { start: string; end: string })[];
    calendar_availability?: any[];
}

export interface Image {
    id: number;
    image: string;
}

export interface GymCard {
    id: number;
    name: string;
    slug: string;
    owner_email: string;
    phone_number: string;
    location: string;
    address_line_1: string,
    area: string,
    city: string,
    state: string,
    postal_code: string,
    latitude: string;
    recommended_workout_timings?: RecommendedWorkoutTimings;
    longitude: string;
    open_time: string;
    close_time: string;
    open_status: string;
    hourly_rate: number;
    distance: string;
    images: Image[];
    amenities: Amenity[];
    rules: Rule[];
    peak_morning?: ([string, string] | { start: string; end: string })[];
    peak_evening?: ([string, string] | { start: string; end: string })[];
    calendar_availability?: any[];
}


export type NotificationTypeEnum =
    | "SESSION"
    | "PAYMENT"
    | "SYSTEM"
    | "PROMO"
    | "BOOKING"
    | "WALLET"
    | "WITHDRAWAL";


export interface NotificationType {
    id: number;
    title: string;
    message: string;
    notification_type: NotificationTypeEnum;
    is_read: boolean;
    created_at: string;
}

export interface BookingConfigType {
    platform_fee: string;
    gst_fee: string;
    cancellation_fee: string;
}

export interface PendingRating {
    id: number;
    booking_reference: string;
    gym_name: string;
    booking_date: string;
    check_out_time: string;
}

export interface PendingRatingCard {
    id: number;
    booking_reference: string;
    gym_name: string;
    booking_date: string;
    gym_image: string;
    gym_hourly_rate: string;
    duration_in_hours: string;
    status: string;
}

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

    return `${backendUrl}${path}`;
};

type AppContextType = {
    userData: UserType | null;
    setUserData: (user: UserType | null) => void;

    gyms: GymType[];
    setGyms: (gyms: GymType[]) => void;

    latitude: string;
    longitude: string;

    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    loading2: boolean;
    setLoading2: React.Dispatch<React.SetStateAction<boolean>>;
    hasUnread: boolean;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    location: string;
    setLocation: React.Dispatch<React.SetStateAction<string>>;

    bookingConfig: BookingConfigType;
    setBookingConfig: React.Dispatch<React.SetStateAction<BookingConfigType>>;

    recommendedGyms: GymCard[];
    setRecommendedGyms: React.Dispatch<React.SetStateAction<GymCard[]>>;

    notifications: NotificationType[];
    setNotifications: React.Dispatch<React.SetStateAction<NotificationType[]>>;

    pendingRatings: PendingRating | null;
    setPendingRatings: React.Dispatch<React.SetStateAction<PendingRating | null>>;

    pendingRatingsCard: PendingRatingCard | null;
    setPendingRatingsCard: React.Dispatch<React.SetStateAction<PendingRatingCard | null>>;

    searchResults: GymCard[];

    searchLoading: boolean;
    sortLabel: string
    setSortLabel: React.Dispatch<React.SetStateAction<string>>;

    fetchNearbyGyms: (lat: number, long: number) => Promise<void>;
    nearbyGyms: GymCard[];
    setNearbyGyms: React.Dispatch<React.SetStateAction<GymCard[]>>;

    amenities: Amenity[];

    // API FUNCTIONS 🔥
    fetchUser: () => Promise<void>;
    fetchNotifications: () => Promise<void>;
    fetchBookingConfig: () => Promise<void>;
    searchGyms: (query: string) => Promise<void>;
    fetchGyms: (lat: number, long: number) => Promise<void>;
    fetchRecommendedGyms: (lat: number, long: number) => Promise<void>;
    fetchFilteredGyms: (filters: any) => Promise<void>;
    fetchSortedGyms: (sort: string, label: string) => Promise<void>;
    fetchLocation: () => Promise<void>;
    fetchCurrentLocation: () => void;
};

// create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// provider
export const AppProvider = ({ children }: { children: ReactNode }) => {

    const navigate = useNavigate()
    const [loading, setLoading] = useState(true);
    const [loading2, setLoading2] = useState(true);

    const [userData, setUserData] = useState<UserType | null>(null);
    const [location, setLocation] = useState<string>("");
    const [bookingConfig, setBookingConfig] = useState<BookingConfigType>({
        platform_fee: "",
        gst_fee: "",
        cancellation_fee: ""
    });
    const [latitude, setLatitude] = useState<string>("");
    const [longitude, setLongitude] = useState<string>("");
    const [searchResults, setSearchResults] = useState<GymCard[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [gyms, setGyms] = useState<GymType[]>([]);
    const [recommendedGyms, setRecommendedGyms] = useState<GymCard[]>([]);
    const [nearbyGyms, setNearbyGyms] = useState<GymCard[]>([]);
    const [sortLabel, setSortLabel] = useState("");
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [pendingRatings, setPendingRatings] = useState<PendingRating | null>(null);
    const [pendingRatingsCard, setPendingRatingsCard] = useState<PendingRatingCard | null>(null);

    const hasUnread = notifications.some(n => !n.is_read);

    const token = localStorage.getItem("token");

    const request = async (url: string, options?: RequestInit) => {
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
    };

    const searchGyms = async (query: string) => {
        if (!query) return;

        try {
            setSearchLoading(true);

            const res = await fetch(
                `${backendUrl}/client/gyms/search/?search=${query}`
            );

            const data = await res.json();

            setSearchResults(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setSearchLoading(false);
        }
    };

    useEffect(() => {
        const fetchAmenities = async () => {
            const token = localStorage.getItem("token");

            if (!token) return

            try {
                const res = await fetch(`${backendUrl}/gymowner/amenities/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!res.ok) throw new Error("Failed to fetch amenities");
                setAmenities(data.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchAmenities();
    }, []);

    useEffect(() => {
        const fetchPendingRatingCard = async () => {
            const token = localStorage.getItem("token");

            if (!token) return

            try {
                const res = await fetch(`${backendUrl}/client/sessions/pending-ratings-card/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!res.ok) throw new Error("Failed to fetch pending rating card");
                setPendingRatingsCard(data.data?.length ? data.data[0] : null);
            } catch (err) {
                console.error(err);
            }
        };
        fetchPendingRatingCard();
    }, []);

    useEffect(() => {
        const fetchPendingRatings = async () => {
            const token = localStorage.getItem("token");

            if (!token) return

            try {
                const res = await fetch(`${backendUrl}/client/sessions/pending-ratings/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!res.ok) throw new Error("Failed to fetch pending ratings");
                setPendingRatings(data.data?.length ? data.data[0] : null);
            } catch (err) {
                console.error(err);
            }
        };
        fetchPendingRatings();
    }, []);


    const fetchUser = async () => {
        try {
            const data = await request("/api/user/profile/");
            setUserData(data?.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchGyms = async (lat: number, long: number) => {
        setIsLoading(true);
        try {
            const data = await request(`/gymowner/gyms/all/?lat=${lat}&long=${long}`);
            setGyms(data?.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRecommendedGyms = async (lat: number, long: number) => {
        setLoading2(true);
        try {
            const data = await request(`/client/gyms/recommended/?lat=${lat}&long=${long}`);
            setRecommendedGyms(data?.data || []);
        } catch (err) {
            console.error("Failed to fetch recommended gyms", err);
        } finally {
            setLoading2(false);
        }
    };

    const fetchBookingConfig = async () => {
        setLoading2(true);
        try {
            const data = await request(`/booking-config/`);
            setBookingConfig(data?.data || []);
        } catch (err) {
            console.error("Failed to fetch booking config", err);
        } finally {
            setLoading2(false);
        }
    };

    const fetchNearbyGyms = async (lat: number, long: number) => {
        setLoading2(true);
        try {
            const data = await request(
                `/client/gyms/nearby/?lat=${lat}&long=${long}`
            );

            setNearbyGyms(data?.data || []);
        } catch (err) {
            console.error("Failed to fetch nearby gyms", err);
        } finally {
            setLoading2(false);
        }
    };

    const fetchLocation = async () => {
        if (!token) return;

        try {
            const data = await request("/api/user/location/");
            const address = data?.data.current_address;

            if (!address) return;

            const parts: string[] = address.split(",").map((p: string) => p.trim());

            // ✅ STATE: usually second to last
            let state = parts[parts.length - 2] || "";

            // normalize state (remove numbers if any)
            state = state.replace(/\d+/g, "").trim();

            // ✅ CITY: find closest valid part before state
            let city = "";

            for (let i = parts.length - 3; i >= 0; i--) {
                let cleaned = parts[i].replace(/\d+/g, "").trim();

                // skip empty, numeric, or street-like values
                if (
                    !cleaned ||
                    /^\d+$/.test(cleaned) ||
                    cleaned.toLowerCase().includes("street") ||
                    cleaned.toLowerCase().includes("st") ||
                    cleaned.toLowerCase().includes("road") ||
                    cleaned.toLowerCase().includes("rd")
                ) {
                    continue;
                }

                city = cleaned;
                break;
            }

            setLocation(`${city}, ${state}`);
        } catch (err) {
            console.error(err);
        }
    };

    const saveLocation = async (lat: string, lng: string, address: string) => {

        if (!token) return

        try {
            await request("/api/user/location/", {
                method: "PUT",
                body: JSON.stringify({
                    latitude: lat,
                    longitude: lng,
                    current_address: address,
                }),
            });
        } catch (err) {
            console.error(err);
        }
    };

    const fetchNotifications = async () => {

        if (!token) return

        setIsLoading(true);
        try {
            const data = await request("/notification/notifications/");
            const notificationsData: NotificationType[] = data.data || [];

            setNotifications(notificationsData);

        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const getAddressFromCoords = async (lat: string, lng: string) => {

        if (!token) return

        try {
            const res = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`
            );

            const data = await res.json();

            if (data.status === "OK" && data.results.length > 0) {
                return data.results[0].formatted_address;
            }

            return "";
        } catch (err) {
            console.error("Failed to fetch address:", err);
            return "";
        }
    };

    const fetchCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude.toFixed(6);
                const lng = position.coords.longitude.toFixed(6);

                setLatitude(lat);
                setLongitude(lng);

                const address = await getAddressFromCoords(lat, lng);

                await saveLocation(lat, lng, address);
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    alert("Please allow location access to find gyms near you.");
                } else {
                    console.error(error);
                }
            }
        );
    };

    const fetchFilteredGyms = async (filters: any) => {
        try {
            setSearchLoading(true);
            setSortLabel("")

            const params = new URLSearchParams();

            params.append("lat", latitude);
            params.append("long", longitude);

            if (filters.radius) params.append("radius", filters.radius);
            if (filters.min_price) params.append("min_price", filters.min_price);
            if (filters.max_price) params.append("max_price", filters.max_price);
            if (filters.sort) params.append("sort", filters.sort);

            if (filters.amenities && filters.amenities.length > 0) {
                params.append("amenities", filters.amenities.join(","));
            }

            const res = await request(
                `/client/gyms/filter/?${params.toString()}`
            );

            setSearchResults(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setSearchLoading(false);
        }
    };

    const fetchSortedGyms = async (sort: string, label: string) => {
        try {
            setSearchLoading(true);

            const params = new URLSearchParams();

            params.append("lat", latitude);
            params.append("long", longitude);
            params.append("sort", sort);

            const res = await request(
                `/client/gyms/sort/?${params.toString()}`
            );

            setSearchResults(res.data || []);
            setSortLabel(label);

        } catch (err) {
            console.error(err);
        } finally {
            setSearchLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (userData && latitude && longitude) {
            fetchGyms(Number(latitude), Number(longitude));
        }
    }, [userData, latitude, longitude]);

    useEffect(() => {
        if (userData && latitude && longitude) {
            fetchRecommendedGyms(Number(latitude), Number(longitude));
        }
    }, [userData, latitude, longitude]);

    useEffect(() => {
        if (userData) {
            fetchBookingConfig();
        }
    }, [userData]);

    useEffect(() => {
        if (userData && latitude && longitude) {
            fetchNearbyGyms(Number(latitude), Number(longitude));
        }
    }, [userData, latitude, longitude]);

    useEffect(() => {
        fetchLocation();
        fetchCurrentLocation();
    }, []);

    useEffect(() => {
        fetchNotifications()
    }, []);

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
    }, []);

    return (
        <AppContext.Provider
            value={{
                userData,
                setUserData,
                gyms,
                setGyms,
                latitude,
                longitude,
                loading,
                loading2,
                setLoading,
                setLoading2,
                isLoading,
                setIsLoading,
                location,
                setLocation,
                hasUnread,
                recommendedGyms,
                setRecommendedGyms,
                bookingConfig,
                setBookingConfig,
                nearbyGyms,
                setNearbyGyms,
                fetchNearbyGyms,
                searchGyms,
                searchResults,
                searchLoading,
                notifications,
                setNotifications,
                sortLabel,
                setSortLabel,
                amenities,
                pendingRatings,
                setPendingRatings,
                pendingRatingsCard,
                setPendingRatingsCard,

                fetchRecommendedGyms,
                fetchBookingConfig,
                fetchNotifications,
                fetchUser,
                fetchGyms,
                fetchLocation,
                fetchCurrentLocation,
                fetchFilteredGyms,
                fetchSortedGyms,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

// custom hook (VERY IMPORTANT)
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used inside AppProvider");
    }
    return context;
};