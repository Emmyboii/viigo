import { useCallback, useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import { MdError } from "react-icons/md";
import { FaCircleCheck } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import OtpVerificationModal from "../components/OtpVerificationModal";

import FilterChips from "../components/FilterChips";
import UserCard from "../components/UserCard";
import { useAppContext, type Booking } from "../context/AppContext";

type Status =
  | "idle"
  | "verifying"
  | "success"
  | "error";

type ToastType = "success" | "error" | null;

const chipData = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

const GymOwnerHome = () => {


  const { bookings, isLoading } = useAppContext()

  const [filter, setFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<Booking | null>(null);

  // const filteredUsers = bookings.filter((user) =>
  //   filter === "all" ? true : user.status === filter
  // )

  const filteredBookings = bookings.filter((b) => {

    if (b.status === "PENDING") return false;

    switch (filter) {
      case "upcoming":
        return b.status === "CONFIRMED";
      case "active":
        return b.status === "ACTIVE";
      case "cancelled":
        return b.status === "CANCELLED";
      case "completed":
        return b.status === "COMPLETED";
      case "all":
      default:
        return true;
    }
  });

  const [otp, setOtp] = useState("");
  const [checked, setChecked] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);


  /* ---------------- Handle Input ---------------- */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;

    // Reset status when user types again
    if (status === "error" || status === "success") {
      setStatus("idle");
    }

    // Allow only numbers and max 4 digits
    value = value.replace(/\D/g, "").slice(0, 4);
    setOtp(value);
  };

  type ModalType = "user" | "success";

  const openModal = (type: ModalType, booking?: Booking) => {
    if (type === "user" && booking) {
      setSelectedUser(booking);
    }

    if (type === "success") {
      setStatus("success");
    }

    window.history.pushState({ modal: type }, "");
  };

  const closeModal = (type: ModalType) => {
    if (type === "user") setSelectedUser(null);
    if (type === "success") setStatus("idle");

    if (window.history.state?.modal === type) {
      window.history.back();
    }
  };

  /* ---------------- Submit ---------------- */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (otp.length !== 4) return;

    inputRef.current?.blur();
    setStatus("verifying");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/gymowner/check-in/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp }),
      });

      const data = await res.json();

      if (!res.ok) {

        const message =
          data?.data?.message?.[0] || data?.data.error || "Invalid OTP, or no confirmed booking found for today.";

        // Show toast for 3 seconds
        setToast({ type: "error", message });
        setStatus("idle");

        // Auto-hide toast after 3 seconds
        setTimeout(() => setToast(null), 2000);
        return;
      }

      // ✅ SUCCESS
      openModal("success");
      setOtp("");

      // Optional: show success toast
      setToast({ type: "success", message: "Check-in successful!" });

      // 👉 If API returns booking/user, use it
      if (data?.data?.user_id) {
        const bookingId = data.data.user_id;

        const matchedBooking = bookings.find(
          (b) => b.id === bookingId
        );

        if (matchedBooking) {
          setSelectedUser(matchedBooking);
        }
      }

      // ✅ auto close success modal after 2 seconds
      setTimeout(() => {
        closeModal("success");
      }, 2000);

      // Scroll to top
      window.scrollTo(0, 0);
      setChecked(true);

    } catch (err: unknown) {
      console.error(err);

      setStatus("error");

      let message = "OTP verification failed";

      if (err instanceof Error) {
        message = err.message;
      }

      setToast({
        type: "error",
        message,
      });
    }
  };

  const handleClose = () => {
    localStorage.removeItem("paymentSuccess");
    closeModal("success");
    closeModal("user");

    if (checked) {
      window.location.reload();
    }
  };

  /* ---------------- Toast Close ---------------- */
  const handleToastClose = useCallback(() => {
    setToast(null);
  }, []);

  /* ---------------- Styles ---------------- */
  const borderColor =
    status === "success"
      ? "border-green-500"
      : status === "error"
        ? "border-red-500"
        : "border-[#CBD5E1]";

  const textColor =
    status === "success"
      ? "text-green-500"
      : status === "error"
        ? "text-red-500"
        : "text-[#CBD5E1]";

  useEffect(() => {
    const handlePopState = () => {
      if (window.history.state?.modal === "success") {
        setStatus("idle");
      } else if (window.history.state?.modal === "user") {
        setSelectedUser(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [status, selectedUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4 p-8 bg-white animate-fadeIn">
          <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-700 text-lg font-medium">
            Fetching your booking details...
          </p>
          <p className="text-gray-400 text-sm text-center">
            This might take a few seconds. Sit tight!
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* {!selectedUser && ( */}
      <div className={`min-h-screen py-4 relative mk:max-w-[1900px] w-screen mk:w-full mk:mx-auto ${!selectedUser && "mk:block"}`}>
        <Header />

        {toast && <Toast type={toast.type} text={toast.message} onClose={handleToastClose} />}

        <div className="bg-[#2563EB] text-white rounded-lg p-4 mk:flex justify-between mx-5 mt-4">
          <div>
            <p className="font-semibold">Quick Checkin</p>
            <p className="text-[#CBD5E1] text-sm pt-1">
              Enter Customer’s 4 Digit OTP to start the session
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-4 justify-between mk:w-[250px]">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              onChange={handleChange}
              className={`mt-2 w-[65%] bg-transparent rounded-lg px-4 border ${borderColor} outline-none h-[45px] ${textColor} font-bold text-2xl`}
              placeholder="OTP"
            />

            <button
              className={`${otp.length === 4
                ? "bg-white text-[#2563EB]"
                : "bg-[#F1F5F9] text-[#94A3B8]"
                } w-[35%] rounded-full px-4 py-2 font-semibold text-[14px] h-[45px]`}
              disabled={otp.length !== 4 || status === "verifying"}
              type="submit">
              {status === "verifying" ? "Checking..." : "Verify"}
            </button>
          </form>
        </div>

        <div className="mt-5 mb-14 px-5">
          <h2 className="font-semibold text-base text-[#0F172A]">Bookings</h2>

          <FilterChips
            items={chipData}
            activeId={filter}
            onChange={(id) => setFilter(id)}
          />

          {filteredBookings.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              No "{chipData.find(c => c.id === filter)?.label}" Booking yet.
            </div>
          ) : (
            <div className="py-5 space-y-4">
              {filteredBookings.map((book) => (
                <UserCard
                  key={book.id}
                  booking={book}
                  onClick={() => openModal("user", book)}
                />
              ))}
            </div>
          )}

        </div>

        {status === 'success' && (
          <div className="hidden mk:block fixed inset-0 z-[90] bg-[#0C0A0AC7]"></div>
        )}



        {/* Success Modal */}
        <AnimatePresence>
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed z-[99] flex items-center justify-center bg-white overflow-y-auto inset-0 mk:inset-auto mk:right-0 mk:top-0 mk:min-h-screen mk:w-[480px] p-5 animate-slideUp mk:animate-slideRight"
            >

              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="p-8 w-80 text-center"
              >
                <FaCheckCircle className="text-green-500 text-[80px] mx-auto mb-2" />
                <h2 className="text-lg text-[#0F172A] font-semibold mb-2">
                  OTP Verified
                </h2>
                <p className="text-sm font-normal text-[#475569]">
                  Booking ID #{selectedUser?.id} has been verified and the session has started
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* )} */}

      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-center items-start mk:items-center"
          >
            {/* Overlay for desktop only */}
            <div className="hidden mk:block fixed inset-0 bg-[#0C0A0AC7]" onClick={handleClose}></div>

            <OtpVerificationModal
              user={selectedUser}
              onClose={() => {
                closeModal("user")
                window.location.reload()
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GymOwnerHome;

/* ================= Toast ================= */

function Toast({
  text,
  type,
  onClose,
}: {
  text: string;
  type: ToastType;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === "success";

  return (
    <div
      className={`fixed z-50 w-[280px] bottom-20 left-1/2 -translate-x-1/2 
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