import { useLocation, useNavigate } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";
import { FaUser } from "react-icons/fa6";
import { IoWalletOutline } from "react-icons/io5";
import muscle from '../assets/muscle.png'

export default function Footer() {
    const location = useLocation();
    const navigate = useNavigate();

    const tabs = [
        { name: "Home", icon: AiFillHome, path: "/" },
        { name: "Gym", image: muscle, icon: '', path: "/gym", path2: "/gym/edit" },
        { name: "Wallet", icon: IoWalletOutline, path: "/wallet", path2: "/wallet/edit", path3:"/wallet/transactions" },
        { name: "Profile", icon: FaUser, path: "/profile", path2: "/notifications", path3: "/profile/edit", path4: "/faq", path5: "/support" },
    ];

    return (
        <>
            {/* ✅ Mobile Bottom Nav */}
            <div className="fixed z-40 bottom-0 left-0 w-full bg-white border-t border-[#F1F5F9] shadow-sm mk:hidden">
                <div className="flex justify-between items-center px-4 py-3.5">
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
                                onClick={() => {
                                    window.scrollTo(0, 0);
                                    navigate(tab.path);
                                }}
                                className="flex flex-col items-center justify-center flex-1 cursor-pointer"
                            >
                                {tab.image ? (
                                    <img src={tab.image} alt={tab.name} className="w-6 h-6" />
                                ) : (
                                    <Icon
                                        size={22}
                                        className={isActive ? "text-[#0F172A]" : "text-[#94A3B8]"}
                                    />
                                )}

                                <span
                                    className={`text-xs mt-1 font-medium ${isActive ? "text-[#0F172A]" : "text-[#94A3B8]"
                                        }`}
                                >
                                    {tab.name}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

           
        </>
    );
}
