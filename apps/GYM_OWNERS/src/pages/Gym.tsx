import EditGym from "../components/EditGym";
import GymDetails from "../components/GymDetails";
import { GymOwnerDetailsSkeleton } from "../components/Gymskeletons ";
import NetworkErrorModal from "../components/NetworkErrorModal";
import { useAppContext } from "../context/AppContext";

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
    distance: string;
    location: string;
    address_line_1: string,
    gender_preference: "EVERYONE" | "WOMEN_ONLY" | "MEN_ONLY"
    open_status: string;
    area: string,
    city: string,
    is_open: boolean,
    state: string,
    postal_code: string,
    open_time: string;
    close_time: string;
    longitude: string;
    latitude: string;
    amenities: Amenity[];
    rules: Rule[];
    images: { id: number; image: string }[];

    peak_morning?: ([string, string] | { start: string; end: string })[];
    peak_evening?: ([string, string] | { start: string; end: string })[];
    calendar_availability?: []

    owner_email: string
}

interface GymProps {
    gym?: GymType | null;
    loading: boolean
    display: string,
    setDisplay: React.Dispatch<React.SetStateAction<"details" | "edit" | "create">>;
    setGym: React.Dispatch<React.SetStateAction<GymType | null>>;
}

export default function Gym({ gym, loading, display, setDisplay, setGym }: GymProps) {

    const { isOffline, networkError } = useAppContext();

    if (loading) {
        return (
            <>
                <GymOwnerDetailsSkeleton />
                {(isOffline || networkError) && <NetworkErrorModal />}
            </>
        );
    }

    return (
        <div className="min-h-screen">
            {display === "details" ? (
                <GymDetails
                    setDisplay={setDisplay}
                    display={display}
                    gym={gym}
                />
            ) : (
                <EditGym
                    display={display}
                    setDisplay={setDisplay}
                    setGym={setGym}
                />
            )}

            {(isOffline || networkError) && <NetworkErrorModal />}
        </div>
    );
}