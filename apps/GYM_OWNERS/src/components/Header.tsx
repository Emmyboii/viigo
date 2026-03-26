import { HiLocationMarker, HiOutlineBell } from "react-icons/hi"
import { useNavigate } from "react-router";
import { useAppContext } from "../context/AppContext";


export default function Header() {

    const { hasUnread, selectedGym } = useAppContext();


    const navigate = useNavigate();

    return (
        <div className="flex justify-between items-center mb-4 border-b border-[#E2E8F0] pb-6 pt-2 px-5">
            <div className="flex items-center gap-2">
                <HiLocationMarker className="text-[#475569] text-xl" />
                <div className="leading-tight">
                    <div className="font-medium text-sm">{selectedGym?.name}</div>
                    <div className="text-sm font-medium">{selectedGym?.city}, {selectedGym?.state}</div>
                </div>
            </div>

            <div className="relative">
                <HiOutlineBell
                    onClick={() => navigate("/notifications")}
                    className="text-2xl text-[#475569] cursor-pointer"
                />

                {hasUnread && (
                    <span className="absolute top-0.5 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
            </div>
        </div>
    );
}
