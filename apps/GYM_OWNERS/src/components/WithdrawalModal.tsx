import { useState } from "react";
import { IoClose } from "react-icons/io5";

type Props = {
    open: boolean;
    balance: number;
    onClose: () => void;
    onSubmit: (amount: string) => Promise<void>;
};

export default function WithdrawalModal({ open, balance, onClose, onSubmit }: Props) {
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const numericAmount = Number(amount);

    const exceedsBalance = numericAmount > balance;
    const invalidAmount = numericAmount <= 0 || !amount;

    const isInvalid = exceedsBalance || invalidAmount;

    const handleSubmit = async () => {
        if (isInvalid) return;

        setLoading(true);
        try {
            await onSubmit(amount);
            setAmount("");
            onClose();
        } finally {
            setLoading(false);
        }
    };


    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] px-4"
            onClick={onClose} 
        >
            <div
                className="bg-white w-full max-w-sm rounded-2xl p-6 space-y-5"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Withdraw Funds</h3>
                    <button title="close" onClick={onClose}>
                        <IoClose size={22} />
                    </button>
                </div>

                {/* Balance */}
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500">Available Balance</p>
                    <p className="text-xl font-semibold text-blue-600">₹ {balance}</p>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Amount</label>
                    <input
                        type="number"
                        placeholder="Enter withdrawal amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />

                    {exceedsBalance && (
                        <p className="text-xs text-red-500">
                            Insufficient account balance!
                        </p>
                    )}
                </div>

                {/* Button */}
                <button
                    disabled={isInvalid || loading}
                    onClick={handleSubmit}
                    className={`w-full py-2 rounded-lg text-sm font-medium
                        ${isInvalid
                            ? "bg-gray-200 text-gray-400"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                >
                    {loading ? "Processing..." : "Request Withdrawal"}
                </button>
            </div>
        </div>
    );
}