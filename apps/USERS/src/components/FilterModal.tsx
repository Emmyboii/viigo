import { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";


type Props = {
    filters: any;
    from?: string;
    onClose: () => void;
    onApply: (filters: any) => void;
};

export default function FilterModal({ filters, from, onClose, onApply }: Props) {

    const {
        searchLoading,
        searchResults,
        fetchFilteredGyms,
        amenities
    } = useAppContext();

    const [sort, setSort] = useState(filters.sort);
    const [radius, setRadius] = useState(filters.radius);
    const [amenitiesSelected, setAmenitiesSelected] = useState<string[]>(filters.amenities);
    const navigate = useNavigate();

    const handleCancel = () => {
        if (from === "/") {
            navigate("/");
        } else {
            onClose();
        }
    };

    const buildFilters = () => {
        let min_price = "";
        let max_price = "";

        if (price === "under70") {
            max_price = "70";
        } else if (price === "70-150") {
            min_price = "70";
            max_price = "150";
        } else {
            min_price = "150";
        }

        return {
            sort,
            radius,
            min_price,
            max_price,
            amenities: amenitiesSelected,
        };
    };

    const toggleAmenity = (name: string) => {
        setAmenitiesSelected((prev) =>
            prev.includes(name)
                ? prev.filter((a) => a !== name)
                : [...prev, name]
        );
    };

    const derivePrice = () => {
        const min = Number(filters.min_price);
        const max = Number(filters.max_price);

        if (!filters.min_price && !filters.max_price) return "150+";

        if (max === 70) return "under70";

        if (min === 70 && max === 150) return "70-150";

        if (min === 150) return "150+";

        return "150+";
    };

    const [price, setPrice] = useState(derivePrice());

    useEffect(() => {
        fetchFilteredGyms(buildFilters());
    }, [sort, radius, price, amenitiesSelected]);

    const handleReset = () => {
        setSort("price_high");
        setRadius(5);
        setPrice("150+");
        setAmenitiesSelected([]);

        fetchFilteredGyms({
            sort: "price_high",
            radius: 5,
            min_price: "",
            max_price: "",
            amenities: [],
        });
    };

    const filtersApplied =
        (sort ? 1 : 0) +
        (price ? 1 : 0) +
        (radius !== 5 ? 1 : 0) +
        amenitiesSelected.length;

    return (
        <div className="fixed inset-0 z-[100] bg-gray-50 max-w-[1300px] mx-auto"
            onClick={onClose}
        >
            <div
                className="bg-white h-full flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b">
                    <div className="flex items-center gap-3">
                        <IoArrowBack
                            size={20}
                            className="cursor-pointer"
                            onClick={handleCancel}
                        />
                        <h2 className="text-lg font-semibold">Filter</h2>
                    </div>

                    <button
                        onClick={handleReset}
                        className="text-[#2563EB] text-xs font-medium"
                    >
                        Reset All
                    </button>
                </div>

                {/* Content */}
                <div className="px-4 pb-40 pt-4 space-y-6 overflow-y-auto h-full">

                    {/* SORT */}
                    <div>
                        <h3 className="font-semibold mb-3">Sort By</h3>
                        <div className="flex flex-wrap gap-3">
                            {[
                                { label: "Recommended", value: "" },
                                { label: "Nearest", value: "nearest" },
                                { label: "Open 24/7", value: "open_24_7" },
                                { label: "Price : High to Low", value: "price_high" },
                                { label: "Lowest Price", value: "price_low" },
                            ].map((item) => (
                                <button
                                    key={item.value}
                                    onClick={() => setSort(item.value)}
                                    className={`px-4 py-2 rounded-lg font-medium text-xs border transition ${sort === item.value
                                        ? "bg-[#DBEAFE] border-[#2563EB] text-[#2563EB]"
                                        : "border-gray-200 text-gray-700"
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RADIUS */}
                    <div>
                        <h3 className="font-semibold mb-3">Distance radius</h3>

                        <div className="flex justify-between text-xs text-gray-400 mb-">
                            <span>0.5Km</span>
                            <span className="text-gray-700 font-medium">
                                Within {radius} Km
                            </span>
                            <span>10Km</span>
                        </div>

                        <input
                            type="range"
                            title="range"
                            min={0.5}
                            max={10}
                            step={0.5}
                            value={radius}
                            onChange={(e) => setRadius(Number(e.target.value))}
                            className="w-full h-[3px] accent-blue-600"
                        />
                    </div>

                    {/* PRICE */}
                    <div>
                        <h3 className="font-semibold mb-3">Price per Hour</h3>
                        <div className="flex gap-3">
                            {[
                                { label: "Under ₹70", value: "under70" },
                                { label: "₹70–₹150", value: "70-150" },
                                { label: "₹150+", value: "150+" },
                            ].map((p) => (
                                <button
                                    key={p.value}
                                    onClick={() => setPrice(p.value)}
                                    className={`px-4 py-2 rounded-lg font-medium text-xs border transition ${price === p.value
                                        ? "bg-[#DBEAFE] border-[#2563EB] text-[#2563EB]"
                                        : "border-gray-200 text-gray-700"
                                        }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* AMENITIES */}
                    <div className="pb-20">
                        <h3 className="font-semibold mb-3">Amenities</h3>
                        <div className="flex flex-wrap gap-3">
                            {amenities.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => toggleAmenity(item.name)}
                                    className={`px-4 py-2 rounded-full text-sm border flex items-center gap-1 transition ${amenitiesSelected.includes(item.name)
                                        ? "bg-[#DBEAFE] border-[#2563EB] text-[#2563EB]"
                                        : "bg-[#F1F5F9] border-gray-200 text-[#0F172A]"
                                        }`}
                                >
                                    {/* Optional icon */}
                                    {item.icon && <img src={item.icon} alt={item.name} className="w-4 h-4" />}
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="fixed max-w-[1300px] mx-auto bottom-0 left-0 right-0 bg-white px-4 pt-3 pb-3 border-t">
                    <p className="text-center text-sm text-gray-500 mb-3">
                        {filtersApplied} Filters applied
                    </p>

                    <button
                        onClick={() => {
                            onApply(buildFilters());
                        }}
                        disabled={searchLoading || searchResults.length === 0}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-base disabled:opacity-50"
                    >
                        {searchLoading
                            ? "Finding gyms..."
                            : searchResults.length === 0
                                ? "No gyms found"
                                : `Show ${searchResults.length} Gym${searchResults.length !== 1 ? "s" : ""}`
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}