import FacilityTag from "./FacilityTag";
// import { FaDumbbell, FaShower } from "react-icons/fa";
import type { Gym } from "./types/gym";
import ImageCarousel from "./ImageCarousel";
import { useNavigate } from "react-router";
import { GoDotFill } from "react-icons/go";
import { HiLocationMarker } from "react-icons/hi";
import { normalizeImagePath } from "../context/AppContext";

interface GymCardProps {
    gym: Gym;
}

export default function GymCard({ gym }: GymCardProps) {

    const navigate = useNavigate();

    // const [showAll, setShowAll] = useState(false);

    // const visibleAmenities = showAll
    //     ? gym.amenities
    //     : gym.amenities.slice(0, 2);

    const visibleAmenities =
        gym.amenities.slice(0, 2);

    return (
        <div
            onClick={() => {
                navigate(`/gyms/${gym?.slug}`)
                window.scrollTo(0, 0);
            }}
            className="w-full min-w-0 bg-white rounded-2xl shadow-md overflow-hidden h-[300px] cursor-pointer flex flex-col">
            <div className="h-40">
                <ImageCarousel
                    images={gym.images.map(img => ({
                        ...img,
                        image: normalizeImagePath(img.image)
                    }))}
                    enableFullscreen={false}
                />
            </div>

            <div className="p-4 pt-2 flex flex-col flex-1 min-w-0">
                <h3 className="font-semibold text-[#0F172A] truncate min-w-0">{gym?.name}</h3>

                <p className="flex items-center gap-1 mt-1 min-w-0 text-[11px]">
                    <HiLocationMarker className="flex-shrink-0 text-xs" />
                    <span className="truncate flex-1">
                        {gym?.distance}, {gym?.area} <GoDotFill className="inline" /> {gym?.open_status}
                    </span>
                </p>

                <div className="flex gap-1 mt-3 flex-wra truncate">
                    {visibleAmenities.map((amenity, index) => (
                        <FacilityTag key={index} amenity={amenity} />
                    ))}

                    {/* {!showAll && gym?.amenities.length > 2 && (
                        <div
                            onClick={() => setShowAll(true)}
                            className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-xs cursor-pointer"
                        >
                            <span>+ More</span>
                        </div>
                    )} */}
                </div>

                <div className="flex justify-between items-center mt-auto pt-4">
                    <span className="font-semibold text-lg text-[#0F172A]">₹{gym?.hourly_rate}/Hr</span>
                    <button

                        className="text-[#2563EB] text-sm font-semibold"
                    >
                        View Details
                    </button>
                </div>
            </div>
        </div >
    );
}
