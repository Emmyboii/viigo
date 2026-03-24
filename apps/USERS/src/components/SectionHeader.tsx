import { IoChevronForward } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

interface SectionHeaderProps {
    title?: string;
    url?: string;
}

export default function SectionHeader({ title, url }: SectionHeaderProps) {

    const navigate = useNavigate()
    return (
        <div className="flex justify-between items-center mt-6 mb-3">
            <h2 className="font-semibold text-base">{title}</h2>
            <button onClick={() => navigate(`${url}`)} className="text-xs font-medium text-[#0F172A] flex items-center gap-1">
                See All
                <IoChevronForward />
            </button>
        </div>
    );
}
