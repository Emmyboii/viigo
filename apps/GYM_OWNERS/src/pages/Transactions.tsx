import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { FiArrowLeft, FiSearch } from "react-icons/fi";
import { BiSort } from "react-icons/bi";
import Header from "../components/Header";
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from "react-icons/md";
import TransactionDetails from "./TransactionDetails";
import { motion, AnimatePresence } from "framer-motion";

type FilterType = "all" | "booking" | "refund";

const Transactions = () => {
  const navigate = useNavigate();
  const { walletTransactions } = useAppContext();
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
  const entriesPerPage = 10;

  const filters: FilterType[] = ["all", "booking", "refund"];

  const formatAmount = (
    amount: number | string,
    type?: "EARNING" | "REFUND" | "WITHDRAWAL"
  ) => {
    const amt = typeof amount === "string" ? Number(amount) : amount;

    // Force withdrawal to always be negative
    if (type === "WITHDRAWAL" || type === "REFUND") {
      return `-₹${Math.abs(amt)}`;
    }

    return `${amt > 0 ? "+" : "-"}₹${Math.abs(amt)}`;
  };

  const getVisiblePages = () => {
    const pages = [];

    let start = Math.max(currentPage - 1, 1);
    let end = start + 2;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(end - 2, 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  // Use context data if available, otherwise dummy
  const transactionsArray = Array.isArray(walletTransactions)
    ? walletTransactions
    : [];

  // Filter by type
  const filteredTransactions = transactionsArray.filter((t) => {
    if (typeFilter === "all") return true;
    if (typeFilter === "booking") return t.transaction_type === "EARNING";
    if (typeFilter === "refund") return t.transaction_type === "REFUND";
    return true;
  });

  // Filter by search term
  const searchedTransactions = filteredTransactions.filter((t) =>
    t.guest_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEntries = searchedTransactions.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentEntries = searchedTransactions.slice(
    startIndex,
    startIndex + entriesPerPage
  );

  const hasTransactions = currentEntries.length > 0;

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
    <div className="">
      {/* Header */}
      <div className="flex mk:hidden items-center gap-3 mb-6 p-4 mk:p-8">
        <button title="back" onClick={() => navigate(-1)}>
          <FiArrowLeft />
        </button>
        <h2 className="font-semibold text-lg mk:text-2xl">Transaction History</h2>
      </div>

      <div className="mk:block hidden">
        <Header />
      </div>

      {/* SEARCH + FILTER + SORT for desktop */}
      <div className="hidden mk:flex lg:flex-row flex-col lg:items-center justify-between gap-3 p-4 lg:p-8">
        {/* Search */}
        <div className="flex items-center border border-[#CBD5E1] rounded-lg px-3 py-1 2xl:w-[70%] lg:w-[55%] h-[50px]">
          <FiSearch className="text-[#0F172A] mr-2" />
          <input
            type="text"
            placeholder="Search by name, status..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full outline-none text-sm text-[#0F172A] placeholder:text-[#0F172A]"
          />
        </div>

        {/* Filters + Sort */}
        <div className="flex gap-2 items-center lg:mt-0 mt-2">
          <button className="flex items-center gap-1 px-3 py-1.5 border rounded-lg bg-[#F1F5F9] font-medium border-[#CBD5E1] text-gray-700 text-xs">
            <BiSort /> Sort By
          </button>
          {filters.map((type) => (
            <button
              key={type}
              onClick={() => {
                setTypeFilter(type);
                setCurrentPage(1);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium border capitalize ${typeFilter === type
                ? "bg-[#DBEAFE] text-[#2563EB] border-[#2563EB]"
                : "bg-white text-[#0F172A] border-[#CBD5E1]"
                }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="flex mk:hidden mb-5 gap-2 items-center px-4">
        {filters.map((type) => (
          <button
            key={type}
            onClick={() => {
              setTypeFilter(type);
              setCurrentPage(1);
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium border capitalize ${typeFilter === type
              ? "bg-[#DBEAFE] text-[#2563EB] border-[#2563EB]"
              : "bg-white text-[#0F172A] border-[#CBD5E1]"
              }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* MOBILE CARD LIST */}
      <div className="space-y-3 mk:hidden p-4 lg:p-8">
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
            <p className="text-sm font-semibold text-gray-700">{getEmptyText(typeFilter)}</p>
            <p className="text-xs text-gray-500 max-w-[200px]">Filtered results will appear here</p>
          </div>
        ) : (
          currentEntries.map((t) => (
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
                <p className="text-xs text-[#475569]">{t.date_formatted}</p>
              </div>
              <p
                className={`text-sm font-semibold ${t.transaction_type === "EARNING" ? "text-green-600" : "text-gray-600"
                  }`}
              >
                {formatAmount(t.amount, t.transaction_type)}
              </p>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden mk:block overflow-x-auto bg-white px-4 lg:px-8">

        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold text-base">All Transactions</h2>
          {/* <button className="text-sm text-[#0F172A] flex items-center gap-1">
            See All
          </button> */}
        </div>

        <table className="min-w-full table-auto">
          <thead className="bg-[#F1F5F9] text-gray-700">
            <tr className="text-sm text-[#475569] font-semibold">
              <th className="text-left lg:px-8 px-4 py-5">Customer</th>
              <th className="text-left lg:px-8 px-4 py-5">Transaction ID</th>
              <th className="text-left lg:px-8 px-4 py-5">Date & Time</th>
              <th className="text-left lg:px-8 px-4 py-5">Status</th>
              <th className="text-right lg:px-8 px-4 py-5">Amount</th>
            </tr>
          </thead>
          <tbody className="border border-[#CBD5E1]">
            {currentEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              currentEntries.map((t) => (
                <tr
                  key={t.id}
                  className="border-b hover:bg-gray-50 cursor-pointer lg:font-semibold font-medium text-[#0F172A]"
                  onClick={() => {
                    if (t.transaction_type === "WITHDRAWAL") return
                    setSelectedTransactionId(t.id);
                  }}
                >
                  <td className="space-y-1 lg:px-8 px-4 pt-8 pb-2">
                    <p className="">{t.guest_name}</p>
                    <p className="">{t.booking_hours}</p>
                  </td>
                  <td className="lg:px-8 px-4 pt-8 pb-2">{t.transaction_id}</td>
                  <td className="space-y-0.5 lg:px-8 px-4 pt-8 pb-2 ">
                    <p className="">{t.date_formatted.split(" • ")[0]}</p>
                    <p className="">{t.date_formatted.split(" • ")[1]}</p>
                  </td>
                  <td className="lg:px-8 px-4 pt-8 pb-2">
                    <p
                      className={`px-2 py-2 rounded-full w-[110px] text-center text-xs font-semibold ${t.transaction_type === "EARNING"
                        ? "bg-[#22C55E] text-[#ffffff]"
                        : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {t.transaction_type}
                    </p>
                  </td>
                  <td className="lg:px-8 px-4 pt-8 pb-2 text-right font-semibold">{formatAmount(t.amount, t.transaction_type)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-wrap mk:flex-nowrap items-center mb-20 sp:justify-between justify-center mt-4 text-sm text-[#0F172A] font-medium p-4 gap-4 mk:px-8 mk:pb-8">
        <div>
          Showing {startIndex + 1} to {Math.min(startIndex + entriesPerPage, totalEntries)} of{" "}
          {totalEntries} entries
        </div>

        <div className="flex gap-2 mt-2 mk:mt-0 items-center">
          {/* Prev */}
          <button
            title="prev"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-2 py-1.5 border rounded-lg disabled:opacity-50 text-lg"
          >
            <MdOutlineKeyboardArrowLeft />
          </button>

          {/* Page Numbers */}
          {getVisiblePages().map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded-lg border ${currentPage === page
                ? "bg-[#2563EB] text-white border-[#2563EB]"
                : "bg-white text-gray-700 border-[#CBD5E1]"
                }`}
            >
              {page}
            </button>
          ))}

          {/* Next */}
          <button
            title="next"
            onClick={() => setCurrentPage((p) =>
              Math.min(p + 1, totalPages)
            )}
            disabled={currentPage === totalPages}
            className="px-2 py-1.5 border rounded-lg disabled:opacity-50 text-lg"
          >
            <MdOutlineKeyboardArrowRight />
          </button>
        </div>
      </div>

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
};

export default Transactions;