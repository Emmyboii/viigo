import { useState } from "react";
import Footer from "../components/Footer";

export default function CreateWallet() {
    const [form, setForm] = useState({
        name: "",
        account: "",
        ifsc: "",
        gst: "",
    });

    const isValid =
        form.name && form.account && form.ifsc && form.gst;

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="min-h-screen bg-white px-5 py-6">
            {/* Header */}
            <h1 className="text-[20px] font-semibold text-[#0F172A]">
                Setup Your Wallet
            </h1>
            <p className="text-sm text-[#64748B] mt-1">
                Add payout details so we can send your earnings .
            </p>

            {/* Section */}
            <h2 className="mt-6 mb-3 text-[16px] font-semibold text-[#0F172A]">
                Business Details
            </h2>

            <div className="space-y-4">
                <Input
                    label="Account Holder Name"
                    placeholder="Enter Name here..."
                    value={form.name}
                    onChange={(v) => handleChange("name", v)}
                />

                <Input
                    label="Bank Account Number"
                    placeholder="Enter Account Number here..."
                    value={form.account}
                    onChange={(v) => handleChange("account", v)}
                    type="number"
                />

                <Input
                    label="IFSC Code"
                    placeholder="Enter IFSC Code here..."
                    value={form.ifsc}
                    onChange={(v) => handleChange("ifsc", v.toUpperCase())}
                />

                <Input
                    label="GST Number"
                    placeholder="Enter PAN or GST Number here..."
                    value={form.gst}
                    onChange={(v) => handleChange("gst", v)}
                />
            </div>

            {/* Button */}
            <button
                disabled={!isValid}
                className={`mt-8 w-full py-3 rounded-xl font-medium transition ${isValid
                        ? "bg-[#2563EB] text-white"
                        : "bg-[#94A3B8] text-white"
                    }`}
            >
                Verify Details And Continue
            </button>

            <Footer />
        </div>
    );
}

interface InputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    type?: string;
}

const Input = ({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
}: InputProps) => {
    return (
        <div>
            <p className="text-[14px] mb-1 text-[#0F172A] font-medium">
                {label}
            </p>

            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full border border-[#475569] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#2563EB] placeholder:text-[#94A3B8]"
            />
        </div>
    );
};