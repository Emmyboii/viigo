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

export interface GymType {
    id: number;
    name: string;
    slug: string;
    owner_email: string;
    phone_number: string;
    location: string;
    address_line_1: string,
    address_line_2: string,
    city: string,
    state: string,
    postal_code: string,
    latitude: string;
    longitude: string;
    open_time: string;
    close_time: string;
    open_status: string;
    hourly_rate: number;
    distance: string;
    images: Image[];
    amenities: Amenity[];
    rules: Rule[];
    peak_morning?: [string, string][];
    peak_evening?: [string, string][];
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
    address_line_2: string,
    city: string,
    state: string,
    postal_code: string,
    latitude: string;
    longitude: string;
    open_time: string;
    close_time: string;
    open_status: string;
    hourly_rate: number;
    distance: string;
    images: Image[];
    amenities: Amenity[];
    rules: Rule[];
    peak_morning?: [string, string][];
    peak_evening?: [string, string][];
    calendar_availability?: any[];
}


type NotificationTypeEnum =
    | "SESSION"
    | "PAYMENT"
    | "SYSTEM"
    | "PROMO"
    | "NEW_BOOKING_RECEIVED"
    | "BOOKING_CREATED";


export interface NotificationType {
    id: number;
    title: string;
    message: string;
    notification_type: NotificationTypeEnum;
    is_read: boolean;
    created_at: string;
}

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

    recommendedGyms: GymCard[];
    setRecommendedGyms: React.Dispatch<React.SetStateAction<GymCard[]>>;

    notifications: NotificationType[];
    setNotifications: React.Dispatch<React.SetStateAction<NotificationType[]>>;

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
    searchGyms: (query: string) => Promise<void>;
    fetchGyms: () => Promise<void>;
    fetchRecommendedGyms: () => Promise<void>;
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


    const fetchUser = async () => {
        try {
            const data = await request("/api/user/profile/");
            setUserData(data?.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchGyms = async () => {
        setIsLoading(true);
        try {
            const data = await request("/gymowner/gyms/all/");
            setGyms(data?.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRecommendedGyms = async () => {
        setLoading2(true);
        try {
            const data = await request("/client/gyms/recommended/");
            setRecommendedGyms(data?.data || []);
        } catch (err) {
            console.error("Failed to fetch recommended gyms", err);
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
        try {
            const data = await request("/api/user/location/");

            const address = data?.data.current_address

            const parts = address.split(",");
            const state = parts[parts.length - 2]?.trim();
            const country = parts[parts.length - 1]?.trim();

            setLocation(`${state}, ${country}`);
        } catch (err) {
            console.error(err);
        }
    };

    const saveLocation = async (lat: string, lng: string, address: string) => {
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
        if (userData) {
            fetchGyms();
        }
    }, [userData]);

    useEffect(() => {
        if (userData) {
            fetchRecommendedGyms();
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

                fetchRecommendedGyms,
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