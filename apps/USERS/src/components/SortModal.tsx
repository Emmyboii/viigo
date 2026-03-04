import { useState } from "react";
import { IoClose } from "react-icons/io5";

type Props = {
    onClose: () => void;
    onSelect: (value: string, label: string) => void;
    currentSort?: string;
};

const options = [
    { label: "Recommended", value: "recommended" },
    { label: "Nearest", value: "nearest" },
    { label: "Price: Low to High", value: "price_low" },
    { label: "Top Rated", value: "top_rated" },
];

export default function SortModal({ onClose, onSelect, currentSort = "" }: Props) {
    const [selected, setSelected] = useState<string>(currentSort); // track selection

    return (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50"
            onClick={onClose}
        >

            <div
                className="bg-white w-full rounded-t-2xl p-4"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Sort By</h2>
                    <IoClose size={22} onClick={onClose} className="cursor-pointer" />
                </div>

                {/* Options */}
                <div className="space-y-3">
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            onClick={() => {
                                setSelected(opt.value);
                                onSelect(opt.value, opt.label);
                            }}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
                                {selected === opt.value && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                            </div>
                            <p className="text-sm">{opt.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}