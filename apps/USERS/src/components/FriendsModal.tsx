import { useState } from "react";
import { IoInformationCircleOutline } from "react-icons/io5";

interface FriendsModalProps {
    open: boolean;
    onClose: () => void;
    value: number;
    onApply: (val: number) => void;
}

export function FriendsModal({
    open,
    onClose,
    value,
    onApply,
}: FriendsModalProps) {
    const [count, setCount] = useState(value);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div
                onClick={onClose}
                className="absolute inset-0 bg-black/40"
            />

            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5 animate-slideUp">
                <div className="flex justify-between items-center mb">
                    <h3 className="font-semibold text-lg">
                        Workout With Friends
                    </h3>

                    <button className="text-[#000000] font-bold" onClick={onClose}>✕</button>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                    Invite up to 2 friends into your workout
                    <br />
                    (3 people total).
                </p>

                {/* Counter */}
                <div className="flex items-center justify-center gap-6 mb-6">
                    <button
                        onClick={() => setCount((prev) => Math.max(0, prev - 1))}
                        className="w-10 h-10 rounded-full bg-gray-200"
                    >
                        -
                    </button>

                    <span className="text-xl font-semibold">{count}</span>

                    <button
                        onClick={() => setCount((prev) => Math.min(2, prev + 1))}
                        className="w-10 h-10 rounded-full bg-blue-500 text-white"
                    >
                        +
                    </button>
                </div>

                <p className="text-[11px] font-normal text-[#475569] mb-4 flex items-start gap-1">
                    <IoInformationCircleOutline className="text-[18px]" />
                    Session starts once the otp is verified. All friends must check in at the same time.
                </p>

                <button
                    onClick={() => {
                        onApply(count);
                        onClose();
                    }}
                    className="w-full bg-blue-600 text-white py-3 rounded-md"
                >
                    Apply
                </button>
            </div>
        </div>
    );
}