import FacilityTag from "./FacilityTag";
// import { FaDumbbell, FaShower } from "react-icons/fa";
import type { Gym } from "./types/gym";
import { useState } from "react";
import ImageCarousel from "./ImageCarousel";
import { HiLocationMarker } from "react-icons/hi";
import { GoDotFill } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { normalizeImagePath } from "../context/AppContext";

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
        <div className="bg-white rounded border border-[#E2E8F0] flex">
            <div className="w-28 rounded-tl rounded-bl overflow-hidden">
                <ImageCarousel
                    images={gym.images.map(img => ({
                        ...img,
                        image: normalizeImagePath(img.image)
                    }))}
                    enableFullscreen={false}
                />
            </div>

            <div className="flex flex-col justify-between w-full p-3">
                <div>
                    <h3 className="font-semibold text-[#0F172A]">{gym.name}</h3>
                    <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-0.5 flex-wrap">
                        <HiLocationMarker className="text-[#475569] text-[11px]" />
                        {gym.distance}, {gym?.area} <GoDotFill /> {gym.open_status}
                    </p>

                    <div className="flex gap-1 mt-2 flex-wrap">
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
                    <span className="font-semibold text-[#0F172A]">₹{Number(gym.hourly_rate)}/Hr</span>
                    <button onClick={() => navigate(`/gyms/${gym.slug}`)} className="bg-[#2563EB] text-white text-sm font-semibold px-4 py-2 rounded w-[121px]">
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
}
