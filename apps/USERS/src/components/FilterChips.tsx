
interface ChipProps {
    children?: React.ReactNode;
    active?: boolean;
}

export function Chip({ children, active }: ChipProps) {
    return (
        <button
            className={`px-3 py-1.5 rounded-lg text-[13px] border w-full text-nowrap 
      ${active
                    ? "bg-[#DBEAFE] border-[#2563EB] text-[#2563EB]"
                    : "bg-[#F1F5F9] border-[#CBD5E1] text-[#0F172A]"}
      `}
        >
            {children}
        </button>
    );
}

export default function FilterChips() {
    return (
        <div className="flex gap-2 mt-4 overflow-x-auto">
            <Chip>Filters</Chip>
            <Chip>Sort By</Chip>
            <Chip active>Near Me ✕</Chip>
            <Chip>Women</Chip>
        </div>
    );
}
