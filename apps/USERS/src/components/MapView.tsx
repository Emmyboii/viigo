import { GoogleMap, OverlayView, useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { HiLocationMarker } from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";

const containerStyle = {
    width: "100%",
    height: "100%",
};

const mapStyles = [
    { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#e5e7eb" }],
    },
    {
        featureType: "poi",
        stylers: [{ visibility: "off" }],
    },
    {
        featureType: "transit",
        stylers: [{ visibility: "off" }],
    },
];

export default function MapView({ selectedGymFromDetails }: any) {

    const locationState = useLocation().state as any;

    const { nearbyGyms, gyms } = useAppContext();
    const [selectedGym, setSelectedGym] = useState<any>(locationState?.gym || null);
    const navigate = useNavigate()
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);


    // Fit map bounds to all nearbyGyms
    useEffect(() => {
        if (map && nearbyGyms?.length) {
            const bounds = new google.maps.LatLngBounds();

            nearbyGyms.forEach((gym: any) => {
                bounds.extend({
                    lat: parseFloat(gym.latitude),
                    lng: parseFloat(gym.longitude),
                });
            });

            if (userLocation) bounds.extend(userLocation); // include user location

            map.fitBounds(bounds);
        }
    }, [map, nearbyGyms, userLocation]);

    // const center = selectedGymFromDetails
    //     ? {
    //         lat: parseFloat(selectedGymFromDetails.latitude),
    //         lng: parseFloat(selectedGymFromDetails.longitude),
    //     }
    //     : {
    //         lat: Number(latitude),
    //         lng: Number(longitude),
    //     };

    const getValidLatLng = (lat: any, lng: any) => {
        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(lng);

        if (!isFinite(parsedLat) || !isFinite(parsedLng)) {
            return null; // invalid coordinates
        }

        return { lat: parsedLat, lng: parsedLng };
    };

    const center = selectedGym
        ? getValidLatLng(selectedGym.latitude, selectedGym.longitude) || { lat: 28.6139, lng: 77.2090 }
        : userLocation || { lat: 28.6139, lng: 77.2090 };

    // When panTo
    useEffect(() => {
        if (selectedGym && map) {
            const coords = getValidLatLng(selectedGym.latitude, selectedGym.longitude);
            if (coords) map.panTo(coords);
        }
    }, [selectedGym, map]);

    // Fetch user location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    });
                },
                (err) => console.warn("Geolocation error:", err),
                { enableHighAccuracy: true }
            );
        }
    }, []);

    useEffect(() => {
        if (nearbyGyms?.length) {
            setSelectedGym(nearbyGyms[0]);
        }
    }, [nearbyGyms]);

    useEffect(() => {
        if (selectedGymFromDetails) {
            setSelectedGym(selectedGymFromDetails);
        }
    }, [selectedGymFromDetails]);

    useEffect(() => {
        if (map && nearbyGyms?.length) {
            const bounds = new google.maps.LatLngBounds();

            nearbyGyms.forEach((gym: any) => {
                bounds.extend({
                    lat: parseFloat(gym.latitude),
                    lng: parseFloat(gym.longitude),
                });
            });

            map.fitBounds(bounds);
        }
    }, [map, nearbyGyms]);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY,
    });

    useEffect(() => {
        if (selectedGym && map) {
            map.panTo({
                lat: Number(selectedGym.latitude),
                lng: Number(selectedGym.longitude),
            });
        }
    }, [selectedGym, map]);

    if (!isLoaded) return <div className="h-full w-full" />;

    return (
        <div className="relative h-full w-full">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={14}
                onLoad={(mapInstance) => setMap(mapInstance)}
                options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                    clickableIcons: false,
                    styles: mapStyles,
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
                    // const offset = index * 0.00005;

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
                                onClick={() => setSelectedGym(gym)}
                                style={{ transform: "translate(-50%, -100%)" }}
                                className="relative flex flex-col items-center cursor-pointer"
                            >

                                <div className="relative">
                                    <HiLocationMarker
                                        size={34}
                                        className={selectedGym?.id === gym.id ? "text-[#2563EB]" : "text-[#CBD5E1]"}
                                    />
                                </div>

                                {/* Price Bubble */}
                                <div
                                    className={`
                                mt-2 px-4 py-1 rounded-full text-sm font-semibold shadow-md
                                transition-all duration-200
                                ${selectedGym?.id === gym.id
                                            ? "bg-[#2563EB] text-white scale-105"
                                            : "bg-[#CBD5E1] text-[#0F172A]"
                                        }
                            `}
                                >
                                    {Number(gym.hourly_rate)}/Hr
                                </div>
                            </div>
                        </OverlayView>
                    )
                })}
            </GoogleMap>

            {/* Bottom Floating Card */}
            {nearbyGyms?.length > 0 && (
                <div className="absolute bottom-14 left-0 right-0 px-4 mb-10">
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        {nearbyGyms.map((gym: any) => (
                            <div
                                key={gym.id}
                                onClick={() => setSelectedGym(gym)}
                                className={`
                                    min-w-[300px] bg-white rounded shadow-xl
                                    transition-all duration-200 cursor-pointer h-[94px] flex items-center gap-3
                                    ${selectedGym?.id === gym.id ? "ring-2 ring-blue-600" : ""}
                                `}
                            >
                                {/* Image container */}
                                <div className="w-[71px] h-[94px] flex-shrink-0">
                                    <img
                                        src={gym?.images[0]?.image}
                                        alt={gym.name}
                                        className="w-full h-full object-cover rounded-tl rounded-bl"
                                    />
                                </div>

                                {/* Content */}
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
                                            onClick={() => navigate(`/gyms/${gym?.slug}`)}
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
