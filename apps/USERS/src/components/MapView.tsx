// import { GoogleMap, OverlayView, useJsApiLoader } from "@react-google-maps/api";
// import { useEffect, useRef, useState } from "react";
// import { useAppContext } from "../context/AppContext";
// import { HiLocationMarker } from "react-icons/hi";
// import { useLocation, useNavigate } from "react-router-dom";
// import { HiOutlineLocationMarker } from "react-icons/hi";

// const containerStyle = {
//     width: "100%",
//     height: "100%",
// };

// const mapStyles = [
//     { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
//     { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
//     { elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },
//     { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
//     { featureType: "road", elementType: "geometry", stylers: [{ color: "#e5e7eb" }] },
//     { featureType: "poi", stylers: [{ visibility: "off" }] },
//     { featureType: "transit", stylers: [{ visibility: "off" }] },
// ];

// const getValidLatLng = (lat: any, lng: any) => {
//     const parsedLat = parseFloat(lat);
//     const parsedLng = parseFloat(lng);
//     if (!isFinite(parsedLat) || !isFinite(parsedLng)) return null;
//     return { lat: parsedLat, lng: parsedLng };
// };

// export default function MapView({ selectedGymFromDetails }: any) {
//     const locationState = useLocation().state as any;
//     const { nearbyGyms, gyms, latitude, longitude } = useAppContext();
//     const navigate = useNavigate();

//     const initialGym = locationState?.gym || selectedGymFromDetails || null;

//     const [selectedGym, setSelectedGym] = useState<any>(initialGym);
//     const [map, setMap] = useState<google.maps.Map | null>(null);
//     const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

//     const userLocationRef = useRef<{ lat: number; lng: number } | null>(null);
//     const nearbyGymsRef = useRef<any[]>([]);
//     const hasInitializedView = useRef(false);
//     const lockedToGym = useRef<boolean>(!!initialGym);
//     // Store initialGym in a ref so onLoad closure always has it
//     const initialGymRef = useRef<any>(initialGym);

//     const { isLoaded } = useJsApiLoader({
//         googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY,
//     });

