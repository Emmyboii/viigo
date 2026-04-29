import email from '../assets/loginEmail.png'
import { FcGoogle } from "react-icons/fc";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPhoneAlt } from 'react-icons/fa';
import { MdError } from 'react-icons/md';
import { FaCircleCheck } from 'react-icons/fa6';
import { useGoogleLogin } from "@react-oauth/google";

declare global {
  interface Window {
    google: any;
  }
}

const slides = [
  { text: <>Workout on your Hour</>, size: "text-6xl" },
  {
    text: (
      <>
        Pick a Gym. Choose Hours.<br />
        Start Training
      </>
    ),
    size: "text-5xl"
  },
  { text: <>Pay Only for What You Use</>, size: "text-6xl" },
];

type ToastType = "success" | "error" | "validating" | null;

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
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isPhoneValid = phoneNumber.length === 14;
  const isEmailValid = isValidEmail(emailAddress);
  const isFormValid = useEmail ? isEmailValid : isPhoneValid;


  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Remove +91 and spaces at the start, keep only digits
    let digitsOnly = value.replace(/^(\+91\s?)/, "").replace(/\D/g, "");

    // Limit to 10 digits
    if (digitsOnly.length > 10) digitsOnly = digitsOnly.slice(0, 10);

    // Set value with +91 and a space
    setPhoneNumber(`+91 ${digitsOnly}`);
  };

  const checkOnboardingAndRedirect = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${backendUrl}/api/onboarding/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data?.data?.is_completed) {
        window.location.reload()
        navigate("/");
      } else {
        navigate("/onboarding");
      }
    } catch (err) {
      console.error("Failed to check onboarding:", err);
      navigate("/onboarding"); // fallback
    }
  };

  const handleContinue = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    if (!useEmail && phoneNumber.length !== 14) return;
    if (useEmail && !isValidEmail(emailAddress)) return;

    setIsLoading(true);
    // Show "validating credentials" while OTP request is running
    setToast({ type: "validating", message: "Validating credentials..." });

    try {
      const payload = { identifier: useEmail ? emailAddress : phoneNumber };

      const tempData = JSON.parse(localStorage.getItem("tempIdentifier") || "{}");

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
        const message =
          data?.data?.identifier?.[0] || data?.message || "Something went wrong";

        setToast({ type: "error", message });
        setTimeout(() => setToast(null), 2000);
        return;
      }

      setToast({ type: "success", message: data.message || "OTP sent successfully" });
      localStorage.setItem("tempIdentifier", JSON.stringify(tempData));

      setTimeout(() => {
        setToast(null);
        navigate("/validateotp");
      }, 2000);

    } catch (err: any) {
      setToast({ type: "error", message: err.message || "Something went wrong" });
      setTimeout(() => setToast(null), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // Show immediately when user returns from Google account picker
      setToast({ type: "validating", message: "Validating credentials..." });

      try {
        const response = await fetch(`${backendUrl}/auth/google/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            access_token: tokenResponse.access_token,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setToast({ type: "error", message: data.message || "Google login failed" });
          setTimeout(() => setToast(null), 2000);
          return;
        }

        localStorage.setItem("token", data.data?.access);
        localStorage.setItem("tokenTimestamp", Date.now().toString());

        // Only now swap to success — stays until checkOnboardingAndRedirect completes
        setToast({ type: "success", message: "Login successful" });

        setTimeout(async () => {
          await checkOnboardingAndRedirect(); // await so toast stays until redirect
          setToast(null);
        }, 1500);

      } catch (error: any) {
        setToast({ type: "error", message: error.message });
        setTimeout(() => setToast(null), 2000);
      }
    },
    onError: () => {
      setToast({ type: "error", message: "Google login failed" });
      setTimeout(() => setToast(null), 2000);
    },
  });

  const handleToastClose = useCallback(() => {
    setToast(null);
  }, []);


  return (
    <div className="bg-[#2563EB] overflow-x-hidden">
      <div className="relative h-[50vh] bg-[#2563EB] max-w-[1300px] mx-auto text-white overflow-hidden">
        {/* Slides */}
        <div ref={emblaRef} className="h-full">
          <div className="flex h-full">
            {slides.map((slide, index) => (
              <div
                key={index}
                className="flex-[0_0_100%] flex items-center justify-center px-6 text-center"
              >
                <p className={`${slide.size} font-black font-heading leading-tight`}>
                  {slide.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-3">
          {slides.map((_, i) => (
            <button
              title={`dot-${i}`}
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-3 w-3 rounded-full transition ${i === selectedIndex ? "bg-white" : "bg-slate-400"
                }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-t-3xl h-1/2 p-5 space-y-6">
        {toast && (
          <>
            {toast.type === "validating" && (
              <div className="fixed inset-0 bg-black/50 z-40" />
            )}
            <Toast type={toast.type} text={toast.message} onClose={handleToastClose} />
          </>
        )}
        <p className="font-semibold text-lg max-w-[1300px] mx-auto">Login or signup Viigo to Book <br /> Workouts on hourly basis </p>

        {!useEmail ? (
          <form onSubmit={handleContinue} className='max-w-[1300px] mx-auto'>
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
              type="submit"
              disabled={isLoading || !isFormValid}
              className={`rounded-md w-full mt-4 px-2 h-[48px] text-white font-semibold text-sm ${isLoading || !isFormValid
                ? "bg-[#94A3B8] cursor-not-allowed"
                : "bg-[#2563EB] cursor-pointer"
                }`}
            >
              {isLoading ? "Loading..." : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleContinue} className='max-w-[1300px] mx-auto'>
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
              <p className="text-[#475569] absolute top-2 left-4 text-xs font-normal">Enter Email ID</p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className={`rounded-md w-full mt-4 px-2 h-[48px] text-white font-semibold text-sm ${isLoading || !isFormValid
                ? "bg-[#94A3B8] cursor-not-allowed"
                : "bg-[#2563EB] cursor-pointer"
                }`}
            >
              {isLoading ? "Loading..." : "Continue"}
            </button>
          </form>
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
          <div
            onClick={() => {
              loginWithGoogle()
              setToast({ type: "validating", message: "Validating credentials..." });
            }}
            className="rounded-full border border-[#E2E8F0] p-2.5 cursor-pointer hover:shadow-md transition"
          >
            <FcGoogle className="size-6" />
          </div>
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

function Toast({ text, type, onClose }: { text: string; type: ToastType; onClose: () => void }) {
  useEffect(() => {
    if (type === "validating") return;

    const timer = setTimeout(() => {
      onClose();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onClose, type]);

  if (!type) return null;

  const isSuccess = type === "success";
  const isValidating = type === "validating";

  if (isValidating) {
    return (
      <div
        role="alert"
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div className="bg-white px-6 py-5 rounded-xl flex items-center gap-3 shadow-xl animate-[fadeIn_0.2s_ease-out]">
          <span className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin flex-shrink-0" />
          <p className="text-sm font-medium">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="fixed w-[280px] bottom-10 z-50 left-1/2 -translate-x-1/2 
      bg-white px-4 py-3 rounded-lg flex items-center gap-3
      shadow-[0_10px_40px_rgba(0,0,0,0.18)] animate-[fadeIn_0.2s_ease-out]"
    >
      <span className={`text-xl flex-shrink-0 ${isSuccess ? "text-green-500" : "text-red-500"}`}>
        {isSuccess ? <FaCircleCheck /> : <MdError />}
      </span>
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
}