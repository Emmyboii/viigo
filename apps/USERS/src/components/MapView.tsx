import { GoogleMap, OverlayView, useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { HiLocationMarker } from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import { HiOutlineLocationMarker } from "react-icons/hi";

const containerStyle = {
    width: "100%",
    height: "100%",
};

const mapStyles = [
    { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#e5e7eb" }] },
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    { featureType: "transit", stylers: [{ visibility: "off" }] },
];

const getValidLatLng = (lat: any, lng: any) => {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (!isFinite(parsedLat) || !isFinite(parsedLng)) return null;
    return { lat: parsedLat, lng: parsedLng };
};

export default function MapView({ selectedGymFromDetails }: any) {
    const locationState = useLocation().state as any;
    const { nearbyGyms, gyms, latitude, longitude } = useAppContext();
    const navigate = useNavigate();

    const initialGym = locationState?.gym || selectedGymFromDetails || null;

    const [selectedGym, setSelectedGym] = useState<any>(initialGym);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    const userLocationRef = useRef<{ lat: number; lng: number } | null>(null);
    const nearbyGymsRef = useRef<any[]>([]);
    const hasInitializedView = useRef(false);
    const lockedToGym = useRef<boolean>(!!initialGym);
    // Store initialGym in a ref so onLoad closure always has it
    const initialGymRef = useRef<any>(initialGym);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY,
    });

    useEffect(() => {
        if (latitude && longitude) {
            const loc = { lat: Number(latitude), lng: Number(longitude) };
            setUserLocation(loc);
            userLocationRef.current = loc;
        }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setUserLocation(loc);
                    userLocationRef.current = loc;
                },
                (err) => console.warn("Geolocation error:", err),
                { enableHighAccuracy: false, timeout: 5000 }
            );
        }
    }, []);

    // Keep nearbyGymsRef in sync
    useEffect(() => {
        nearbyGymsRef.current = nearbyGyms || [];
    }, [nearbyGyms]);

    useEffect(() => {
        if (!lockedToGym.current && nearbyGyms?.length) {
            setSelectedGym(nearbyGyms[0]);
        }
    }, [nearbyGyms]);

    useEffect(() => {
        if (selectedGymFromDetails) {
            setSelectedGym(selectedGymFromDetails);
            lockedToGym.current = true;
            initialGymRef.current = selectedGymFromDetails;
        }
    }, [selectedGymFromDetails]);

    // Only runs when nearbyGyms arrives AND we are NOT locked to a gym
    // Locked gym view is handled entirely in onLoad — no effect needed
    useEffect(() => {
        if (!map || hasInitializedView.current || lockedToGym.current) return;
        if (!nearbyGyms?.length) return;

        const bounds = new google.maps.LatLngBounds();

        nearbyGyms.forEach((gym: any) => {
            const coords = getValidLatLng(gym.latitude, gym.longitude);
            if (coords) bounds.extend(coords);
        });

        if (userLocationRef.current) bounds.extend(userLocationRef.current);

        map.fitBounds(bounds);

        // ✅ KEEP USER VISIBLE AFTER ZOOM
        if (userLocationRef.current) {
            setTimeout(() => {
                map.panTo(userLocationRef.current!);
            }, 100);
        }

        hasInitializedView.current = true;
    }, [map, nearbyGyms]);

    const handleMapLoad = (mapInstance: google.maps.Map) => {
        setMap(mapInstance);

        // If coming from gym details — pan immediately inside onLoad
        // This runs ONCE, synchronously, before any effect or state update can interfere
        if (lockedToGym.current && initialGymRef.current) {
            const coords = getValidLatLng(
                initialGymRef.current.latitude,
                initialGymRef.current.longitude
            );
            if (coords) {
                mapInstance.panTo(coords);
                mapInstance.setZoom(15);
            }
            hasInitializedView.current = true;
        }
    };

    const panToGym = (gym: any) => {
        setSelectedGym(gym);
        if (!map) return;
        const coords = getValidLatLng(gym.latitude, gym.longitude);
        if (!coords) return;
        map.panTo(coords);
        setTimeout(() => map.setZoom(15), 250);
    };

    const resetToMyLocation = () => {
        if (!map || !userLocationRef.current) return;

        setSelectedGym(null);

        map.panTo(userLocationRef.current);
        map.setZoom(13); // clean reset
    };

    useEffect(() => {
        if (!map || !userLocation || lockedToGym.current || hasInitializedView.current) return;
        // Only center on user if gyms haven't loaded yet (fitBounds will handle it otherwise)
        if (!nearbyGymsRef.current?.length) {
            map.panTo(userLocation);
            map.setZoom(13);
        }
    }, [map, userLocation]);

    if (!isLoaded) return <div className="h-full w-full" />;

    return (
        <div className="relative h-screen w-full overflow-y-hidden">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={userLocation || { lat: 6.5244, lng: 3.3792 }} // fallback = Lagos
                zoom={13}
                onLoad={handleMapLoad}
                options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                    clickableIcons: false,
                    styles: mapStyles,
                    minZoom: 3,
                }}
            >
                {/* User Location Marker */}
                {userLocation && (
                    <OverlayView
                        position={userLocation}
                        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                        <div
                            style={{
                                transform: "translate(-50%, -50%)",
                                position: "relative",
                                width: "24px",
                                height: "24px",
                            }}
                        >
                            <div
                                className="absolute w-24 h-24 rounded-full bg-blue-300 animate-ping"
                                style={{ top: "-50%", left: "-50%" }}
                            />
                            <div className="absolute w-10 h-10 top-1/2 left-1/2 rounded-full bg-white border-[12px] border-blue-500" />
                        </div>
                    </OverlayView>
                )}

                {gyms?.map((gym: any) => {
                    const isSelected = selectedGym?.id === gym.id;
                    return (
                        <OverlayView
                            key={gym.id}
                            position={{
                                lat: parseFloat(gym.latitude),
                                lng: parseFloat(gym.longitude),
                            }}
                            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                        >
                            <div
                                onClick={() => panToGym(gym)}
                                style={{ transform: "translate(-50%, -100%)" }}
                                className="relative flex flex-col items-center cursor-pointer"
                            >
                                <div className="relative">
                                    <HiLocationMarker
                                        size={34}
                                        className={isSelected ? "text-[#2563EB]" : "text-[#CBD5E1]"}
                                    />
                                </div>
                                <div
                                    className={`
                                        mt-2 px-4 py-1 rounded-full text-sm font-semibold shadow-md
                                        transition-all duration-200
                                        ${isSelected
                                            ? "bg-[#2563EB] text-white scale-105"
                                            : "bg-[#CBD5E1] text-[#0F172A]"
                                        }
                                    `}
                                >
                                    {Number(gym.hourly_rate)}/Hr
                                </div>
                            </div>
                        </OverlayView>
                    );
                })}
            </GoogleMap>

            {/* Reset to my location button */}
            <button
                onClick={resetToMyLocation}
                className="absolute bottom-64 right-4 bg-white rounded-full shadow-lg p-2.5 z-10 border border-gray-100 active:scale-95 transition-transform"
                title="Back to my location"
            >
                <HiOutlineLocationMarker size={22} className="text-[#2563EB]" />
            </button>

            {/* Bottom Floating Card */}
            {nearbyGyms?.length > 0 && (
                <div className="absolute bottom-24 left-0 right-0 px-4 mb-10">
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        {nearbyGyms.map((gym: any) => (
                            <div
                                key={gym.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    panToGym(gym)
                                }}
                                className={`
                                    min-w-[300px] bg-white rounded
                                    transition-all duration-200 cursor-pointer h-[94px] flex items-center gap-3
                                    ${selectedGym?.id === gym.id ? "ring-2 ring-blue-600" : ""}
                                `}
                            >
                                <div className="w-[71px] h-[94px] flex-shrink-0">
                                    <img
                                        src={gym?.images[0]?.image}
                                        alt={gym.name}
                                        className="w-full h-full object-cover rounded-tl rounded-bl"
                                    />
                                </div>
                                <div className="p-2 pl-0">
                                    <div>
                                        <h3 className="font-semibold text-[#0F172A] text-base">{gym.name}</h3>
                                        <p className="text-[11.3px] text-[#475569] flex items-center gap-1 mt-1">
                                            <HiLocationMarker size={16} /> {gym.distance},{gym.area} • {gym.open_status}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 mt-1">
                                        <p className="text-lg font-semibold">₹{Number(gym.hourly_rate)}/Hr</p>
                                        <p
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/gyms/${gym?.slug}`);
                                            }}
                                            className="text-sm font-semibold text-[#2563EB]"
                                        >
                                            Details
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}