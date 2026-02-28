
interface FacilityTagProps {
    amenity: {
        name?: string;
        icon?: string;
    };
    onClick?: () => void;
}

export default function FacilityTag({
    amenity,
    onClick,
}: FacilityTagProps) {


    const getIconUrl = (icon?: string) => {
        if (!icon) return "";

        // If it's already a full URL
        if (icon.startsWith("http://") || icon.startsWith("https://")) {
            return icon;
        }

        // Otherwise prepend base URL
        return `https://api.viigo.in/${icon}`;
    };

    return (
        <div
            onClick={onClick}
            className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-xs cursor-pointer"
        >
            {amenity?.icon && (
                <img
                    src={getIconUrl(amenity.icon)}
                    alt={amenity?.name}
                    className="w-3 h-3 object-contain"
                />
            )}
            <span>{amenity?.name}</span>
        </div>
    );
}
