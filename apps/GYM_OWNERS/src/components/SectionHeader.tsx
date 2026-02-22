import { IoChevronForward } from "react-icons/io5";

interface SectionHeaderProps {
    title?: string;
}

export default function SectionHeader({ title }: SectionHeaderProps) {
    return (
        <div className="flex justify-between items-center mt-6 mb-3">
            <h2 className="font-semibold text-base">{title}</h2>
            <button className="text-sm text-[#0F172A] flex items-center gap-1">
                See All
                <IoChevronForward />
            </button>
        </div>
    );
}
