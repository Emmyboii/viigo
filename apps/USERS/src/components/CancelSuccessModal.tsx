import { FaCheck } from "react-icons/fa";
import { FiInfo } from "react-icons/fi";

export default function CancelSuccessModal({
    onClose,
}: {
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center z-50">
            {/* Modal */}
            <div className="bg-white w-full p-5 animate-slideUp flex flex-col justify-between pt-24">
                <div>
                    {/* Success Icon */}
                    <div className="flex flex-col items-center">
                        <div className="bg-green-500 text-white p-4 rounded-full text-2xl">
                            <FaCheck />
                        </div>

                        <h2 className="mt-4 text-lg font-semibold">
                            Booking Cancelled
                        </h2>

                        <p className="text-sm text-gray-500 text-center mt-1">
                            Your booking has been cancelled successfully.
                            Refund has been initiated
                        </p>
                    </div>

                    {/* Refund Summary */}
                    <div className="bg-[#F1F5F9] rounded-md px-4 py-3 mt-5">
                        <h3 className="text-sm font-normal mb-3">
                            Refund Summary
                        </h3>

                        <div className="flex justify-between text-sm text-[#6A6A6A]">
                            <span>Total Paid</span>
                            <span className="text-black">Rs. 400</span>
                        </div>

                        <div className="flex justify-between text-sm text-[#6A6A6A] mt-1">
                            <span>Cancellation Fee</span>
                            <span className="text-black">Rs. 10</span>
                        </div>

                        <div className="flex justify-between text-sm font-normal mt-5">
                            <span>Total Refund Amount</span>
                            <span>Rs.400</span>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="bg-[#DBEAFE] text-[#2563EB] p-3 text-xs font-medium rounded-lg mt-4 flex gap-2">
                        <FiInfo className="mt-1 size-5" />
                        <p>
                            Refund will reflect in your account within 5-7
                            Business days
                        </p>
                    </div>

                </div>

                {/* Button */}
                <button
                    onClick={onClose}
                    className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold"
                >
                    Home
                </button>
            </div>
        </div>
    );
}
