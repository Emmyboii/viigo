import { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import icon from '../assets/profileIcon.png'
import { RiDeleteBinLine, RiErrorWarningLine } from "react-icons/ri";
import { FaCircleCheck, FaUser } from "react-icons/fa6";
import { FaUserCircle } from "react-icons/fa";
import Footer from "../components/Footer";
import { MdError } from "react-icons/md";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const gymOwnerReasonValues = [
    "closed_gym",
    "not_enough_bookings",
    "app_not_working",
    "using_another_app",
    "hard_to_manage",
];

type DeletionReason = {
    value: string;
    label: string;
};

const DeleteAccount = () => {
    const navigate = useNavigate();
    const { userData } = useAppContext();

    useEffect(() => {
        document.title = "Viigo – Delete Account";

        // Optional: restore the default title when leaving the page
        return () => {
            document.title = "Viigo – Find Gyms Near You";
        };
    }, []);

    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [reasons, setReasons] = useState<DeletionReason[]>([]);
    const [understood, setUnderstood] = useState(false);
    const [deleted, setDeleted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [reasonsLoading, setReasonsLoading] = useState(true);

    const canDelete =
        !reasonsLoading &&
        selectedReason !== null &&
        understood;

    useEffect(() => {
        const fetchReasons = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await fetch(
                    `${backendUrl}/api/user/deletion-reasons/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await res.json();

                if (!res.ok) return;

                const filteredReasons = (
                    data?.data?.reasons || []
                ).filter((reason: DeletionReason) =>
                    gymOwnerReasonValues.includes(reason.value)
                );

                setReasons(filteredReasons);
            } catch (err) {
                console.error(err);
            } finally {
                setReasonsLoading(false);
            }
        };

        fetchReasons();
    }, []);

    const handleDelete = async () => {
        if (!canDelete) return;
        setLoading(true);
        try {
            const res = await fetch(`${backendUrl}/api/user/delete/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    reason: selectedReason,
                    understand_permanent: understood,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                const message =
                    data?.data?.reason?.[0] ||
                    data?.data?.understand_permanent?.[0] ||
                    data?.data?.error ||
                    data?.message ||
                    "Failed to delete account";
                setToast({ type: "error", message });
                setTimeout(() => setToast(null), 2000);
                return;
            }

            localStorage.clear();
            setDeleted(true);
        } catch {
            setToast({ type: "error", message: "Something went wrong. Please try again." });
            setTimeout(() => setToast(null), 2000);
        } finally {
            setLoading(false);
        }
    };

    // ── Deleted success screen ──────────────────────────────────────────────
    if (deleted) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center mt-20 px-6 text-center">
                <div className="w-[84px] h-[84px] rounded-full bg-[#FDECEA] flex items-center justify-center mb-4">
                    <RiDeleteBinLine className="text-[#F43F5E] w-[38px] h-[38px]" />
                </div>

                <h1 className="text-[22px] font-bold text-[#0F172A] mb-1">
                    Account Deleted
                </h1>
                <p className="text-[14px] text-[#475569] leading-[1.6] max-w-[280px] mb-8">
                    Your account has been permanently deleted. All your data has been
                    removed from our servers.
                </p>

                <button
                    onClick={() => navigate("/")}
                    className="w-full max-w-[320px] bg-blue-600 text-white py-3.5 rounded-md font-semibold text-[15px]"
                >
                    Back to Home
                </button>

                <p className="text-[12px] text-[#94A3B8] text-start mt-4">
                    Changed your mind? You can create a new account anytime.
                </p>
            </div>
        );
    }

    // ── Main delete screen ──────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-white pb-10 px-4 mb-20 max-w-[800px] mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 py-4 border-b border-[#F1F5F9]">
                <button title="Back" onClick={() => navigate(-1)} className="p-1 block mk:hidden">
                    <IoArrowBack size={20} />
                </button>
                <span className="font-semibold text-[17px] text-[#0F172A]">
                    Delete Account
                </span>
            </div>

            <div className="px-4 pt-5 space-y-5 border border-[#DBEAFE] rounded-md">
                {/* Profile card */}
                <div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-3">
                            <div className="flex items-center gap-1">
                                <p className="text-[#0F172A] font-semibold">Profile</p>
                                <img src={icon} className="w-4" alt="Profile Icon" />
                            </div>
                            <div className="flex items-center gap-1">
                                <FaUser size={16} />
                                <p className="text-[#0F172A] font-normal text-sm">
                                    {userData?.full_name?.split(" ")[0] || userData?.email || "User"}
                                </p>
                            </div>
                        </div>

                        <div className="w-[69px] h-[69px] rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
                            {userData?.profile_image ? (
                                <img src={userData?.profile_image} className="w-full h-full object-cover" alt="Profile Image" />
                            ) : (
                                <FaUserCircle size={60} className="text-gray-400" />
                            )}
                        </div>
                    </div>

                    {/* Warning banner */}
                    <div className="mt-6 bg-[#DBEAFE] rounded-lg px-3.5 py-3 flex gap-2.5 items-center">
                        <RiErrorWarningLine className="size-5 flex-shrink-0 text-[#2563EB]" />
                        <p className="text-[12px] font-medium text-[#2563EB] leading-[1.4]">
                            Deleting your account is permanent. All your data will be wiped
                            and you will not be able to recover it.
                        </p>
                    </div>
                </div>

                <div className="border border-[#F2F2F2] border-dotted"></div>

                {/* Reason selection */}
                <div>
                    <h2 className="font-semibold text-[16px] text-[#0F172A] mb-3">
                        Reason for deletion
                    </h2>

                    <div className="overflow-hidden">
                        {reasonsLoading ? (
                            <div className="space-y-3 animate-pulse">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="h-12 bg-gray-100 rounded-md" />
                                ))}
                            </div>
                        ) : (
                            reasons.map((reason) => {
                                const isSelected = selectedReason === reason.value;
                                return (
                                    <button
                                        key={reason.value}
                                        onClick={() => setSelectedReason(reason.value)}
                                        className={`w-full flex items-center gap-3 px-2 py-3.5 text-left transition-colors ${isSelected ? "bg-[#DBEAFE] rounded" : "bg-white"
                                            }`}
                                    >
                                        {/* Radio circle */}
                                        <span
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected
                                                ? "border-blue-600"
                                                : "border-[#CBD5E1]"
                                                }`}
                                        >
                                            {isSelected && (
                                                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                                            )}
                                        </span>
                                        <span
                                            className={`text-[14px] leading-[1.5] ${isSelected
                                                ? "text-[#0F172A]"
                                                : "text-[#0F172A]"
                                                }`}
                                        >
                                            {reason.label}
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-5 space-y-5">
                {/* Acknowledgement checkbox */}
                <button
                    onClick={() => setUnderstood((p) => !p)}
                    className="flex items-center gap-3 w-full text-left py-2"
                >
                    <span
                        className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${understood
                            ? "bg-blue-600 border-blue-600"
                            : "border-[#CBD5E1] bg-white"
                            }`}
                    >
                        {understood && (
                            <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        )}
                    </span>
                    <span className="text-[12px] text-[#0F172A] font-medium leading-[1.3]">
                        I understand that deleting my account is permanent and irreversible.
                    </span>
                </button>

                {toast && (
                    <div className="fixed bottom-20 z-50 left-4 right-4 mx-auto max-w-sm w-fit
                            bg-white px-4 py-3 rounded-lg flex items-center gap-3
                            shadow-[0_10px_40px_rgba(0,0,0,0.18)] animate-[fadeIn_0.2s_ease-out]">
                        <span className={`text-xl flex-shrink-0 ${toast.type === "success" ? "text-green-500" : "text-red-500"}`}>
                            {toast.type === "success" ? <FaCircleCheck /> : <MdError />}
                        </span>
                        <p className="text-sm font-medium">{toast.message}</p>
                    </div>
                )}

                <div className="space-y-3">
                    {/* Delete button */}
                    <button
                        onClick={handleDelete}
                        disabled={!canDelete || loading}
                        className={`w-full py-4 rounded-xl font-semibold text-[15px] transition-opacity ${canDelete && !loading
                            ? "bg-[#F43F5E] text-white"
                            : "bg-[#F43F5E] text-white opacity-50 cursor-not-allowed"
                            }`}
                    >
                        {loading ? "Deleting..." : "Delete My Account"}
                    </button>

                    {/* Cancel button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full py-4 rounded-xl font-semibold text-[14px] text-blue-600 border border-[#2563EB]"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default DeleteAccount;