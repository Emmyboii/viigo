import { GoogleMap, OverlayView, useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { HiLocationMarker } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

const containerStyle = {
    width: "100%",
    height: "100%",
};


export default function MapView({ selectedGymFromDetails }: any) {
    const { nearbyGyms, latitude, longitude } = useAppContext();
    const [selectedGym, setSelectedGym] = useState<any>(null);
    const navigate = useNavigate()
    const [map, setMap] = useState<google.maps.Map | null>(null);

    const center = selectedGymFromDetails
        ? {
            lat: parseFloat(selectedGymFromDetails.latitude),
            lng: parseFloat(selectedGymFromDetails.longitude),
        }
        : {
            lat: Number(latitude),
            lng: Number(longitude),
        };


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
                    disableDefaultUI: false,
                    clickableIcons: true,
                    // styles: [
                    //     {
                    //         featureType: "poi",
                    //         stylers: [{ visibility: "off" }],
                    //     },
                    // ],
                }}
            >
                {nearbyGyms?.map((gym: any) => {
                    // const offset = index * 0.00005;

                    return (
                        <OverlayView
                            key={gym.id}
                            // position={{
                            //     lat: Number(gym.latitude),
                            //     lng: Number(gym.longitude),
                            // }}

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
                                {/* Top Circle Pin */}
                                <div className="relative">
                                    {/* Outer ring */}
                                    <div
                                        className={`
                                w-6 h-6 rounded-full flex items-center justify-center
                                ${selectedGym?.id === gym.id ? "bg-[#2563EB]" : "bg-[#CBD5E1]"}
                                `}
                                    >
                                        {/* Inner white circle */}
                                        <div className="w-3 h-3 bg-white rounded-full" />
                                    </div>
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
                <div className="absolute bottom-6 left-0 right-0 px-4 mb-10">
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        {nearbyGyms.map((gym: any) => (
                            <div
                                key={gym.id}
                                onClick={() => setSelectedGym(gym)}
                                className={`
                                    min-w-[280px] bg-white rounded shadow-xl
                                    transition-all duration-200 cursor-pointer flex gap-3 items-center
                                    ${selectedGym?.id === gym.id ? "ring-2 ring-blue-600" : ""}
                                `}
                            >
                                <img
                                    src={gym?.images[0]?.image}
                                    alt={gym.name}
                                    className="w-[71px] h-[106px] object-cover rounded-tl rounded-bl"
                                />

                                <div className="p-2 pl-0">
                                    <h3 className="font-semibold text-base">
                                        {gym.name}
                                    </h3>

                                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-2">
                                        <HiLocationMarker size={16} className="mt-" />
                                        {gym.distance} • {gym.open_status}
                                    </p>

                                    <div className="flex items-center justify-between gap-2 mt-2">

                                        <p className="text-lg font-semibold">
                                            ₹{Number(gym.hourly_rate)}/Hr
                                        </p>

                                        <p onClick={() => navigate(`/gyms/${gym?.slug}`)} className="text-sm font-semibold text-[#2563EB]">Details</p>
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