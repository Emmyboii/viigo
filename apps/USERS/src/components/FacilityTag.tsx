import {
    FaDumbbell,
    FaShower,
    FaLock,
    FaRestroom,
    FaParking,
} from "react-icons/fa";
import type { Facility } from "./types/gym";

interface FacilityTagProps {
    label: Facility | string;
    onClick?: () => void;
}

const facilityIcons: Record<Facility, React.ReactNode> = {
    Trainer: <FaDumbbell size={12} />,
    Shower: <FaShower size={12} />,
    Locker: <FaLock size={12} />,
    Restroom: <FaRestroom size={12} />,
    Parking: <FaParking size={12} />,
};

export default function FacilityTag({
    label,
    onClick,
}: FacilityTagProps) {
    const icon =
        label in facilityIcons
            ? facilityIcons[label as Facility]
            : null;

    return (
        <div
            onClick={onClick}
            className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-xs cursor-pointer"
        >
            {icon}
            <span>{label}</span>
        </div>
    );
}
