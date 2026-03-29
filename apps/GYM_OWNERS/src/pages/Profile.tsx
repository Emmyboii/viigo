import { FaRegCircleQuestion, FaRegFaceSmile, FaUser } from 'react-icons/fa6'
import icon from '../assets/profileIcon.png'
import { useNavigate } from 'react-router'
import { useEffect, useState } from 'react'
import { FaUserCircle } from 'react-icons/fa'
import Header from '../components/Header'
import { motion, AnimatePresence } from "framer-motion";
import EditProfile from './EditProfile'
import FAQ from './FAQ'
import Support from './Support'

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

    const [edit, setEdit] = useState(false);
    const [support, setSupport] = useState(false);
    const [faq, setFaq] = useState(false);

    // =========================
    // ✅ OPEN MODALS (push state)
    // =========================
    const openEdit = () => {
        setEdit(true);
        window.history.pushState({ modal: "edit" }, "");
    };

    const openSupport = () => {
        setSupport(true);
        window.history.pushState({ modal: "support" }, "");
    };

    const openFaq = () => {
        setFaq(true);
        window.history.pushState({ modal: "faq" }, "");
    };

    const openLogout = () => {
        setShowLogoutModal(true);
        window.history.pushState({ modal: "logout" }, "");
    };

    const closeLogout = () => {
        setShowLogoutModal(false);

        if (window.history.state?.modal === "logout") {
            window.history.back();
        }
    };

    // =========================
    // ✅ HANDLE BACK BUTTON
    // =========================
    useEffect(() => {
        const handleBack = (e: PopStateEvent) => {
            const modal = e.state?.modal;

            // Close all first
            setEdit(false);
            setSupport(false);
            setFaq(false);
            setShowLogoutModal(false);

            // Re-open based on history state
            if (modal === "edit") setEdit(true);
            if (modal === "support") setSupport(true);
            if (modal === "faq") setFaq(true);
            if (modal === "logout") setShowLogoutModal(true);
        };

        window.addEventListener("popstate", handleBack);
        return () => window.removeEventListener("popstate", handleBack);
    }, []);

    // =========================
    // LOGOUT
    // =========================
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
            navigate("/login");
            closeLogout()
        }
    };

    return (
        <div>
            <div className='mk:block hidden'>
                <Header />
            </div>

            <div className='mk:p-4 pt-10 mk:bg-[#DBEAFE] min-h-[93.3vh] mk:flex justify-center flex-col'>

                <div className='mk:border mk:flex flex-col gap-16 border-[#DBEAFE] w-full bg-white mk:py-6 mk:px-5 py-3 px-4 rounded-md space-y-4 mk:max-w-[400px] mk:mx-auto'>

                    <div className='border border-[#DBEAFE] bg-white py-3 px-4 rounded-md space-y-4'>

                        {/* PROFILE */}
                        <div onClick={openEdit} className="flex items-center justify-between cursor-pointer">
                            <div className="space-y-3">
                                <div className="flex items-center gap-1">
                                    <p className="text-[#0F172A] font-semibold">Profile</p>
                                    <img src={icon} className="w-4 pt-1" alt="" />
                                </div>

                                <div className="flex items-center gap-1">
                                    <FaUser size={16} />
                                    <p className="text-sm">{user?.full_name || "User"}</p>
                                </div>
                            </div>

                            <div className="w-[69px] h-[69px] rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
                                {user?.profile_image ? (
                                    <img title='image' src={user.profile_image} className="w-full h-full object-cover" />
                                ) : (
                                    <FaUserCircle size={60} className="text-gray-400" />
                                )}
                            </div>
                        </div>

                        <div className="border border-dotted"></div>

                        {/* HELP */}
                        <div className='space-y-3'>
                            <p className="font-semibold">Help</p>

                            <div onClick={openFaq} className="flex items-center gap-1 cursor-pointer">
                                <FaRegCircleQuestion size={16} />
                                <p className="text-sm">FAQ</p>
                            </div>

                            <div onClick={openSupport} className="flex items-center gap-1 cursor-pointer">
                                <FaRegFaceSmile size={16} />
                                <p className="text-sm">Support</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={openLogout}
                        className="mt-16 bg-[#2563EB] w-full h-[50px] text-white rounded-md"
                    >
                        Log Out
                    </button>
                </div>

                {/* ========================= */}
                {/* LOGOUT MODAL */}
                {/* ========================= */}
                <AnimatePresence>
                    {showLogoutModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                        >
                            {/* Overlay click (desktop) */}
                            <div
                                className="absolute inset-0"
                                onClick={closeLogout}
                            ></div>

                            <div className="relative bg-white rounded-lg p-6 w-[300px] space-y-4 animate-slideUp">
                                <p className="text-[#0F172A] text-center font-semibold">
                                    Are you sure you want to log out?
                                </p>

                                <div className="flex justify-between gap-4">
                                    <button
                                        onClick={closeLogout}
                                        className="flex-1 py-2 bg-gray-200 rounded-md text-gray-700"
                                        disabled={isLoggingOut}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        className={`flex-1 py-2 rounded-md text-white ${isLoggingOut ? "bg-gray-400" : "bg-[#2563EB]"
                                            } flex justify-center items-center gap-2`}
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ========================= */}
            {/* EDIT MODAL */}
            {/* ========================= */}
            <AnimatePresence>
                {edit && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex justify-center items-start mk:items-center"
                    >
                        <div
                            className="hidden mk:block fixed inset-0 bg-[#0C0A0AC7]"
                            onClick={() => window.history.back()}
                        />
                        <EditProfile setEdit={setEdit} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ========================= */}
            {/* SUPPORT MODAL */}
            {/* ========================= */}
            <AnimatePresence>
                {support && (
                    <motion.div className="fixed inset-0 z-50 flex justify-center items-start mk:items-center">
                        <div
                            className="hidden mk:block fixed inset-0 bg-[#0C0A0AC7]"
                            onClick={() => window.history.back()}
                        />
                        <Support setSupport={setSupport} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ========================= */}
            {/* FAQ MODAL */}
            {/* ========================= */}
            <AnimatePresence>
                {faq && (
                    <motion.div className="fixed inset-0 z-50 flex justify-center items-start mk:items-center">
                        <div
                            className="hidden mk:block fixed inset-0 bg-[#0C0A0AC7]"
                            onClick={() => window.history.back()}
                        />
                        <FAQ setFaq={setFaq} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Profile