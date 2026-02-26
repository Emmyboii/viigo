import { useState } from "react";
import BottomSheet from "./BottomSheet";

interface OptionType {
    id: number;
    label: string;
    icon?: string;
}

interface SelectionModalProps {
    open: boolean;
    title: string;
    options: OptionType[];
    existing: number[]; // IDs of already saved items
    onClose: () => void;
    onSave: (selected: number[]) => void; // returns IDs of newly selected items
}

export default function SelectionModal({
    open,
    title,
    options,
    existing,
    onClose,
    onSave,
}: SelectionModalProps) {
    // ✅ temp holds current selections (starts with existing)
       const [temp, setTemp] = useState<number[]>(existing ?? []);

    // toggle item in temp
    const toggle = (id: number) => {
        setTemp((prev) =>
            prev.includes(id)
                ? prev.filter((i) => i !== id)
                : [...prev, id]
        );
    };

    return (
        <BottomSheet
            key={open ? "open" : "closed"}
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
            <div className="divide-y max-h-[60vh] overflow-y-auto">
                {options.map((item) => {
                    const selected = temp.includes(item.id); // current selection
                    const alreadyAdded = existing.includes(item.id); // disable already saved items

                    return (
                        <div
                            key={item.id}
                            onClick={() => !alreadyAdded && toggle(item.id)}
                            className={`flex items-center justify-between py-4 cursor-pointer ${alreadyAdded
                                    ? "opacity-40 cursor-not-allowed"
                                    : ""
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {item.icon && (
                                    <img
                                        src={item.icon}
                                        alt={item.label}
                                        className="w-5 h-5"
                                    />
                                )}
                                <span className="text-sm">{item.label}</span>
                            </div>

                            {/* Radio indicator */}
                            <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center ${selected
                                        ? "border-blue-500"
                                        : "border-gray-400"
                                    }`}
                            >
                                {selected && (
                                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </BottomSheet>
    );
}