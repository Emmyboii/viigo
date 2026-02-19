import { useState } from "react";

interface ChipItem {
    id: string;
    label: string;
}

interface ChipProps {
    label: string;
    active?: boolean;
    onClick?: () => void;
}

export function Chip({ label, active, onClick }: ChipProps) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-lg text-[13px] border w-full text-nowrap transition
            ${active
                    ? "bg-[#DBEAFE] border-[#2563EB] text-[#2563EB]"
                    : "bg-[#F1F5F9] border-[#CBD5E1] text-[#0F172A]"}
            `}
        >
            {label}
        </button>
    );
}

interface FilterChipsProps {
    items: ChipItem[];
}

export default function FilterChips({ items }: FilterChipsProps) {
    const [activeId, setActiveId] = useState<string | null>(null);

    return (
        <div className="flex gap-2 mt-4 overflow-x-auto">
            {items.map((item) => (
                <Chip
                    key={item.id}
                    label={item.label}
                    active={activeId === item.id}
                    onClick={() => setActiveId(item.id)}
                />
            ))}
        </div>
    );
}
