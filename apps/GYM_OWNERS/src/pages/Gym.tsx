import { useEffect, useState } from "react";
import EditGym from "../components/EditGym";
import GymDetails from "../components/GymDetails";

export interface GymType {
    id: string;
    name: string;
    hourly_rate: string;
    phone_number: string;
    location: string;
    open_time: string;
    close_time: string;
    peak_morning_start?: string[];
    peak_morning_end?: string[];
    peak_evening_start?: string[];
    peak_evening_end?: string[];
    amenities?: string[];
    rules?: string[];
    uploaded_images?: string[];
}

export default function Gym() {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [display, setDisplay] = useState<"details" | "edit" | "create">(() => {
        const stored = localStorage.getItem("gymDisplay");
        if (stored === "edit" || stored === "create" || stored === "details") return stored;
        return "details";
    });

    const [loading, setLoading] = useState(true);
    const [gymList, setGymList] = useState<GymType[]>([]);
    const [selectedGymId, setSelectedGymId] = useState<string | null>(null);
    const [selectedGym, setSelectedGym] = useState<GymType | null>(null);

    // Persist display state
    useEffect(() => {
        localStorage.setItem("gymDisplay", display);
    }, [display]);

    // Fetch gyms (array or object)
    useEffect(() => {
        async function fetchGyms() {
            setLoading(true)
            try {
                const token = localStorage.getItem("token");

                const res = await fetch(`${backendUrl}/gymowner/gyms`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) throw new Error("Failed to fetch gyms");
                const data = await res.json();
                const gymData = data.data

                if (Array.isArray(gymData) && gymData.length > 0) {
                    // Multiple gyms
                    setGymList(gymData);
                    setSelectedGymId(gymData[0].id);
                    setDisplay("edit");
                    localStorage.setItem("gymDisplay", display);

                    // Fetch selected gym details
                    const gymRes = await fetch(`${backendUrl}/gymowner/gym/${gymData[0].id}`, {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });
                    if (gymRes.ok) {
                        const gymData = await gymRes.json();
                        setSelectedGym(gymData.data);
                    }
                } else if (data && data.id) {
                    // Single gym object
                    setGymList([data]);
                    setSelectedGymId(data.id);
                    setDisplay("edit");
                    localStorage.setItem("gymDisplay", display);

                    // Fetch details
                    const gymRes = await fetch(`${backendUrl}/gymowner/gym/${data.id}`, {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });
                    if (gymRes.ok) {
                        const gymData: GymType = await gymRes.json();
                        setSelectedGym(gymData);
                    }
                } else {
                    // No gym yet
                    setDisplay("create");
                    localStorage.setItem("gymDisplay", display);
                }
            } catch (err) {
                console.error(err);
                setDisplay("create");
            } finally {
                setLoading(false)
            }
        }

        fetchGyms();
    }, [backendUrl]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4 p-8 bg-white animate-fadeIn">
                    {/* Spinner */}
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

                    {/* Loading text */}
                    <p className="text-gray-700 text-lg font-medium">
                        Fetching your gyms...
                    </p>

                    {/* Optional subtext */}
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
                    gym={selectedGym}
                    setSelectedGymId={setSelectedGymId}
                />
            ) : (
                <EditGym
                    display={display}
                    setDisplay={setDisplay}
                    setGymList={setGymList}
                    setGym={setSelectedGym}
                    gym={selectedGym}
                />
            )}
        </div>
    );
}