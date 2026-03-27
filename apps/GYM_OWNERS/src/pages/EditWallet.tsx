import { useCallback, useEffect, useState } from "react";

import { useAppContext, type WalletType } from "../context/AppContext";
import { FaCircleCheck } from "react-icons/fa6";
import { MdError } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

type ToastType = "success" | "error" | null;

export default function EditWallet() {

    const { wallet, setWallet } = useAppContext()

    const navigate = useNavigate()

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
    const [initialData, setInitialData] = useState<string>("");

    const [form, setForm] = useState({
        account_holder_name: wallet?.account_holder_name || "",
        account_number: wallet?.account_number || "",
        ifsc_code: wallet?.ifsc_code || "",
        gst_number: wallet?.gst_number || "",
    });

    const isValid =
        !!form.account_holder_name &&
        !!form.account_number &&
        !!form.ifsc_code &&
        !!form.gst_number;

    const isChanged = initialData !== JSON.stringify(form);

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        if (!wallet) return;

        const formatted = JSON.stringify({
            account_holder_name: wallet?.account_holder_name,
            account_number: wallet?.account_number,
            ifsc_code: wallet?.ifsc_code,
            gst_number: wallet?.gst_number,
        });

        setInitialData(formatted);
    }, [wallet]);

    useEffect(() => {
        if (!wallet) return;

        setForm({
            account_holder_name: wallet.account_holder_name || "",
            account_number: wallet.account_number || "",
            ifsc_code: wallet.ifsc_code || "",
            gst_number: wallet.gst_number || "",
        });
    }, [wallet]);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!isValid || isLoading) return;

        (document.activeElement as HTMLElement)?.blur();

        setIsLoading(true);

        try {

            const token = localStorage.getItem("token");

            // EDIT existing gym
            const res = await fetch(`${backendUrl}/wallet/`, {
                method: "PUT",
                body: JSON.stringify(form),
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (!res.ok) {
                setToast({ type: "error", message: data.data.error });
                return
            }

            const newWallet: WalletType = data.data;
            setWallet(newWallet);

            setTimeout(() => {
                navigate(-1)
            }, 1550);

            const message = "Changes saved successfully!"
            setToast({ type: "success", message });

            setTimeout(() => {
                window.location.reload()
            }, 1600);

            window.scrollTo(0, 0)
        } catch (err) {
            console.error(err);
            setToast({ type: "error", message: "Something went wrong, please try again!" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleToastClose = useCallback(() => {
        setToast(null);
    }, []);

    return (
        <div className="min-h-screen bg-white px-5 py-6 max-w-[800px] mx-auto">
            {/* Header */}

            <div className="flex items-center gap-3 bg-white cursor-pointer">
                <FiArrowLeft
                    onClick={() => {
                        navigate(-1)
                    }}
                    size={20} />
                <h1 className="text-lg font-semibold text-[#0F172A]">
                    Bank Details & G.S.T Details
                </h1>
            </div>

            <p className="text-sm text-[#0F172A] mt-1">
                Add payout details so we can send your earnings .
            </p>

            {/* Section */}
            <h2 className="mt-6 mb-3 text-[16px] font-semibold text-[#0F172A]">
                Business Details
            </h2>

            {toast && <Toast type={toast.type} text={toast.message} onClose={handleToastClose} />}

            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <Input
                        label="Account Holder Name"
                        placeholder="Enter Name here..."
                        value={form.account_holder_name}
                        onChange={(v) => handleChange("account_holder_name", v)}
                    />

                    <Input
                        label="Bank Account Number"
                        placeholder="Enter Account Number here..."
                        value={form.account_number}
                        onChange={(v) => handleChange("account_number", v)}
                        type="text"
                        inputMode="numeric"
                    />

                    <Input
                        label="IFSC Code"
                        placeholder="Enter IFSC Code here..."
                        value={form.ifsc_code}
                        onChange={(v) => handleChange("ifsc_code", v.toUpperCase())}
                    />

                    <Input
                        label="GST Number"
                        placeholder="Enter PAN or GST Number here..."
                        value={form.gst_number}
                        onChange={(v) => handleChange("gst_number", v)}
                    />
                </div>

                {/* Button */}
                <button
                    disabled={!isValid || isLoading || !isChanged}
                    type="submit"
                    className={`mt-5 text-sm w-full py-4 rounded-md font-semibold transition ${isValid && !isLoading && isChanged
                        ? "bg-[#2563EB] text-white"
                        : "bg-[#94A3B8] text-white"
                        }`}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Verifying...
                        </div>
                    ) : (
                        "Verify Details And Continue"
                    )}
                </button>

            </form>
            
        </div>
    );
}

interface InputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    type?: string;
    inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
}

const Input = ({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    inputMode
}: InputProps) => {
    return (
        <div>
            <p className="text-[14px] mb-1.5 text-[#0F172A] font-normal">
                {label}
            </p>

            <input
                type={type}
                value={value}
                inputMode={inputMode}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full border border-[#475569] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#2563EB] placeholder:text-[#94A3B8]"
            />
        </div>
    );
};

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