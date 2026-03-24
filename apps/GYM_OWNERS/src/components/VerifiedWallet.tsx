import { useNavigate } from "react-router-dom";
import { useState } from "react";
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

    const { walletDashboard, bookings, request } = useAppContext();
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);

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
            await request("/request-withdrawal", {
                method: "POST",
                body: JSON.stringify({
                    amount: amount
                }),
            });

            alert("Withdrawal request submitted successfully");

        } catch (err) {
            console.error(err);
            alert("Failed to submit withdrawal request");
        }
    };

    return (
        <div className="space-y-4 mb-14">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl px-5 py-6">
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
                    disabled={!isWithdrawDisabled}
                    onClick={() => setShowWithdrawalModal(true)}
                    className={`mt-3 w-full max-w-[184px] mx-auto flex items-center justify-center px-4 py-2 rounded text-sm font-medium
                        ${!isWithdrawDisabled
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-white text-blue-600 hover:bg-blue-50"
                        }`}
                >
                    Withdraw Now
                </button>
            </div>

            {/* Chart placeholder */}
            {hasTransactions && (
                <div>
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
                                        dataKey="date"
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

                    <div className="flex gap-2 mt-6">
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

            {/* Recent Activity */}
            <div>
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
                                        navigate(`/wallet/transactions/${t.id}`);
                                        window.scrollTo(0, 0);
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

            <WithdrawalModal
                open={showWithdrawalModal}
                balance={balance}
                onClose={() => setShowWithdrawalModal(false)}
                onSubmit={handleWithdrawal}
            />
        </div>
    );
}
