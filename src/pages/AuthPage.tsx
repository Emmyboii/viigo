import email from '../assets/loginEmail.png'
import { FcGoogle } from "react-icons/fc";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";
import OTPVerification from '../components/OTPVerification';

const slides = [
  { text: <>Workout on your time</>, size: "text-6xl" },
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


const AuthPage = () => {

  const [continueClicked, setContinueClicked] = useState(false)
  const [useEmail, setUseEmail] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('+91 ')
  const [emailAddress, setEmailAddress] = useState('')

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

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

  return (
    <>
      {!continueClicked ? (
        <div className="bg-[#2563EB] overflow-x-hidden">
          <div className="relative h-[50vh] bg-[#2563EB] text-white overflow-hidden">
            {/* Slides */}
            <div ref={emblaRef} className="h-full">
              <div className="flex h-full">
                {slides.map((slide, index) => (
                  <div
                    key={index}
                    className="flex-[0_0_100%] flex items-center justify-center px-6 text-center"
                  >
                    <p className={`${slide.size} font-extrabold font-sans leading-tight`}>
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
                  type="submit"
                  title="submitBtn"
                  disabled={phoneNumber.length !== 14}
                  onClick={() => setContinueClicked(true)}
                  className={`rounded-md w-full px-2 h-[48px] text-white font-semibold text-sm ${phoneNumber.length !== 14 ? 'bg-[#94A3B8] cursor-not-allowed' : 'bg-[#2563EB] cursor-pointer'}`}
                >
                  Continue
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
                  type="submit"
                  title="submitBtn"
                  disabled={!isValidEmail(emailAddress)}
                  onClick={() => setContinueClicked(true)}
                  className={`rounded-md w-full px-2 h-[48px] text-white font-semibold text-sm ${!isValidEmail(emailAddress) ? 'bg-[#94A3B8] cursor-not-allowed' : 'bg-[#2563EB] cursor-pointer'
                    }`}
                >
                  Continue
                </button>
              </>
            )}

            <div className="flex items-center justify-center gap-4 text-[#CBD5E1] text-sm font-normal">
              <div className="w-[260px] border border-[#CBD5E1]"></div>
              <p>or</p>
              <div className="w-[260px] border border-[#CBD5E1]"></div>
            </div>

            <div className="flex items-center justify-center gap-6">
              <div
                onClick={() => setUseEmail(true)}
                className={`rounded-full border p-2.5 py-3 cursor-pointer transition ${useEmail ? 'border-blue-500 bg-blue-50' : 'border-[#E2E8F0] bg-white'
                  }`}
              >
                <img src={email} className="w-[24px] h-[20px]" alt="Email login icon" />
              </div>
              <div className="rounded-full border border-[#E2E8F0] p-2.5">
                <FcGoogle className="size-6" />
              </div>
            </div>

            <div className="text-center font-redhat">
              <p className="text-[#0F172A] text-sm font-normal">By continuing, you are agreeing to Viigo’s Terms of Service and Privacy Policy.</p>
              <p className="text-[#60A5FA] text-sm font-normal pt-2 cursor-pointer">View Terms and Conditions</p>
            </div>
          </div>
        </div>
      ) : (
        <OTPVerification />
      )}
    </>
  )
}

export default AuthPage