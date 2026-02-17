import FacilityTag from "./FacilityTag";
// import { FaDumbbell, FaShower } from "react-icons/fa";
import type { Gym } from "./types/gym";
import { useState } from "react";
import ImageCarousel from "./ImageCarousel";
import { useNavigate } from "react-router";

interface GymCardProps {
    gym: Gym;
}

export default function GymCard({ gym }: GymCardProps) {

    const navigate = useNavigate();

    const [showAll, setShowAll] = useState(false);

    const visibleFacilities = showAll
        ? gym.facilities
        : gym.facilities.slice(0, 2);

    return (
        <div className="bg-white rounded-md shadow-md overflow-hidden">
            <ImageCarousel images={gym.images} />

            <div className="p-4">
                <h3 className="font-semibold">{gym.name}</h3>

                <p className="text-xs text-gray-500 mt-1">
                    {gym.distance} • {gym.location} • {gym.open}
                </p>

                <div className="flex gap-2 mt-3 flex-wrap">
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

                <div className="flex justify-between items-center mt-4">
                    <span className="font-semibold text-lg">₹{gym.price}/Hr</span>
                    <button onClick={() => {
                        navigate('/gyms/fight-to-fitness')
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
