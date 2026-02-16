import { HiLocationMarker, HiOutlineBell } from "react-icons/hi"
import { IoChevronDown } from "react-icons/io5";

export default function Header() {
    return (
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
                <HiLocationMarker className="text-[#475569] text-xl" />
                <div className="leading-tight">
                    <div className="font-medium text-sm">Pallavaram</div>
                    <div className="text-sm font-medium">Chennai</div>
                </div>
                <IoChevronDown className="text-[#475569]" />
            </div>

            <HiOutlineBell className="text-xl text-[#475569]" />
        </div>
    );
}
