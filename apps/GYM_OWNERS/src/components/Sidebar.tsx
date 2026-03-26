import { useLocation, useNavigate } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";
import { FaUser } from "react-icons/fa6";
import { IoWalletOutline } from "react-icons/io5";
import { HiOutlineUser } from "react-icons/hi";
import { FaUserCircle } from "react-icons/fa";
import { useAppContext } from "../context/AppContext";
import muscle from "../assets/muscle.png";
import logo from "../assets/icon3.jpeg";

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { userData } = useAppContext();

    const tabs = [
        { name: "Dashboard", icon: AiFillHome, path: "/" },
        { name: "Manage Gym", image: muscle, path: "/gym", path2: "/gym/edit" },
        { name: "Wallet", icon: IoWalletOutline, path: "/wallet", path2: "/wallet/edit" },
        { name: "Profile", icon: FaUser, path: "/profile", path2: "/notifications", path3: "/profile/edit", path4: "/faq", path5: "/support" },
    ];

    return (
        <div className="hidden mk:flex fixed top-0 left-0 h-screen w-[270px] bg-white border-r border-[#F1F5F9] shadow-sm z-50 flex-col justify-between pt-6">

            <div className="space-y-6 flex flex-col justify-between h-screen">

                <div>
                    <div className="px-6 pb-3">
                        <img src={logo} alt="" className="w-14" />
                    </div>

                    <div className="space-y-6 px-6">
                        {tabs.map((tab) => {
                            const isActive =
                                location.pathname === tab.path ||
                                location.pathname === tab.path2 ||
                                location.pathname === tab.path3 ||
                                location.pathname === tab.path4 ||
                                location.pathname === tab.path5;

                            const Icon = tab.icon;

                            return (
                                <div
                                    key={tab.name}
                                    onClick={() => navigate(tab.path)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer ${isActive
                                        ? "bg-[#EFF6FF] text-[#2563EB]"
                                        : "text-[#64748B] hover:bg-gray-100"
                                        }`}
                                >
                                    {tab.image ? (
                                        <img title="tab" src={tab.image} className="w-6 h-6" />
                                    ) : (
                                        Icon && <Icon size={20} />
                                    )}

                                    <span className="text-sm font-medium">{tab.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* USER */}
                <div onClick={() => navigate('/profile')} className="cursor-pointer border-t py-5">
                    <div className="px-6 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-1">
                                <HiOutlineUser size={16} />
                                <p className="text-sm">
                                    {userData?.full_name.split(" ")[0] || "User"}
                                </p>
                            </div>
                            <p className="text-sm mt-2">Gym Owner</p>
                        </div>

                        <div className="w-[60px] h-[60px] rounded-full overflow-hidden bg-gray-100">
                            {userData?.profile_image ? (
                                <img title="profile" src={userData.profile_image} className="w-full h-full object-cover" />
                            ) : (
                                <FaUserCircle size={50} className="text-gray-400" />
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}