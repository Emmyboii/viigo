import email from '../assets/loginEmail.png'
import login from '../assets/loginIng.png'
// import { FcGoogle } from "react-icons/fc";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPhoneAlt } from 'react-icons/fa';
import { MdError } from 'react-icons/md';
import { FaCircleCheck } from 'react-icons/fa6';

type ToastType = "success" | "error" | null;

const AuthPage = () => {

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [useEmail, setUseEmail] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('+91 ')
  const [emailAddress, setEmailAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  useEffect(() => {
    const tempIdentifierStr = localStorage.getItem("tempIdentifier");
    if (!tempIdentifierStr) {
      navigate("/login");
      return;
    }

    const tempIdentifier = JSON.parse(tempIdentifierStr);

    if (tempIdentifier.Email) {
      setEmailAddress(`${tempIdentifier.Email}`);
      setUseEmail(true);
    } else if (tempIdentifier.Phone) {
      setPhoneNumber(`${tempIdentifier.Phone}`);
      setUseEmail(false);
    }
  }, [navigate]);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isPhoneValid = phoneNumber.length === 14;
  const isEmailValid = isValidEmail(emailAddress);
  const isFormValid = useEmail ? isEmailValid : isPhoneValid;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Remove +91 and spaces at the start, keep only digits
    let digitsOnly = value.replace(/^(\+91\s?)/, "").replace(/\D/g, "");

    // Limit to 10 digits
    if (digitsOnly.length > 10) digitsOnly = digitsOnly.slice(0, 10);

    // Set value with +91 and a space
    setPhoneNumber(`+91 ${digitsOnly}`);
  };

  const handleContinue = async () => {
    if (!useEmail && phoneNumber.length !== 14) return;
    if (useEmail && !isValidEmail(emailAddress)) return;

    setIsLoading(true);

    try {
      const payload = { identifier: useEmail ? emailAddress : phoneNumber };

      // Retrieve existing storage or start fresh
      const tempData = JSON.parse(localStorage.getItem("tempIdentifier") || "{}");

      // Set new value dynamically
      if (useEmail) {
        tempData["Email"] = payload.identifier;
      } else {
        tempData["Phone"] = payload.identifier;
      }

      const response = await fetch(`${backendUrl}/api/auth/otp/request/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Get backend error message
        const message =
          data?.data?.identifier?.[0] || data?.message || "Something went wrong";

        // Show toast for 3 seconds
        setToast({ type: "error", message });

        // Auto-hide toast after 3 seconds
        setTimeout(() => setToast(null), 2000);
        return; // stop here, don’t navigate
      }

      // Success: show toast first
      setToast({ type: "success", message: data.message || "OTP sent successfully" });
      localStorage.setItem("tempIdentifier", JSON.stringify(tempData));

      // Wait 3 seconds before navigating
      setTimeout(() => {
        setToast(null);
        navigate("/validateotp");
      }, 2000);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setToast({ type: "error", message });
      setTimeout(() => setToast(null), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#ffffff] overflow-x-hidden">
      <div className="relative h-[50vh] bg-[#ffffff] text-white overflow-hidden">
        <img src={login} alt="Login background" className="w-full h-full object-cover" />
      </div>

      <div className="bg-white rounded-t-3xl h-1/2 p-5 space-y-6">
        {toast && <Toast type={toast.type} text={toast.message} />}

        <p className="font-semibold text-lg">Login or signup Viigo to Book <br /> Workouts on hourly basis </p>

        {!useEmail ? (
          <>
            <div className="relative">
              <input
                type="text"
                name=""
                id=""
                value={phoneNumber}
                onChange={handleChange}
                title="number"
                className="border border-[#475569] text-[#0F172A] text-sm w-full rounded-lg py-2 px-4 outline-none pt-7"
              />
              <p className="text-[#475569] absolute top-2 left-4 text-xs font-normal">10 Digit Phone Number</p>
            </div>

            <button
              type="button"
              disabled={isLoading || !isFormValid}
              onClick={handleContinue}
              className={`rounded-md w-full px-2 h-[48px] text-white font-semibold text-sm ${isLoading || !isFormValid
                ? "bg-[#94A3B8] cursor-not-allowed"
                : "bg-[#2563EB] cursor-pointer"
                }`}
            >
              {isLoading ? "Loading..." : "Continue"}
            </button>
          </>
        ) : (
          <>
            <div className="relative">
              <input
                type="email"
                name=""
                id=""
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                title="email"
                className="border border-[#475569] text-[#0F172A] text-sm w-full rounded-lg py-2 px-4 outline-none pt-7"
              />
              <p className="text-[#475569] absolute top-2 left-4 text-xs font-normal">Enter Email Address</p>
            </div>

            <button
              type="button"
              disabled={isLoading || !isFormValid}
              onClick={handleContinue}
              className={`rounded-md w-full px-2 h-[48px] text-white font-semibold text-sm ${isLoading || !isFormValid
                ? "bg-[#94A3B8] cursor-not-allowed"
                : "bg-[#2563EB] cursor-pointer"
                }`}
            >
              {isLoading ? "Loading..." : "Continue"}
            </button>
          </>
        )}

        <div className="flex items-center justify-center gap-4 text-[#CBD5E1] text-sm font-normal">
          <div className="w-[260px] border border-[#CBD5E1]"></div>
          <p>or</p>
          <div className="w-[260px] border border-[#CBD5E1]"></div>
        </div>

        <div className="flex items-center justify-center gap-6">
          {useEmail ? (
            <div
              onClick={() => setUseEmail(false)}
              className={`rounded-full border p-2.5 py-3 cursor-pointer transition border-[#E2E8F0] bg-white`}
            >
              <FaPhoneAlt className="w-[24px] h-[20px] text-[#94A3B8]" />
            </div>
          ) : (
            <div
              onClick={() => setUseEmail(true)}
              className={`rounded-full border p-2.5 py-3 cursor-pointer transition border-[#E2E8F0] bg-white`}
            >
              <img src={email} className="w-[24px] h-[20px]" alt="Email login icon" />
            </div>
          )}
          {/* <div className="rounded-full border border-[#E2E8F0] p-2.5">
            <FcGoogle className="size-6" />
          </div> */}
        </div>

        <div className="text-center font-redhat">
          <p className="text-[#0F172A] text-sm font-normal">By continuing, you are agreeing to Viigo’s Terms of Service and Privacy Policy.</p>
          <p className="text-[#60A5FA] text-sm font-normal pt-2 cursor-pointer">View Terms and Conditions</p>
        </div>
      </div>
    </div>
  )
}

export default AuthPage

function Toast({ text, type }: { text: string; type: ToastType }) {

  if (!type) return null;

  const isSuccess = type === "success";

  return (
    <div
      role="alert"
      className={`fixed w-[280px] bottom-10 z-50 left-1/2 justify-center -translate-x-1/2 
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