interface ChipItem {
    id: string;
    label: string;
    icon: React.ReactNode;
}

interface ChipProps {
    label: string;
    icon: React.ReactNode;
    active?: boolean;
    onClick?: () => void;
}

// ${active
//         ? "bg-[#DBEAFE] border-[#2563EB] text-[#2563EB]"
//         : "bg-[#F1F5F9] border-[#CBD5E1] text-[#0F172A]"}

export function Chip({ label, onClick, icon }: ChipProps) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-lg bg-[#F1F5F9] border-[#CBD5E1] text-[13px] flex items-center gap-2 justify-center border w-full text-nowrap transition`}
        >
            {icon}
            {label}
        </button>
    );
}

interface FilterChipsProps {
    items: ChipItem[];
    activeId: string;
    onChange: (id: string) => void;
}

export default function FilterChips({ items, activeId, onChange }: FilterChipsProps) {

    return (
        <div className="flex gap-2 w-full mt-4 overflow-x-auto no-scrollbar">
            {items.map((item) => (
                <Chip
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    active={activeId === item.id}
                    onClick={() => onChange(item.id)}
                />
            ))}
        </div>
    );
}
