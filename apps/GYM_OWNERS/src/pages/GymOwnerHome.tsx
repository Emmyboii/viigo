import { useCallback, useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import Container from "../components/layout/Container";
import { MdError } from "react-icons/md";
import { FaCircleCheck } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import OtpVerificationModal from "../components/OtpVerificationModal";
import Footer from "../components/Footer";
import FilterChips from "../components/FilterChips";
import UserCard from "../components/UserCard";

type Status =
  | "idle"
  | "verifying"
  | "success"
  | "error";

type ToastType = "success" | "error" | null;

interface User {
  id: string;
  name: string;
  status: "active" | "upcoming" | "completed" | "cancelled" | "inactive";
  date: string;
  duration: string;
  remainingTime: string;
  image?: string;
}

const chipData = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

const GymOwnerHome = () => {

  const users: User[] = [
    {
      id: "1",
      name: "Prakash M",
      status: "active",
      date: "5th December",
      duration: "1.5 Hrs",
      remainingTime: "00:42 min",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: "2",
      name: "Sarah K",
      status: "upcoming",
      date: "6th December",
      duration: "2 Hrs",
      remainingTime: "09:30 PM",
    },
    {
      id: "3",
      name: "John Doe",
      status: "completed",
      date: "7th December",
      duration: "1 Hr",
      remainingTime: "00:00 min",
    },
    {
      id: "4",
      name: "Mary Ann",
      status: "active",
      date: "8th December",
      duration: "3 Hrs",
      remainingTime: "02:10 min",
    },
    {
      id: "5",
      name: "David P",
      status: "cancelled",
      date: "9th December",
      duration: "1.5 Hrs",
      remainingTime: "00:00 min",
    },
    {
      id: "6",
      name: "James L",
      status: "active",
      date: "10th December",
      duration: "2 Hrs",
      remainingTime: "01:05 min",
    },
    {
      id: "7",
      name: "Emma W",
      status: "active",
      date: "11th December",
      duration: "45 mins",
      remainingTime: "00:20 min",
    },
  ];

  const navigate = useNavigate();

  const [filter, setFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = users.filter((user) =>
    filter === "all" ? true : user.status === filter
  )

  const [otp, setOtp] = useState("");
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

  /* ---------------- Submit ---------------- */
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otp.length !== 4) return;

    // 👇 dismiss keyboard (important for mobile)
    inputRef.current?.blur();

    setStatus("verifying");

    setTimeout(() => {
      if (otp === "2345") {
        setStatus("success");

        setOtp("");

        // Navigate after toast
        setTimeout(() => {
          setStatus('idle')
          // setShowPaymentModal(true);

          setSelectedUser({
            id: "999",
            name: "Dummy Verified User",
            status: "active",
            date: "12th Feb",
            duration: "1.5 Hrs",
            remainingTime: "00:45 min",
            image: "https://randomuser.me/api/portraits/men/99.jpg"
          });
          window.scrollTo(0, 0);
        }, 3000);
      } else {
        setStatus("error");
        setToast({ type: "error", message: "Incorrect OTP. Try again." });
      }
    }, 800); // simulate API delay
  };

  const handleClose = () => {
    localStorage.removeItem("paymentSuccess");
    setSelectedUser(null)
    navigate("/");
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

  return (
    <>
      {!selectedUser && (
        <Container>
          <Header />

          {toast && <Toast type={toast.type} text={toast.message} onClose={handleToastClose} />}

          <div className="bg-[#2563EB] text-white rounded-lg p-4">
            <p className="font-semibold">Quick Checkin</p>
            <p className="text-[#CBD5E1] text-sm pt-1">
              Enter Customer’s 4 Digit OTP to start the session
            </p>

            <form onSubmit={handleSubmit} className="flex items-center gap-4 justify-between">
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
                  } w-[35%] rounded-full px-4 py-2 font-semibold text-[13px] h-[45px]`}
                disabled={otp.length !== 4 || status === "verifying"}
                type="submit">
                {status === "verifying" ? "Checking..." : "Verify"}
              </button>
            </form>
          </div>

          <div className="mt-5 mb-14">
            <h2 className="font-semibold text-base text-[#0F172A]">Bookings</h2>

            <FilterChips
              items={chipData}
              activeId={filter}
              onChange={(id) => setFilter(id)}
            />

            <div className="py-5 space-y-4">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  name={user.name}
                  status={user.status}
                  date={user.date}
                  duration={user.duration}
                  remainingTime={user.remainingTime}
                  image={user.image}
                  onClick={() => setSelectedUser(user)}
                />
              ))}
            </div>
          </div>

          <Footer />

          {/* Success Modal */}
          <AnimatePresence>
            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-white text-black z-50 flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="p-8 w-80 text-center"
                >
                  <FaCheckCircle className="text-green-500 text-[80px] mx-auto mb-3" />
                  <h2 className="text-lg font-semibold mb-2">
                    OTP Verified
                  </h2>
                  <p className="text-sm font-normal text-[#475569]">
                    Booking ID #37272 has been verified and the session has started
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      )}

      <AnimatePresence>
        {selectedUser && (
          <OtpVerificationModal
            user={selectedUser}
            onClose={handleClose}
          />
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