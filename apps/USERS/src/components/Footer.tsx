import { useLocation, useNavigate } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";
import { MdExplore } from "react-icons/md";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaUser } from "react-icons/fa6";

export default function Footer() {
    const location = useLocation();
    const navigate = useNavigate();

    const tabs = [
        { name: "Home", icon: AiFillHome, path: "/" },
        { name: "Explore", icon: MdExplore, path: "/explore" },
        { name: "My Bookings", icon: FaRegCalendarAlt, path: "/bookings" },
        { name: "Profile", icon: FaUser, path: "/profile" },
    ];

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-[#F1F5F9] shadow-sm">
            <div className="flex justify-between items-center px-4 py-2">
                {tabs.map((tab) => {
                    const isActive = location.pathname === tab.path;
                    const Icon = tab.icon;

                    return (
                        <div
                            key={tab.name}
                            onClick={() => navigate(tab.path)}
                            className="flex flex-col items-center justify-center flex-1 cursor-pointer"
                        >
                            <Icon
                                size={22}
                                className={isActive ? "text-gray-900" : "text-gray-400"}
                            />

                            <span
                                className={`text-xs mt-1 ${isActive
                                    ? "text-gray-900 font-medium"
                                    : "text-gray-400"
                                    }`}
                            >
                                {tab.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
