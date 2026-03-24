import { FaClock, FaUser } from 'react-icons/fa6'
import icon from '../assets/profileIcon.png'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router'
import { useState } from 'react'
import { FaUserCircle } from 'react-icons/fa'
const backendUrl = import.meta.env.VITE_BACKEND_URL;

type UserType = {
    full_name: string;
    profile_image: string | null;
    email: string;
    phone_number: string | null;
    user_type: string;
    total_fitness_hours: number;
};

type UserProps = {
    user: UserType | null
}

const Profile = ({ user }: UserProps) => {

    const navigate = useNavigate()
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            const token = localStorage.getItem("token");

            await fetch(`${backendUrl}/auth/logout/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (err) {
            console.error("Logout failed", err);
        } finally {
            const recentSearches = localStorage.getItem("recentSearches");
            localStorage.clear();
            if (recentSearches) {
                localStorage.setItem("recentSearches", recentSearches);
            }
            setIsLoggingOut(false);
            setShowLogoutModal(false);
            navigate("/login");
        }
    };

    return (
        <div className='p-4 pt-10'>
            <div className='border border-[#DBEAFE] py-3 px-4 rounded-md space-y-4'>
                <div onClick={() => navigate('/profile/edit')} className="flex items-center justify-between">
                    <div className="space-y-3">
                        <div className="flex items-center gap-1">
                            <p className="text-[#0F172A] font-semibold">Profile</p>
                            <img src={icon} className="w-4 pt-1" alt="Profile Icon" />
                        </div>
                        <div className="flex items-center gap-1">
                            <FaUser size={16} />
                            <p className="text-[#0F172A] font-normal text-sm">{user?.full_name || "User"}</p>
                        </div>
                    </div>

                    <div className="w-[69px] h-[69px] rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
                        {user?.profile_image ? (
                            <img src={user?.profile_image} className="w-full h-full object-cover" alt="Profile Image" />
                        ) : (
                            <FaUserCircle size={60} className="text-gray-400" />
                        )}
                    </div>
                </div>

                <div className="border border-[#F2F2F2] border-dotted"></div>

                <div className='space-y-3'>
                    <p className="text-[#0F172A] font-semibold">Help</p>
                    <div onClick={() => navigate('/faq')} className="flex items-center gap-1">
                        <FaClock size={16} />
                        <p className="text-[#0F172A] font-normal text-sm">FAQ</p>
                    </div>
                    <div onClick={() => navigate('/support')} className="flex items-center gap-1">
                        <FaClock size={16} />
                        <p className="text-[#0F172A] font-normal text-sm">Support</p>
                    </div>
                </div>
            </div>

            <button onClick={() => setShowLogoutModal(true)} className="mt-40 bg-[#2563EB] w-full h-[50px] font-semibold text-sm text-white py-2 px-4 rounded-md">Log Out</button>

            <Footer />

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-lg p-6 w-[300px] space-y-4 animate-slideUp">
                        <p className="text-[#0F172A] text-center font-semibold">
                            Are you sure you want to log out?
                        </p>

                        <div className="flex justify-between gap-4">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 py-2 bg-gray-200 rounded-md text-gray-700"
                                disabled={isLoggingOut}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleLogout}
                                className={`flex-1 py-2 rounded-md text-white ${isLoggingOut ? "bg-gray-400" : "bg-[#2563EB]"} flex justify-center items-center gap-2`}
                                disabled={isLoggingOut}
                            >
                                {isLoggingOut ? (
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    "Log Out"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Profile