//     useEffect(() => {
//         if (latitude && longitude) {
//             const loc = { lat: Number(latitude), lng: Number(longitude) };
//             setUserLocation(loc);
//             userLocationRef.current = loc;
//         }
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(
//                 (pos) => {
//                     const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
//                     setUserLocation(loc);
//                     userLocationRef.current = loc;
//                 },
//                 (err) => console.warn("Geolocation error:", err),
//                 { enableHighAccuracy: false, timeout: 5000 }
//             );
//         }
//     }, []);

//     // Keep nearbyGymsRef in sync
//     useEffect(() => {
//         nearbyGymsRef.current = nearbyGyms || [];
//     }, [nearbyGyms]);

//     useEffect(() => {
//         if (!lockedToGym.current && nearbyGyms?.length) {
//             setSelectedGym(nearbyGyms[0]);
//         }
//     }, [nearbyGyms]);

//     useEffect(() => {
//         if (selectedGymFromDetails) {
//             setSelectedGym(selectedGymFromDetails);
//             lockedToGym.current = true;
//             initialGymRef.current = selectedGymFromDetails;
//         }
//     }, [selectedGymFromDetails]);

//     // Only runs when nearbyGyms arrives AND we are NOT locked to a gym
//     // Locked gym view is handled entirely in onLoad — no effect needed
//     useEffect(() => {
//         if (!map || hasInitializedView.current || lockedToGym.current) return;
//         if (!nearbyGyms?.length) return;

//         const bounds = new google.maps.LatLngBounds();

//         nearbyGyms.forEach((gym: any) => {
//             const coords = getValidLatLng(gym.latitude, gym.longitude);
//             if (coords) bounds.extend(coords);
//         });

//         if (userLocationRef.current) bounds.extend(userLocationRef.current);

//         map.fitBounds(bounds);

//         // ✅ KEEP USER VISIBLE AFTER ZOOM
//         if (userLocationRef.current) {
//             setTimeout(() => {
//                 map.panTo(userLocationRef.current!);
//             }, 100);
//         }

//         hasInitializedView.current = true;
//     }, [map, nearbyGyms]);

//     const handleMapLoad = (mapInstance: google.maps.Map) => {
//         setMap(mapInstance);

//         // If coming from gym details — pan immediately inside onLoad
//         // This runs ONCE, synchronously, before any effect or state update can interfere
//         if (lockedToGym.current && initialGymRef.current) {
//             const coords = getValidLatLng(
//                 initialGymRef.current.latitude,
//                 initialGymRef.current.longitude
//             );
//             if (coords) {
//                 mapInstance.panTo(coords);
//                 mapInstance.setZoom(15);
//             }
//             hasInitializedView.current = true;
//         }
//     };

//     const panToGym = (gym: any) => {
//         setSelectedGym(gym);
//         if (!map) return;
//         const coords = getValidLatLng(gym.latitude, gym.longitude);
//         if (!coords) return;
//         map.panTo(coords);
//         setTimeout(() => map.setZoom(15), 250);
//     };

//     const resetToMyLocation = () => {
//         if (!map || !userLocationRef.current) return;

//         setSelectedGym(null);

//         map.panTo(userLocationRef.current);
//         map.setZoom(13); // clean reset
//     };

//     useEffect(() => {
//         if (!map || !userLocation || lockedToGym.current || hasInitializedView.current) return;
//         // Only center on user if gyms haven't loaded yet (fitBounds will handle it otherwise)
//         if (!nearbyGymsRef.current?.length) {
//             map.panTo(userLocation);
//             map.setZoom(13);
//         }
//     }, [map, userLocation]);

//     if (!isLoaded) return <div className="h-full w-full" />;

//     return (
//         <div className="relative h-screen w-full overflow-y-hidden">
//             <GoogleMap
//                 mapContainerStyle={containerStyle}
//                 center={userLocation || { lat: 6.5244, lng: 3.3792 }} // fallback = Lagos
//                 zoom={13}
//                 onLoad={handleMapLoad}
//                 options={{
//                     disableDefaultUI: true,
//                     zoomControl: true,
//                     clickableIcons: false,
//                     styles: mapStyles,
//                     minZoom: 3,
//                 }}
//             >
//                 {/* User Location Marker */}
//                 {userLocation && (
//                     <OverlayView
//                         position={userLocation}
//                         mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
//                     >
//                         <div
//                             style={{
//                                 transform: "translate(-50%, -50%)",
//                                 position: "relative",
//                                 width: "24px",
//                                 height: "24px",
//                             }}
//                         >
//                             <div
//                                 className="absolute w-24 h-24 rounded-full bg-blue-300 animate-ping"
//                                 style={{ top: "-50%", left: "-50%" }}
//                             />
//                             <div className="absolute w-10 h-10 top-1/2 left-1/2 rounded-full bg-white border-[12px] border-blue-500" />
//                         </div>
//                     </OverlayView>
//                 )}

//                 {gyms?.map((gym: any) => {
//                     const isSelected = selectedGym?.id === gym.id;
//                     return (
//                         <OverlayView
//                             key={gym.id}
//                             position={{
//                                 lat: parseFloat(gym.latitude),
//                                 lng: parseFloat(gym.longitude),
//                             }}
//                             mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
//                         >
//                             <div
//                                 onClick={() => panToGym(gym)}
//                                 style={{ transform: "translate(-50%, -100%)" }}
//                                 className="relative flex flex-col items-center cursor-pointer"
//                             >
//                                 <div className="relative">
//                                     <HiLocationMarker
//                                         size={34}
//                                         className={isSelected ? "text-[#2563EB]" : "text-[#CBD5E1]"}
//                                     />
//                                 </div>
//                                 <div
//                                     className={`
//                                         mt-2 px-4 py-1 rounded-full text-sm font-semibold shadow-md
//                                         transition-all duration-200
//                                         ${isSelected
//                                             ? "bg-[#2563EB] text-white scale-105"
//                                             : "bg-[#CBD5E1] text-[#0F172A]"
//                                         }
//                                     `}
//                                 >
//                                     {Number(gym.hourly_rate)}/Hr
//                                 </div>
//                             </div>
//                         </OverlayView>
//                     );
//                 })}
//             </GoogleMap>

//             {/* Reset to my location button */}
//             <button
//                 onClick={resetToMyLocation}
//                 className="absolute bottom-64 right-4 bg-white rounded-full shadow-lg p-2.5 z-10 border border-gray-100 active:scale-95 transition-transform"
//                 title="Back to my location"
//             >
//                 <HiOutlineLocationMarker size={22} className="text-[#2563EB]" />
//             </button>

//             {/* Bottom Floating Card */}
//             {nearbyGyms?.length > 0 && (
//                 <div className="absolute bottom-24 left-0 right-0 px-4 mb-10">
//                     <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
//                         {nearbyGyms.map((gym: any) => (
//                             <div
//                                 key={gym.id}
//                                 onClick={(e) => {
//                                     e.stopPropagation();
//                                     panToGym(gym)
//                                 }}
//                                 className={`
//                                     min-w-[300px] bg-white rounded
//                                     transition-all duration-200 cursor-pointer h-[94px] flex items-center gap-3
//                                     ${selectedGym?.id === gym.id ? "ring-2 ring-blue-600" : ""}
//                                 `}
//                             >
//                                 <div className="w-[71px] h-[94px] flex-shrink-0">
//                                     <img
//                                         src={gym?.images[0]?.image}
//                                         alt={gym.name}
//                                         className="w-full h-full object-cover rounded-tl rounded-bl"
//                                     />
//                                 </div>
//                                 <div className="p-2 pl-0">
//                                     <div>
//                                         <h3 className="font-semibold text-[#0F172A] text-base">{gym.name}</h3>
//                                         <p className="text-[11.3px] text-[#475569] flex items-center gap-1 mt-1">
//                                             <HiLocationMarker size={16} /> {gym.distance},{gym.area} • {gym.open_status}
//                                         </p>
//                                     </div>
//                                     <div className="flex items-center justify-between gap-2 mt-1">
//                                         <p className="text-lg font-semibold">₹{Number(gym.hourly_rate)}/Hr</p>
//                                         <p
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 navigate(`/gyms/${gym?.slug}`);
//                                             }}
//                                             className="text-sm font-semibold text-[#2563EB]"
//                                         >
//                                             Details
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

import { GoogleMap, OverlayView, useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useRef, useState, useCallback } from "react";
import { useAppContext } from "../context/AppContext";
import { HiLocationMarker } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { IoSearchSharp, IoClose } from "react-icons/io5";
import { haversineDistance, formatDistance } from "../utils/distance";

const SEARCH_RADIUS_KM = 50;

const containerStyle = { width: "100%", height: "100%" };

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

const LIBRARIES: ("places")[] = ["places"];

export default function MapView({ selectedGymFromDetails }: any) {
    const { gyms, latitude, longitude } = useAppContext();
    const navigate = useNavigate();

    const initialGym = selectedGymFromDetails || null;

    const [selectedGym, setSelectedGym] = useState<any>(initialGym);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    const [searchInput, setSearchInput] = useState("");
    const [searchedAreaCenter, setSearchedAreaCenter] = useState<{ lat: number; lng: number } | null>(null);
    const [filteredGyms, setFilteredGyms] = useState<any[]>([]);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const cardStripRef = useRef<HTMLDivElement>(null);

    const userLocationRef = useRef<{ lat: number; lng: number } | null>(null);
    const hasInitializedView = useRef(false);
    const lockedToGym = useRef<boolean>(!!initialGym);
    const initialGymRef = useRef<any>(initialGym);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY,
        libraries: LIBRARIES,
    });

    // ── User location ──────────────────────────────────────────────────────────
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

    // ── Initial gym lock ───────────────────────────────────────────────────────
    useEffect(() => {
        if (selectedGymFromDetails) {
            setSelectedGym(selectedGymFromDetails);
            lockedToGym.current = true;
            initialGymRef.current = selectedGymFromDetails;
        }
    }, [selectedGymFromDetails]);

    // ── Center on user at a good zoom on first load ───────────────────────────
    useEffect(() => {
        if (!map || hasInitializedView.current || lockedToGym.current) return;
        if (!userLocationRef.current && !userLocation) return;

        const loc = userLocationRef.current || userLocation!;
        map.panTo(loc);
        map.setZoom(13);
        hasInitializedView.current = true;
    }, [map, userLocation, gyms]);

    // ── Setup Google Places Autocomplete ──────────────────────────────────────
    const setupAutocomplete = useCallback(() => {
        if (!searchInputRef.current || autocompleteRef.current) return;

        const ac = new google.maps.places.Autocomplete(searchInputRef.current, {
            types: ["geocode", "establishment"],
            componentRestrictions: { country: "in" },
        });

        ac.addListener("place_changed", () => {
            const place = ac.getPlace();
            if (!place.geometry?.location) return;

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const areaCenter = { lat, lng };

            setSearchInput(place.formatted_address || place.name || "");
            setSearchedAreaCenter(areaCenter);

            if (map) {
                if (place.geometry.viewport) {
                    map.fitBounds(place.geometry.viewport);
                } else {
                    map.panTo(areaCenter);
                    map.setZoom(13);
                }
            }

            const nearby = (gyms || [])
                .map((gym: any) => {
                    const gymLat = parseFloat(gym.latitude);
                    const gymLng = parseFloat(gym.longitude);
                    const km = haversineDistance(lat, lng, gymLat, gymLng);
                    return { ...gym, distance: formatDistance(km), _distanceKm: km };
                })
                .filter((gym: any) => gym._distanceKm <= SEARCH_RADIUS_KM)
                .sort((a: any, b: any) => a._distanceKm - b._distanceKm);

            setFilteredGyms(nearby);

            if (nearby.length > 0) setSelectedGym(nearby[0]);
        });

        autocompleteRef.current = ac;
    }, [map, gyms]);

    useEffect(() => {
        if (isLoaded && map) setupAutocomplete();
    }, [isLoaded, map, setupAutocomplete]);

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleMapLoad = (mapInstance: google.maps.Map) => {
        setMap(mapInstance);
        if (lockedToGym.current && initialGymRef.current) {
            const coords = getValidLatLng(
                initialGymRef.current.latitude,
                initialGymRef.current.longitude
            );
            if (coords) {
                mapInstance.panTo(coords);
                mapInstance.setZoom(13);
            }
            hasInitializedView.current = true;
        }
    };

    const scrollCardIntoView = (gymId: string | number) => {
        setTimeout(() => {
            const card = document.getElementById(`gym-card-${gymId}`);
            const strip = cardStripRef.current;
            if (card && strip) {
                const cardLeft = card.offsetLeft;
                const cardWidth = card.offsetWidth;
                const stripWidth = strip.offsetWidth;
                strip.scrollTo({
                    left: cardLeft - stripWidth / 2 + cardWidth / 2,
                    behavior: "smooth",
                });
            }
        }, 100);
    };

    const panToGym = (gym: any) => {
        setSelectedGym(gym);
        if (!map) return;
        const coords = getValidLatLng(gym.latitude, gym.longitude);
        if (!coords) return;
        map.panTo(coords);
        setTimeout(() => map.setZoom(15), 250);
        scrollCardIntoView(gym.id);
    };

    const resetToMyLocation = () => {
        if (!map || !userLocationRef.current) return;
        setSelectedGym(null);
        setSearchedAreaCenter(null);
        setFilteredGyms([]);
        setSearchInput("");
        map.panTo(userLocationRef.current);
        map.setZoom(13);
    };

    const clearSearch = () => {
        setSearchInput("");
        setSearchedAreaCenter(null);
        setFilteredGyms([]);
        setSelectedGym(null);
        if (searchInputRef.current) searchInputRef.current.value = "";
    };

    const displayedGyms = searchedAreaCenter ? filteredGyms : (gyms || []);

    if (!isLoaded) return <div className="h-full w-full" />;

    return (
        <div className="relative h-screen w-full overflow-y-hidden">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={userLocation || { lat: 6.5244, lng: 3.3792 }}
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
                {/* User location marker */}
                {userLocation && (
                    <OverlayView position={userLocation} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
                        <div style={{ transform: "translate(-50%, -50%)", position: "relative", width: "24px", height: "24px" }}>
                            <div className="absolute w-24 h-24 rounded-full bg-blue-300 animate-ping" style={{ top: "-50%", left: "-50%" }} />
                            <div className="absolute w-10 h-10 top-1/2 left-1/2 rounded-full bg-white border-[12px] border-blue-500" />
                        </div>
                    </OverlayView>
                )}

                {/* Gym markers */}
                {gyms?.map((gym: any) => {
                    const isSelected = selectedGym?.id === gym.id;
                    return (
                        <OverlayView
                            key={gym.id}
                            position={{ lat: parseFloat(gym.latitude), lng: parseFloat(gym.longitude) }}
                            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                        >
                            <div
                                onClick={() => panToGym(gym)}
                                style={{ transform: "translate(-50%, -100%)" }}
                                className="relative flex flex-col items-center cursor-pointer"
                            >
                                <HiLocationMarker size={34} className={isSelected ? "text-[#2563EB]" : "text-[#CBD5E1]"} />
                                <div className={`mt-2 px-4 py-1 rounded-full text-sm font-semibold shadow-md transition-all duration-200 ${isSelected ? "bg-[#2563EB] text-white scale-105" : "bg-[#CBD5E1] text-[#0F172A]"}`}>
                                    {Number(gym.hourly_rate)}/Hr
                                </div>
                            </div>
                        </OverlayView>
                    );
                })}
            </GoogleMap>

            {/* Search bar */}
            <div className="absolute top-6 left-4 right-16 mr-2">
                <div className="relative flex items-center bg-white border border-[#94A3B8] rounded-2xl px-4 py-4 shadow-md">
                    <IoSearchSharp className="mr-3 text-xl text-gray-500 flex-shrink-0" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search area or locality..."
                        className="flex-1 text-sm text-gray-700 bg-transparent outline-none placeholder-gray-400"
                    />
                    {searchInput && (
                        <button title="close" onClick={clearSearch} className="ml-2 text-gray-400 hover:text-gray-600">
                            <IoClose size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Reset to my location */}
            <button
                onClick={resetToMyLocation}
                className="absolute bottom-64 right-4 bg-white rounded-full shadow-lg p-2.5 z-10 border border-gray-100 active:scale-95 transition-transform"
                title="Back to my location"
            >
                <HiOutlineLocationMarker size={22} className="text-[#2563EB]" />
            </button>

            {/* Bottom floating cards */}
            {displayedGyms.length > 0 && (
                <div className="absolute bottom-24 left-0 right-0 px-4 mb-10">
                    {searchedAreaCenter && (
                        <p className="text-xs text-white bg-black/40 rounded-full px-3 py-1 mb-2 w-fit">
                            {filteredGyms.length} gym{filteredGyms.length !== 1 ? "s" : ""} near this area
                        </p>
                    )}
                    <div ref={cardStripRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        {displayedGyms.map((gym: any) => (
                            <div
                                id={`gym-card-${gym.id}`}
                                key={gym.id}
                                onClick={(e) => { e.stopPropagation(); panToGym(gym); }}
                                className={`min-w-[300px] bg-white rounded transition-all duration-200 cursor-pointer h-[94px] flex items-center gap-3 ${selectedGym?.id === gym.id ? "ring-2 ring-blue-600" : ""}`}
                            >
                                <div className="w-[71px] h-[94px] flex-shrink-0">
                                    <img src={gym?.images[0]?.image} alt={gym.name} className="w-full h-full object-cover rounded-tl rounded-bl" />
                                </div>
                                <div className="p-2 pl-0">
                                    <h3 className="font-semibold text-[#0F172A] text-base">{gym.name}</h3>
                                    <p className="text-[11.3px] text-[#475569] flex items-center gap-1 mt-1">
                                        <HiLocationMarker size={16} />
                                        {gym.distance} • {gym.area} • {gym.open_status}
                                    </p>
                                    <div className="flex items-center justify-between gap-2 mt-1">
                                        <p className="text-lg font-semibold">Rs. {Number(gym.hourly_rate)}/Hr</p>
                                        <p
                                            onClick={(e) => { e.stopPropagation(); navigate(`/gyms/${gym?.slug}`); }}
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

            {/* Empty state */}
            {searchedAreaCenter && filteredGyms.length === 0 && (
                <div className="absolute bottom-24 left-0 right-0 px-4 mb-10">
                    <div className="bg-white rounded-xl px-4 py-3 shadow text-sm text-gray-500 text-center">
                        No gyms found within {SEARCH_RADIUS_KM} km of this area
                    </div>
                </div>
            )}
        </div>
    );
}