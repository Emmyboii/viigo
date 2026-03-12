import FacilityTag from "./FacilityTag";
// import { FaDumbbell, FaShower } from "react-icons/fa";
import type { Gym } from "./types/gym";
import { useState } from "react";
import ImageCarousel from "./ImageCarousel";
import { HiLocationMarker } from "react-icons/hi";
import { GoDotFill } from "react-icons/go";
import { useNavigate } from "react-router-dom";

interface GymHorizontalCardProps {
    gym: Gym
}

export default function GymHorizontalCard({ gym }: GymHorizontalCardProps) {

    const navigate = useNavigate();
    const [showAll, setShowAll] = useState(false);

    const visibleAmenities = showAll
        ? gym.amenities
        : gym.amenities.slice(0, 2);

    return (
        <div className="bg-white rounded border border-[#E2E8F0] flex gap-3">
            <div className="w-28 rounded-tl rounded-bl overflow-hidden">
                <ImageCarousel images={gym.images} />
            </div>

            <div className="flex flex-col justify-between w-full p-3">
                <div>
                    <h3 className="font-medium">{gym.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 flex-wrap">
                        <HiLocationMarker className="text-[#475569] text-sm" />
                        {gym.distance}, {gym?.area} <GoDotFill /> {gym.open_status}
                    </p>

                    <div className="flex gap-2 mt-2 flex-wrap">
                        {visibleAmenities.map((amenity, index) => (
                            <FacilityTag key={index} amenity={amenity} />
                        ))}

                        {!showAll && gym.amenities.length > 2 && (
                            <div
                                onClick={() => setShowAll(true)}
                                className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-xs cursor-pointer"
                            >
                                <span>+ More</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                    <span className="font-semibold">₹{Number(gym.hourly_rate)}/Hr</span>
                    <button onClick={() => navigate(`/gyms/${gym.slug}`)} className="bg-blue-600 text-white text-sm px-4 py-2 rounded w-[124px]">
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
}
