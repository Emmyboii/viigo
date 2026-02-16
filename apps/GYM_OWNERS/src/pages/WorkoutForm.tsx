'use client';
import { useEffect, useState } from 'react';
import { FaCircleCheck } from 'react-icons/fa6';
import { MdError } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

type ToastType = "success" | "error" | null;

export default function WorkoutForm() {
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [checkingOnboarding, setCheckingOnboarding] = useState(true);
    const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

    const isFormComplete = name.trim() !== '';

    /* ---------------- Check onboarding ---------------- */
    useEffect(() => {
        const checkOnboarding = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${backendUrl}/api/onboarding/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();

                if (data.data.is_completed) {
                    navigate('/'); // user already completed onboarding
                } else {
                    setCheckingOnboarding(false); // show form
                }
            } catch (err) {
                console.error('Failed to check onboarding:', err);
                setCheckingOnboarding(false); // fallback: show form
            }
        };

        checkOnboarding();
    }, [backendUrl, navigate]);

    /* ---------------- Handle Submit ---------------- */
    const handleSubmit = async () => {
        if (!isFormComplete || isLoading) return;

        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const payload = {
                name,
            };

            const res = await fetch(`${backendUrl}/api/onboarding/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                // throw new Error(data.message || 'Failed to save onboarding');

                const message =
                    data?.data?.message?.[0] || data?.message || "Something went wrong";

                // Show toast for 3 seconds
                setToast({ type: "error", message });

                // Auto-hide toast after 3 seconds
                setTimeout(() => setToast(null), 2000);
                return;
            }

            // ✅ Show success toast
            setToast({ type: 'success', message: 'Onboarding completed successfully!' });

            // Navigate after 2 seconds
            setTimeout(() => {
                setToast(null);
                navigate('/'); // go to home
            }, 2000);
        } catch (err: unknown) {
            console.error(err);
            const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
            setToast({ type: "error", message });
            setTimeout(() => setToast(null), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    /* ---------------- Render ---------------- */
    if (checkingOnboarding) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                {/* Spinner */}
                <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4"></div>

                {/* Text */}
                <p className="text-gray-700 text-lg font-medium">
                    Checking onboarding status...
                </p>
            </div>
        );
    }

    return (
        <div className="p-5 space-y-6 flex flex-col h-screen">

            {/* Toast */}
            {toast && <Toast type={toast.type} text={toast.message} />}

            <div className="flex-1 overflow-y-auto space-y-6">
                {/* Question 1 */}
                <div>
                    <label className="block mb-2 font-semibold text-black text-[22px]">
                        What's your Name?
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border border-[#475569] text-[#0F172A] text-sm w-full rounded-lg py-2 px-4 outline-none h-[48px]"
                        placeholder="Please type our name here ..."
                    />
                </div>
            </div>

            {/* Save Button */}
            <button
                type='button'
                onClick={handleSubmit}
                disabled={!isFormComplete || isLoading}
                className={`rounded-md w-full px-2 h-[48px] items-end text-white font-semibold text-sm ${!isFormComplete || isLoading
                    ? 'bg-[#94A3B8] cursor-not-allowed'
                    : 'bg-[#2563EB] cursor-pointer'
                    }`}
            >
                {isLoading ? 'Loading...' : 'Continue'}
            </button>
        </div>
    );
}

/* ================= Toast Component ================= */
function Toast({ text, type }: { text: string; type: ToastType; }) {
    const isSuccess = type === 'success';
    return (
        <div
            className={`fixed w-[280px] bottom-6 left-1/2 justify-center -translate-x-1/2 
      bg-white px-4 py-3 rounded-lg flex items-center gap-3
      shadow-[0_10px_40px_rgba(0,0,0,0.18)] animate-[fadeIn_0.2s_ease-out]`}
        >
            <span className={`text-xl ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
                {isSuccess ? <FaCircleCheck /> : <MdError />}
            </span>
            <p className="text-sm font-medium">{text}</p>
        </div>
    );
}
