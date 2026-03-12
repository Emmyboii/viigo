import { useNavigate } from 'react-router-dom'
import { IoArrowBack } from 'react-icons/io5'
import Footer from '../components/Footer'
import React, { useCallback, useEffect, useState } from 'react'
import { FaCircleCheck } from 'react-icons/fa6'
import { MdError } from 'react-icons/md'
import { FaUserCircle } from 'react-icons/fa'

const backendUrl = import.meta.env.VITE_BACKEND_URL;
type ToastType = "success" | "error" | null;

const EditProfile = () => {

    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        profile_image: null as File | null,
        profile_image_url: '' as string,
    });

    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const [initialData, setInitialData] = useState(formData);
    const [isLoading, setIsLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

    useEffect(() => {
        setIsLoading(true)

        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${backendUrl}/api/user/profile/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();

                if (data?.data) {
                    setFormData({
                        full_name: data.data.full_name || '',
                        email: data.data.email || '',
                        phone_number: data.data.phone_number || '',
                        profile_image: null,
                        profile_image_url: data.data.profile_image || '',
                    });
                    setInitialData({
                        full_name: data.data.full_name || '',
                        email: data.data.email || '',
                        phone_number: data.data.phone_number || '',
                        profile_image: null,
                        profile_image_url: data.data.profile_image || '',
                    });
                }
            } catch (err) {
                console.error('Failed to fetch profile', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const isDirty =
        formData.full_name !== initialData.full_name ||
        formData.email !== initialData.email ||
        formData.phone_number !== initialData.phone_number ||
        formData.profile_image !== null;

    // const isValid =
    //     formData.email.trim() !== '' &&
    //     formData.phone_number.trim() !== '';

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // if (!isValid) return;

        setSaving(true);

        try {
            const token = localStorage.getItem("token");

            const fd = new FormData();
            fd.append("full_name", formData.full_name);
            fd.append("email", formData.email);
            fd.append("phone_number", formData.phone_number);

            if (formData.profile_image) {
                fd.append("profile_image", formData.profile_image);
            }

            const res = await fetch(`${backendUrl}/api/user/profile/`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: fd,
            });

            if (!res.ok) throw new Error("Failed to update");

            setToast({ type: "success", message: "Changes saved successfully!" });

            setTimeout(() => {
                navigate("/profile");
                window.location.reload();
            }, 1500);

        } catch (err) {
            console.error(err);
            setToast({ type: "error", message: "Something went wrong, please try again!" });
        } finally {
            setSaving(false);
        }
    };


    const handleToastClose = useCallback(() => {
        setToast(null);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500">Loading profile...</p>
                </div>
            </div>
        );
    }

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

            {toast && <Toast type={toast.type} text={toast.message} onClose={handleToastClose} />}

            <form onSubmit={handleSave}>

                <div className='border border-[#DBEAFE] py-6 px-4 rounded-md space-y-4'>
                    <div className="flex items-center justify-between">
                        <div className="space-y-3">
                            <p className="text-[#0F172A] font-semibold text-base">{formData?.full_name || "User"}</p>
                            <p className="text-[#0F172A] font-normal text-sm">Gym Owner</p>
                        </div>

                        <label className="cursor-pointer">
                            <div className="w-[69px] h-[69px] rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
                                {previewImage ? (
                                    <img
                                        src={previewImage}
                                        className="w-full h-full object-cover"
                                        alt="Profile"
                                    />
                                ) : formData.profile_image_url ? (
                                    <img
                                        src={formData.profile_image_url}
                                        className="w-full h-full object-cover"
                                        alt="Profile"
                                    />
                                ) : (
                                    <FaUserCircle size={60} className="text-gray-400" />
                                )}
                            </div>

                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    setFormData((prev) => ({
                                        ...prev,
                                        profile_image: file,
                                    }));

                                    setPreviewImage(URL.createObjectURL(file));
                                }}
                            />
                        </label>
                    </div>

                    <div className="border border-[#F2F2F2] border-dotted"></div>

                    <div className='space-y-2'>
                        <p className="text-[#0F172A] font-semibold">Account Details</p>

                        <div className='space-y-2 pt-2'>
                            <p className='text-[#0F172A] text-sm'>Full Name</p>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                title='fullname'
                                className="w-full border border-[#E2E8F0] h-[50px] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className='space-y-2 pt-2'>
                            <p className='text-[#0F172A] text-sm'>Email ID</p>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                title='email'
                                className="w-full border border-[#E2E8F0] h-[50px] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className='space-y-2 pt-2'>
                            <p className='text-[#0F172A] text-sm'>Phone Number</p>
                            <input
                                type="tel"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                title='phone'
                                className="w-full border border-[#E2E8F0] h-[50px] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={!isDirty || saving}
                    className={`mt-8 w-full h-[50px] rounded-md text-sm font-semibold text-white
                        ${(!isDirty || saving) ? 'bg-gray-400' : 'bg-[#2563EB]'}`}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>

            </form>

            <Footer />
        </div>
    )
}

export default EditProfile

function Toast({ text, type, onClose }: { text: string; type: ToastType; onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const isSuccess = type === "success";

    return (
        <div
            className={`fixed w-[280px] bottom-20 z-50 left-1/2 justify-center -translate-x-1/2 
      bg-white px-4 py-3 rounded-lg flex items-center gap-3
      shadow-[0_10px_40px_rgba(0,0,0,0.18)] animate-[fadeIn_0.2s_ease-out]`}
        >
            <span className={`text-xl ${isSuccess ? "text-green-500" : "text-red-500"}`}>
                {isSuccess ? <FaCircleCheck /> : <MdError />}
            </span>
            <p className="text-sm font-medium">{text}</p>
        </div>
    );
}