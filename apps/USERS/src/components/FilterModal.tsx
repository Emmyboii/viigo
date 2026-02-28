import { useState } from "react";
import { IoClose } from "react-icons/io5";

type Props = {
    onClose: () => void;
    onApply: (filters: any) => void;
};

export default function FilterModal({ onClose, onApply }: Props) {
    const [sort, setSort] = useState("price_high");
    const [radius, setRadius] = useState(5);
    const [price, setPrice] = useState("250+");
    const [amenities, setAmenities] = useState<string[]>([]);

    const toggleAmenity = (item: string) => {
        setAmenities((prev) =>
            prev.includes(item)
                ? prev.filter((a) => a !== item)
                : [...prev, item]
        );
    };

    const handleApply = () => {
        let min_price = "";
        let max_price = "";

        if (price === "under150") {
            max_price = "150";
        } else if (price === "150-250") {
            min_price = "150";
            max_price = "250";
        } else {
            min_price = "250";
        }

        onApply({
            sort,
            radius,
            min_price,
            max_price,
            amenities,
        });
    };

    return (
        <div className="fixed z-50 inset-0 bg-black/40 flex items-end">
            <div className="bg-white w-full rounded-t-2xl p-4 max-h-[90%] overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-lg">Filter</h2>
                    <button title="close" onClick={onClose}>
                        <IoClose size={22} />
                    </button>
                </div>

                {/* SORT */}
                <h3 className="font-medium mb-2">Sort By</h3>
                <div className="flex gap-2 flex-wrap">
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
                            className={`px-3 py-2 rounded-lg border text-sm ${sort === item.value
                                    ? "bg-blue-100 text-blue-600 border-blue-500"
                                    : "bg-gray-100"
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* RADIUS */}
                <h3 className="font-medium mt-6 mb-2">Distance radius</h3>
                <input
                    type="range"
                    title="ramge"
                    min={0.5}
                    max={10}
                    step={0.5}
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                    Within {radius} Km
                </p>

                {/* PRICE */}
                <h3 className="font-medium mt-6 mb-2">Price per Hour</h3>
                <div className="flex gap-2">
                    {[
                        { label: "Under ₹150", value: "under150" },
                        { label: "₹150–₹250", value: "150-250" },
                        { label: "₹250+", value: "250+" },
                    ].map((p) => (
                        <button
                            key={p.value}
                            onClick={() => setPrice(p.value)}
                            className={`px-3 py-2 rounded-lg border text-sm ${price === p.value
                                    ? "bg-blue-100 text-blue-600 border-blue-500"
                                    : "bg-gray-100"
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* AMENITIES */}
                <h3 className="font-medium mt-6 mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                    {[
                        "Restroom",
                        "Locker",
                        "Shower",
                        "Personal Trainer",
                        "Air conditioned",
                        "Women Only",
                        "Heavy Weights",
                        "Parking",
                    ].map((item) => (
                        <button
                            key={item}
                            onClick={() => toggleAmenity(item)}
                            className={`px-3 py-2 rounded-lg border text-sm ${amenities.includes(item)
                                    ? "bg-blue-100 text-blue-600 border-blue-500"
                                    : "bg-gray-100"
                                }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {/* FOOTER */}
                <div className="sticky bottom-0 bg-white mt-6 pt-4">
                    <button
                        onClick={handleApply}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );
}