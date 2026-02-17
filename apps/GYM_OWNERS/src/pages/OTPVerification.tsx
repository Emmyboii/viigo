import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import lock from "../assets/otpChecking.png";
import lockChecked from "../assets/otpVerified.png";
import lockWrong from "../assets/lockWrong.png";
import { MdError } from "react-icons/md";
import { FaCircleCheck } from "react-icons/fa6";
import { FaRegEdit } from "react-icons/fa";

type Status =
    | "idle"
    | "verifying"
    | "success"
    | "error"
    | "resending"
    | "resendSuccess"
    | "resendError";

type ToastType = "success" | "error" | null;

export default function OTPVerification() {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
    const [time, setTime] = useState<number>(120);
    const [status, setStatus] = useState<Status>("idle");
    const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
    const [identifierText, setIdentifierText] = useState("");

    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
    const navigate = useNavigate();

    // Fetch identifier from localStorage
    useEffect(() => {
        const tempIdentifierStr = localStorage.getItem("tempIdentifier");
        if (!tempIdentifierStr) {
            navigate("/login");
            return;
        }

        const tempIdentifier = JSON.parse(tempIdentifierStr);

        if (tempIdentifier.Email) {
            setIdentifierText(`Email: ${tempIdentifier.Email}`);
        } else if (tempIdentifier.Phone) {
            const last4 = tempIdentifier.Phone.slice(-4);
            setIdentifierText(`Mobile number ending in ${last4}`);
        } else {
            setIdentifierText("your number/email");
        }
    }, [navigate]);

    /* ---------------- Countdown ---------------- */
    useEffect(() => {
        if (time === 0) return;
        const timer = setInterval(() => setTime((t) => t - 1), 1000);
        return () => clearInterval(timer);
    }, [time]);

    const handleChange = (value: string, index: number) => {
        if (!/^\d?$/.test(value)) return;

        if (status === "error" || status === "success") {
            setStatus("idle");
        }

        const updated = [...otp];
        updated[index] = value;
        setOtp(updated);

        if (value && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }

        // auto verify when complete
        if (updated.every(Boolean)) verifyOtp(updated.join(""));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace") {
            if (otp[index]) {
                const updated = [...otp];
                updated[index] = "";
                setOtp(updated);
            } else if (index > 0) {
                inputsRef.current[index - 1]?.focus();
                const updated = [...otp];
                updated[index - 1] = "";
                setOtp(updated);
            }
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
        if (pasted.length === 6) {
            const newOtp = pasted.split("");
            setOtp(newOtp);
            inputsRef.current[5]?.focus();
            verifyOtp(pasted);
        }
    };

    /* ---------------- Verify OTP ---------------- */
    const verifyOtp = async (code: string) => {
        setStatus("verifying");
        const tempIdentifier = JSON.parse(localStorage.getItem("tempIdentifier") || "{}");
        const identifier = tempIdentifier.Email || tempIdentifier.Phone;

        try {
            const response = await fetch(`${backendUrl}/api/auth/otp/verify/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier, otp: code }),
            });

            const data = await response.json();

            if (!response.ok) {
                // throw new Error(data.message || "OTP verification failed");

                const message =
                    data?.data?.message?.[0] || data?.message || "OTP verification failed";

                // Show toast for 3 seconds
                setToast({ type: "error", message });

                // Auto-hide toast after 3 seconds
                setTimeout(() => setToast(null), 2000);
                return;
            }

            localStorage.setItem("token", data?.data?.access);

            localStorage.removeItem("tempIdentifier");

            setStatus("success");
            setToast({ type: "success", message: "OTP verified successfully" });

            // Navigate after toast
            setTimeout(() => {
                setToast(null);
                navigate("/workoutform");
            }, 3000);
        } catch (err: unknown) {
            setStatus("error");

            // Narrow the unknown type to Error
            const message = err instanceof Error ? err.message : "OTP verification failed. Try again later.";
            setToast({ type: "error", message });
            setTimeout(() => setToast(null), 3000);
        }
    };

    /* ---------------- Resend OTP ---------------- */
    const handleResend = async () => {
        setStatus("resending");
        const tempIdentifier = JSON.parse(localStorage.getItem("tempIdentifier") || "{}");
        const identifier = tempIdentifier.Email || tempIdentifier.Phone;

        try {
            const response = await fetch(`${backendUrl}/api/auth/otp/request/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to resend OTP");
            }

            setOtp(["", "", "", "", "", ""]);
            setTime(120);
            setStatus("idle");
            setToast({ type: "success", message: "OTP sent successfully" });
            inputsRef.current[0]?.focus();
            setTimeout(() => setToast(null), 3000);
        } catch (err: unknown) {
            setStatus("resendError");
            const message = err instanceof Error ? err.message : "Failed to resend OTP";
            setToast({ type: "error", message });
            setTimeout(() => setToast(null), 3000);
        }
    };

    const handleToastClose = useCallback(() => {
        setToast(null);

        // Navigate to workout form if OTP success
        if (status === "success") {
            navigate("/workoutform");
        }
    }, [status, navigate]);

    /* ---------------- Helpers ---------------- */
    const borderColor =
        status === "success"
            ? "border-green-500"
            : status === "error"
                ? "border-red-500"
                : "border-[#CBD5E1]";

    const lockImage =
        status === "success" ? lockChecked : status === "error" ? lockWrong : lock;

    return (
        <div>
            {/* 🔄 Center Modal */}
            {(status === "verifying" || status === "resending") && (
                <CenterModal
                    text={status === "verifying" ? "Validating credentials" : "Resending OTP"}
                />
            )}

            {/* ❌ Bottom Toast */}
            {toast && <Toast type={toast.type} text={toast.message} onClose={handleToastClose} />}

            <div className="min-h-screen py-10 bg-white flex justify-center">
                <div className="w-full max-w-s px-6">
                    <img src={lockImage} title="img" className="mx-auto size-[120px]" />

                    <h2 className="text-3xl font-bold mt-4">OTP Verification</h2>

                    <p className="text-base font-semibold text-[#4A4A4A] mt-2">
                        Please enter the verification code sent to {identifierText}.
                        <span
                            className="ml-1 cursor-pointer text-[#2563EB] inline-flex items-center"
                            onClick={() => navigate("/login")}
                        >
                            <FaRegEdit />
                        </span>
                    </p>

                    <div className="mt-6 font-semibold">
                        {Math.floor(time / 60)
                            .toString()
                            .padStart(2, "0")}
                        :{(time % 60).toString().padStart(2, "0")}
                    </div>

                    <div className="flex justify-between gap-3 mt-6">
                        {otp.map((digit, index) => (
                            <input
                                title="otp"
                                key={index}
                                value={digit}
                                maxLength={1}
                                ref={(el) => {
                                    inputsRef.current[index] = el;
                                }}
                                onChange={(e) => handleChange(e.target.value, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onPaste={handlePaste}
                                className={`sm:w-14 w-10 sm:h-14 h-10 text-3xl font-bold text-center border-2 rounded-md focus:outline-none ${borderColor}`}
                            />
                        ))}
                    </div>

                    <p className="text-sm mt-6 text-center">
                        Didn’t receive the OTP?
                        <button
                            disabled={time > 0}
                            onClick={handleResend}
                            className={`ml-1 font-medium ${time > 0 ? "text-gray-400 cursor-not-allowed" : "text-blue-600"
                                }`}
                        >
                            Resend
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ================= Components ================= */

function CenterModal({ text }: { text: string }) {
    return (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white px-6 py-4 rounded-lg flex items-center gap-3 shadow-lg">
                <Spinner />
                <p className="font-medium">{text}</p>
            </div>
        </div>
    );
}

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
            className={`fixed w-[280px] bottom-6 left-1/2 justify-center -translate-x-1/2 
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

function Spinner() {
    return <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />;
}
