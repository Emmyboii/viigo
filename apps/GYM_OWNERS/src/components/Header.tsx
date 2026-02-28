import { HiLocationMarker, HiOutlineBell } from "react-icons/hi"
import { useNavigate } from "react-router";
import { useAppContext } from "../context/AppContext";


export default function Header() {

    const { hasUnread,selectedGym } = useAppContext();


    const navigate = useNavigate();

    return (
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
                <HiLocationMarker className="text-[#475569] text-xl" />
                <div className="leading-tight">
                    <div className="font-medium text-sm">{selectedGym?.name}</div>
                    <div className="text-sm font-medium">{selectedGym?.location}</div>
                </div>
            </div>

            <div className="relative">
                <HiOutlineBell
                    onClick={() => navigate("/notifications")}
                    className="text-2xl text-[#475569] cursor-pointer"
                />

                {hasUnread && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
            </div>
        </div>
    );
}
