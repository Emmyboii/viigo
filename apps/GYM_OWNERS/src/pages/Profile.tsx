import { FaRegCircleQuestion, FaRegFaceSmile, FaUser } from 'react-icons/fa6'
import icon from '../assets/profileIcon.png'
import profile from '../assets/userProfileImg.png'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router'
import { HiOutlineCurrencyRupee } from 'react-icons/hi'

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

    const handleLogout = async () => {
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
            localStorage.removeItem("token");
            localStorage.removeItem("tokenTimestamp");
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

                    <img src={profile} className="w-[69px]" alt="Profile Image" />
                </div>

                <div className="border border-[#F2F2F2] border-dotted"></div>

                <div onClick={() => navigate('/wallet/edit')} className="space-y-3">
                    <div className="flex items-center gap-1">
                        <p className="text-[#0F172A] font-semibold">Finance</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <HiOutlineCurrencyRupee size={20} />
                        <p className="text-[#0F172A] font-normal text-sm">Edit Bank Details & G.S.T </p>
                    </div>
                </div>

                <div className="border border-[#F2F2F2] border-dotted"></div>

                <div className='space-y-4'>
                    <p className="text-[#0F172A] font-semibold">Help</p>
                    <div onClick={() => navigate('/faq')} className="flex items-center gap-1">
                        <FaRegCircleQuestion size={16} />
                        <p className="text-[#0F172A] font-normal text-sm">FAQ</p>
                    </div>
                    <div onClick={() => navigate('/support')} className="flex items-center gap-1">
                        <FaRegFaceSmile size={16} />
                        <p className="text-[#0F172A] font-normal text-sm">Support</p>
                    </div>
                </div>
            </div>

            <button onClick={handleLogout} className="mt-20 bg-[#2563EB] w-full h-[50px] font-semibold text-sm text-white py-2 px-4 rounded-md">Log Out</button>

            <Footer />
        </div>
    )
}

export default Profile