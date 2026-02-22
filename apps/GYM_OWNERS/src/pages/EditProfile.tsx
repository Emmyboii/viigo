import profile from '../assets/userProfileImg.png'
import { useNavigate } from 'react-router-dom'
import { IoArrowBack } from 'react-icons/io5'
import Footer from '../components/Footer'

const EditProfile = () => {

    const navigate = useNavigate()

    return (
        <div className='p-5'>
            <div className="fixed top-0 left-0 right-0 z-40 bg-white flex items-center px-4 py-3" >

                <button
                    onClick={() => navigate(-1)}
                    aria-label="Go back"
                    className="p-1"
                >
                    <IoArrowBack size={20} />
                </button>

                <span className="font-semibold text-lg text-[#0F172A]">Edit Gym Details</span>
            </div>

            <div className='pt-14'></div>

            <div className='border border-[#DBEAFE] py-6 px-4 rounded-md space-y-4'>
                <div className="flex items-center justify-between">
                    <div className="space-y-3">
                        <p className="text-[#0F172A] font-semibold text-base">Vijay</p>
                        <p className="text-[#0F172A] font-normal text-sm">Gym Owner</p>
                    </div>

                    <img src={profile} className="w-[69px]" alt="Profile Image" />
                </div>

                <div className="border border-[#F2F2F2] border-dotted"></div>

                <div className='space-y-2'>
                    <p className="text-[#0F172A] font-semibold">Account Details</p>

                    <div className='space-y-2 pt-2'>
                        <p className='text-[#0F172A] text-sm'>Full Name</p>
                        <input
                            type="text"
                            name="fullname"
                            id="fullname"
                            title='fullname'
                            className="w-full border border-[#E2E8F0] h-[50px] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className='space-y-2 pt-2'>
                        <p className='text-[#0F172A] text-sm'>Email ID</p>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            title='email'
                            className="w-full border border-[#E2E8F0] h-[50px] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className='space-y-2 pt-2'>
                        <p className='text-[#0F172A] text-sm'>Phone Number</p>
                        <input
                            type="tel"
                            name="phone"
                            id="phone"
                            title='phone'

                            className="w-full border border-[#E2E8F0] h-[50px] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            <button className="mt-8 bg-[#2563EB] w-full h-[50px] font-semibold text-sm text-white py-2 px-4 rounded-md">Save Changes</button>

            <Footer />
        </div>
    )
}

export default EditProfile