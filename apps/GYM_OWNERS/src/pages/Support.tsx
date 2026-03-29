import { FiArrowLeft } from "react-icons/fi"
import { HiShare } from "react-icons/hi"
// import { useNavigate } from "react-router-dom";
import { MdEmail, MdKeyboardArrowRight } from "react-icons/md";
import logoUrl from "../assets/icon2.png";
// import * as htmlToImage from "html-to-image";
import Footer from "../components/Footer";
import { snapdom } from "@zumer/snapdom";

const companyEmail = "Support@viigo.in";

const Support = ({ setSupport }: { setSupport: (value: boolean) => void }) => {

    // const navigate = useNavigate();

    const handleEmailClick = () => {
        window.location.href = `mailto:${companyEmail}`;
    };

    const handleShare = async () => {
        const element = document.getElementById("share-area");
        const bottomBar = document.getElementById("share-bottom-bar");

        if (!element) return;


        try {
            await document.fonts.ready;

            // 🧠 SNAPDOM (replaces html-to-image)
            const canvasEl = await snapdom.toCanvas(element, {
                scale: 2, // similar to pixelRatio
                backgroundColor: "#ffffff",
            });

            const baseImage = new Image();
            baseImage.src = canvasEl.toDataURL("image/png");

            await new Promise((res) => {
                baseImage.onload = res;
            });

            // 🎨 FINAL CANVAS
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Adjust header height dynamically if needed
            const headerHeight = 150 * 3; // taller header for bigger logo/text

            canvas.width = baseImage.width;
            canvas.height = baseImage.height + headerHeight;

            // 🔷 Gradient header
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, "#2563EB");
            gradient.addColorStop(1, "#3B82F6");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, headerHeight);

            // 🧠 Logo
            const logo = new Image();
            logo.crossOrigin = "anonymous";
            logo.src = logoUrl;
            await new Promise((res) => { logo.onload = res; logo.onerror = res; });

            // Scale logo bigger
            const logoHeight = 80 * 3; // bigger than before
            const logoWidth = logoHeight * (logo.width / logo.height);

            // 🧠 Text
            const text = "Viigo";
            ctx.font = `bold ${70 * 3}px sans-serif`; // larger font
            ctx.fillStyle = "#fff";

            // Center logo + text horizontally
            const textWidth = ctx.measureText(text).width;
            const gap = 20;
            const totalWidth = logoWidth + gap + textWidth;
            const startX = (canvas.width - totalWidth) / 2;

            // Draw logo
            ctx.drawImage(
                logo,
                startX,
                (headerHeight - logoHeight) / 2, // vertically center
                logoWidth,
                logoHeight
            );

            // Draw text vertically centered
            ctx.textBaseline = "middle";
            ctx.fillText(
                text,
                startX + logoWidth + gap,
                headerHeight / 2
            );

            // 🖼 Draw main content
            ctx.drawImage(baseImage, 0, headerHeight);

            // 📦 Export
            const finalUrl = canvas.toDataURL("image/png");
            const blob = await (await fetch(finalUrl)).blob();
            const file = new File([blob], "viigo-support.png", { type: "image/png" });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: "Viigo Support",
                    text: "Need help? Contact Viigo support. Support@viigo.in",
                });
            } else {
                const link = document.createElement("a");
                link.href = finalUrl;
                link.download = "viigo-support.png";
                link.click();
            }
        } catch (err) {
            console.error("Share failed:", err);
        }

        if (bottomBar) {
            bottomBar.style.position = "fixed";
            bottomBar.style.bottom = "3.5rem";
        }
    };

    const closeModal = () => {
        setSupport(false);

        if (window.history.state?.modal === "support") {
            window.history.back();
        }
    };

    return (
        // <div className="py-4">
        <div className={`fixed mk:flex flex-col justify-center z-50 bg-white overflow-y-auto inset-0 mk:inset-auto mk:right-0 mk:top-0 mk:min-h-screen mk:w-[480px] mk:p-5 ${window.innerWidth >= 850 ? "animate-slideRight" : "animate-slideUp"}`}>

            <div className="flex items-center justify-between bg-white px-4 mt-4 mk:pt-32">
                <div className="flex items-center gap-2">
                    <FiArrowLeft onClick={closeModal} size={20} className="mk:hidden " />
                    <p className="font-semibold text-lg">Support</p>
                </div>
                <HiShare onClick={handleShare} size={20} className="text-[#475569] mk:hidden" />
            </div>

            <div id="share-area" className="min-h-screen bg-white px-5">

                <p className="py-5 mk:pt-2 text-[#0F172A] text-sm">Have a question or run into an issue? write to us and our team will get back to you.</p>

                <div onClick={handleEmailClick} className="border cursor-pointer border-[#E2E8F0] py-3 px-4 rounded-lg flex items-center gap-4 justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#BFDBFE] rounded-full">
                            <MdEmail className="text-[#2563EB]" size={14} />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[#0F172A] font-semibold">Email Support</p>
                            <p className="text-[#0F172A] text-xs font-normal">Get a reply within 24 hours.</p>
                        </div>
                    </div>
                    <MdKeyboardArrowRight className="text-[#2563EB]" size={20} />
                </div>
            </div>

            <Footer />

        </div>
    )
}

export default Support