import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { useAppContext } from "../context/AppContext";
import WithdrawalModal from "../components/WithdrawalModal";
import { motion, AnimatePresence } from "framer-motion";
import TransactionDetails from "../pages/TransactionDetails";
import { FaCircleCheck } from "react-icons/fa6";
import { MdError } from "react-icons/md";

interface WithdrawalResponse {
    status: "success" | "error";
    code: number;
    message: string;
    data?: {
        withdrawn_amount: number;
        remaining_balance: number;
    };
}

type ToastType = "success" | "error" | null;

type CustomTooltipProps = {
    active?: boolean;
    payload?: { value: number }[] | null
};
const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length > 0) {
        return (
            <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold shadow">
                ₹{payload[0].value.toLocaleString()}
            </div>
        );
    }

    return null;
};

export default function VerifiedWallet() {

    const {
        walletDashboard,
        bookings,
        request

    } = useAppContext();

    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
    const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

    const pendingBookings =
        bookings?.filter((b) => b.status === "PENDING").length ?? 0;

    const balance = Number(walletDashboard?.account_balance ?? 0);
    const isWithdrawDisabled = balance <= 0;

    const navigate = useNavigate();
    const [range, setRange] = useState<"week" | "month">("week");
    const chartData = walletDashboard?.chart_data ?? [];

    const hasTransactions = (walletDashboard?.recent_activity?.length ?? 0) > 0;

    const handleWithdrawal = async (amount: string) => {
        try {
            // Send withdrawal request
            const data = await request<WithdrawalResponse>("/request-withdrawal/", {
                method: "POST",
                body: JSON.stringify({ amount }),
            });

            // If API indicates failure
            if (data.status !== "success") {
                const message = data?.message || "Failed to withdraw";
                setToast({ type: "error", message });
                return;
            }

            // ✅ Success
            setToast({
                type: "success",
                message: data?.message || "Withdrawal request submitted successfully!"
            });

            // Close modal after success
            setShowWithdrawalModal(false);

            // Reload page after 2 seconds to update balance
            setTimeout(() => window.location.reload(), 3000);

        } catch (err) {
            console.error(err);

            const message =
                err instanceof Error ? err.message : "Something went wrong. Try again later.";
            setToast({ type: "error", message });
        }
    };

    const handleToastClose = useCallback(() => {
        setToast(null);

    }, []);

    return (
        <div className="mk:bg-[#DBEAFE] min-h-[91.6vh]">
            <div className="space-y-4 mk:space-y-0 pb-14 mb-14 mk:mb-0 pt-4 px-5 mk:grid grid-cols-2 gap-10 mk:p-14 max-w-[1900px] mx-auto">

                {toast && <Toast type={toast.type} text={toast.message} onClose={handleToastClose} />}

                {/* Header */}
                <div className="mk:space-y-10">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl mk:rounded-lg px-5 py-6">
                        <div className="flex justify-between gap-6">
                            <div className="text-center bg-[#FFFFFF1A] p-3 rounded-lg space-y-1 w-full">
                                <p className="text-xs">Today's Earnings</p>
                                <h3 className="text-lg font-semibold">₹ {walletDashboard?.todays_earnings ?? "0"}</h3>
                                <p className="text-sm text-[#00FF5E]">+12%</p>
                            </div>
                            <div className="text-center bg-[#FFFFFF1A] p-3 rounded-lg space-y-1 w-full">
                                <p className="text-xs">Today's Bookings</p>
                                <h3 className="text-lg font-semibold">{walletDashboard?.todays_bookings ?? 0}</h3>
                                <p className="text-sm text-[#00FF5E]">Pending {pendingBookings}</p>
                            </div>
                        </div>

                        <div className="mt-4 text-center">
                            <p className="text-lg font-semibold text-[#F1F5F9]">Account Balance</p>
                            <h2 className="text-3xl font-bold">Rs. {balance}</h2>
                        </div>

                        <button
                            disabled={isWithdrawDisabled}
                            onClick={() => setShowWithdrawalModal(true)}
                            className={`mt-3 w-full max-w-[184px] mx-auto flex items-center justify-center px-4 py-2 rounded text-sm font-medium
                        ${isWithdrawDisabled
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-white text-blue-600 hover:bg-blue-50"
                                }`}
                        >
                            Withdraw Now
                        </button>
                    </div>

                    {/* Chart placeholder */}
                    {hasTransactions && (
                        <div className="mk:bg-white mk:rounded-lg mk:p-6 flex flex-col mk:flex-col-reverse">
                            <div className="mt-4">
                                <div className="h-[200px]">
                                    <ResponsiveContainer>
                                        <LineChart data={chartData} margin={{ top: 20, right: 10, left: -30, bottom: 0 }}>

                                            {/* GRID (dotted like design) */}
                                            <CartesianGrid
                                                strokeDasharray="4 4"
                                                vertical={false}
                                                stroke="#E5E7EB"
                                            />

                                            {/* X AXIS */}
                                            <XAxis
                                                dataKey="day"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fill: "#6B7280", fontWeight: 600 }}
                                            />

                                            {/* Y AXIS */}
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                                                tickFormatter={(v) => (v === 0 ? "0" : `${v / 1000}k`)}
                                                domain={[0, 4000]}
                                            />

                                            {/* TOOLTIP */}
                                            <Tooltip
                                                content={<CustomTooltip />}
                                                cursor={{
                                                    stroke: "#3B82F6",
                                                    strokeDasharray: "4 4",
                                                }}
                                            />

                                            {/* LINE */}
                                            <Line
                                                type="monotone"
                                                dataKey="amount"
                                                stroke="#3B82F6"
                                                strokeWidth={2.5}
                                                dot={false}
                                                activeDot={{
                                                    r: 6,
                                                    stroke: "#3B82F6",
                                                    strokeWidth: 3,
                                                    fill: "#fff",
                                                }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-6 mk:mt-0">
                                <button
                                    onClick={() => setRange("week")}
                                    className={`px-4 py-1.5 rounded-lg border font-medium text-sm ${range === "week"
                                        ? "bg-[#DBEAFE] text-[#2563EB] border-[#2563EB]"
                                        : "bg-white text-[#0F172A] border-[#CBD5E1]"
                                        }`}
                                >
                                    Past Week
                                </button>

                                <button
                                    onClick={() => setRange("month")}
                                    className={`px-4 py-1.5 rounded-lg border font-medium text-sm ${range === "month"
                                        ? "bg-[#DBEAFE] text-[#2563EB] border-[#2563EB]"
                                        : "bg-white text-[#0F172A] border-[#CBD5E1]"
                                        }`}
                                >
                                    Past Month
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="mk:bg-white mk:rounded-lg mk:p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-[#0F172A]">Recent Activity</h3>

                        {hasTransactions && (

                            <button
                                onClick={() => {
                                    navigate("/wallet/transactions")
                                    window.scrollTo(0, 0)
                                }}
                                className="text-[#0F172A] font-medium text-sm"
                            >
                                See All
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {!hasTransactions ? (
                            <div className="bg-white rounded-2xl py-10 flex flex-col items-center justify-center text-center space-y-3">
                                {/* Icon */}
                                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-6 h-6 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 14l2-2 4 4m0-6l-2-2-4 4m5-10H5a2 2 0 00-2 2v14l4-4h12a2 2 0 002-2V4a2 2 0 00-2-2z"
                                        />
                                    </svg>
                                </div>

                                {/* Text */}
                                <p className="text-sm font-semibold text-gray-700">
                                    No transactions yet
                                </p>

                                <p className="text-xs text-gray-500 max-w-[200px]">
                                    Your recent bookings and payments will appear here
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {walletDashboard?.recent_activity.slice(0, 6).map((t) => (
                                    <div
                                        key={t.id}
                                        onClick={() => {
                                            if (t.transaction_type === "WITHDRAWAL") return
                                            setSelectedTransactionId(t.id);
                                        }}
                                        className="flex justify-between bg-white py-2 rounded-xl cursor-pointer"
                                    >
                                        <div>
                                            <p className="font-medium text-sm">{t.guest_name}</p>
                                            <p className="text-xs text-[#475569]">
                                                {t.date_formatted}
                                            </p>
                                        </div>

                                        <p
                                            className={`text-base font-semibold ${t.transaction_type === "EARNING"
                                                ? "text-green-600"
                                                : "text-gray-600"
                                                }`}
                                        >
                                            {t.transaction_type === "EARNING" ? "+" : "-"}₹{t.amount}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            <WithdrawalModal
                open={showWithdrawalModal}
                balance={balance}
                onClose={() => setShowWithdrawalModal(false)}
                onSubmit={handleWithdrawal}
            />

            <AnimatePresence>
                {selectedTransactionId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex justify-center items-start mk:items-center"
                    >
                        {/* Overlay for desktop only */}
                        <div className="hidden mk:block fixed inset-0 bg-[#0C0A0AC7]" onClick={() => setSelectedTransactionId(null)}></div>

                        <TransactionDetails id={selectedTransactionId} setSelectedTransactionId={setSelectedTransactionId} />
                    </motion.div>
                )}
            </AnimatePresence>
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
            className={`mk:absolute fixed w-[350px] bottom-20 z-50 left-1/2 justify-center -translate-x-1/2
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
