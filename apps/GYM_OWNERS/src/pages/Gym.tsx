import EditGym from "../components/EditGym";
import GymDetails from "../components/GymDetails";

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4 p-8 bg-white animate-fadeIn">
                    <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-700 text-lg font-medium">
                        Fetching your gym details...
                    </p>
                    <p className="text-gray-400 text-sm text-center">
                        This might take a few seconds. Sit tight!
                    </p>
                </div>
            </div>
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
                    gym={gym}
                />
            )}
        </div>
    );
}