import FacilityTag from "./FacilityTag";
// import { FaDumbbell, FaShower } from "react-icons/fa";
import type { Gym } from "./types/gym";
import { useState } from "react";
import ImageCarousel from "./ImageCarousel";

interface GymHorizontalCardProps {
    gym: Gym
}

export default function GymHorizontalCard({ gym }: GymHorizontalCardProps) {

    const [showAll, setShowAll] = useState(false);

    const visibleFacilities = showAll
        ? gym.facilities
        : gym.facilities.slice(0, 2);

    return (
        <div className="bg-white rounded border border-[#E2E8F0] min-h-[140px] h-full flex gap-3">
            <div className="w-28 rounded-tl rounded-bl h-full overflow-hidden">
                <ImageCarousel images={gym.images} height="h-40" />
            </div>

            <div className="flex flex-col justify-between w-full p-3">
                <div>
                    <h3 className="font-medium">{gym.name}</h3>
                    <p className="text-xs text-gray-500">
                        {gym.distance} • {gym.location} • {gym.open}
                    </p>

                    <div className="flex gap-2 mt-2 flex-wrap">
                        {visibleFacilities.map((facility, index) => (
                            <FacilityTag key={index} label={facility} />
                        ))}

                        {!showAll && gym.facilities.length > 2 && (
                            <FacilityTag
                                label="+ More"
                                onClick={() => setShowAll(true)}
                            />
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center mt-2">
                    <span className="font-semibold">₹{gym.price}/Hr</span>
                    <button className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg">
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
}
