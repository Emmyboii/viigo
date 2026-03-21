import FacilityTag from "./FacilityTag";
// import { FaDumbbell, FaShower } from "react-icons/fa";
import type { Gym } from "./types/gym";
import { useState } from "react";
import ImageCarousel from "./ImageCarousel";
import { useNavigate } from "react-router";
import { GoDotFill } from "react-icons/go";
import { HiLocationMarker } from "react-icons/hi";

interface GymCardProps {
    gym: Gym;
}

export default function GymCard({ gym }: GymCardProps) {

    const navigate = useNavigate();

    const [showAll, setShowAll] = useState(false);

    const visibleAmenities = showAll
        ? gym.amenities
        : gym.amenities.slice(0, 2);

    return (
        <div className="bg-white rounded-md shadow-md overflow-hidden h-[320px] flex flex-col">
            <div className="h-40">
                <ImageCarousel images={gym?.images} enableFullscreen={false} />
            </div>

            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold">{gym?.name}</h3>

                <p className="text-xs text-gray-500 mt-1 flex items-center flex-wrap gap-1">
                    <HiLocationMarker className="text-[#475569] text-sm" />
                    {gym?.distance}, {gym?.area} <GoDotFill /> {gym?.open_status}
                </p>

                <div className="flex gap-2 mt-3 flex-wrap">
                    {visibleAmenities.map((amenity, index) => (
                        <FacilityTag key={index} amenity={amenity} />
                    ))}

                    {!showAll && gym?.amenities.length > 2 && (
                        <div
                            onClick={() => setShowAll(true)}
                            className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-xs cursor-pointer"
                        >
                            <span>+ More</span>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-auto pt-4">
                    <span className="font-semibold text-lg">₹{gym?.hourly_rate}/Hr</span>
                    <button onClick={() => {
                        navigate(`/gyms/${gym?.slug}`)
                        window.scrollTo(0, 0);
                    }}
                        className="text-blue-600 text-sm font-medium"
                    >
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
}
