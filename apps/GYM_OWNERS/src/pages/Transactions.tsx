import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { FiArrowLeft } from "react-icons/fi";

type FilterType = "all" | "booking" | "refund";

const Transactions = () => {
  const navigate = useNavigate();
  const { walletTransactions } = useAppContext();
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");

  const filters: FilterType[] = ["all", "booking", "refund"];

  const formatAmount = (amountStr: string) => {
    const amount = Number(amountStr);
    return `${amount > 0 ? "+" : "-"}₹${Math.abs(amount)}`;
  };

 const transactionsArray = Array.isArray(walletTransactions) ? walletTransactions : [];

const filteredTransactions = transactionsArray.filter((t) => {
    if (typeFilter === "all") return true;
    if (typeFilter === "booking") return t.transaction_type === "EARNING";
    if (typeFilter === "refund") return t.transaction_type === "REFUND";
    return true;
});

  const hasTransactions = filteredTransactions.length > 0;

  const getEmptyText = (filter: FilterType) => {
    switch (filter) {
      case "booking":
        return "No booking transactions found";
      case "refund":
        return "No refund transactions found";
      case "all":
      default:
        return "No transactions found";
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <button title="back" onClick={() => navigate(-1)}>
          <FiArrowLeft />
        </button>
        <h2 className="font-semibold text-lg">Transaction History</h2>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-4 py-1.5 rounded-lg text-sm border capitalize ${
              typeFilter === type
                ? "bg-[#DBEAFE] text-[#2563EB] border-[#2563EB]"
                : "bg-white text-[#0F172A] border-[#CBD5E1]"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* List or Empty State */}
      <div className="space-y-3 mt-7">
        {!hasTransactions ? (
          <div className="bg-white rounded-2xl py-10 flex flex-col items-center justify-center text-center space-y-3">
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

            <p className="text-sm font-semibold text-gray-700">
              {getEmptyText(typeFilter)}
            </p>
            <p className="text-xs text-gray-500 max-w-[200px]">
              Filtered results will appear here
            </p>
          </div>
        ) : (
          filteredTransactions.map((t) => (
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
                <p className="text-xs text-gray-500">{t.date_formatted}</p>
              </div>
              <p
                className={`text-sm font-semibold ${
                  t.transaction_type === "EARNING" ? "text-green-600" : "text-gray-600"
                }`}
              >
                {formatAmount(t.amount)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Transactions;