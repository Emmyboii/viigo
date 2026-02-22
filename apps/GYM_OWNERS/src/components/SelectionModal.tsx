import { useState } from "react";
import BottomSheet from "./BottomSheet";

interface SelectionModalProps {
    open: boolean;
    title: string;
    options: string[];
    existing: string[];
    onClose: () => void;
    onSave: (items: string[]) => void;
}

export default function SelectionModal({
    open,
    title,
    options,
    existing,
    onClose,
    onSave,
}: SelectionModalProps) {
    // Local state for selected items
    const [temp, setTemp] = useState<string[]>([]);

    // Toggle selection
    const toggle = (item: string) => {
        setTemp((prev) =>
            prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
        );
    };

    return (
        <BottomSheet
            key={open ? "open" : "closed"} // Force remount every time modal opens
            open={open}
            onClose={onClose}
            title={title}
            footer={
                <button
                    onClick={() => onSave(temp)}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl"
                >
                    Apply
                </button>
            }
        >
            <div className="divide-y">
                {options.map((item) => {
                    const selected = temp.includes(item);
                    const alreadyAdded = existing.includes(item);

                    return (
                        <div
                            key={item}
                            onClick={() => !alreadyAdded && toggle(item)}
                            className={`flex items-center justify-between py-4 cursor-pointer ${alreadyAdded ? "opacity-40 cursor-not-allowed" : ""
                                }`}
                        >
                            <span className="text-sm">{item}</span>

                            {/* Radio indicator */}
                            <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center ${selected ? "border-blue-500" : "border-gray-400"
                                    }`}
                            >
                                {selected && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                            </div>
                        </div>
                    );
                })}
            </div>
        </BottomSheet>
    );
}