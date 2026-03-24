import { FiArrowLeft } from "react-icons/fi"
import { HiShare } from "react-icons/hi"
import { useNavigate } from "react-router-dom";
import { MdEmail, MdKeyboardArrowRight } from "react-icons/md";
import logoUrl from "../assets/icon2.png";
import html2canvas from "html2canvas";
import Footer from "../components/Footer";

const companyEmail = "Support@viigo.in";

const Support = () => {

    const navigate = useNavigate();

    const handleEmailClick = () => {
        window.location.href = `mailto:${companyEmail}`;
    };

    const handleShare = async () => {
        const element = document.getElementById("share-area");
        const bottomBar = document.getElementById("share-bottom-bar");

        if (!element) return;

        if (bottomBar) {
            bottomBar.style.position = "relative";
            bottomBar.style.bottom = "0px";
        }

        try {
            await document.fonts.ready;

            const canvas = await html2canvas(element, {
                useCORS: true,
                allowTaint: false,
                scrollX: 0,
                scrollY: -window.scrollY,
                windowWidth: document.documentElement.clientWidth,
                windowHeight: document.documentElement.clientHeight,
                scale: 2,
            });

            const finalCanvas = document.createElement("canvas");
            const ctx = finalCanvas.getContext("2d");
            if (!ctx) return;

            const headerHeight = 100;
            const padding = 40;

            // Canvas size
            finalCanvas.width = canvas.width + padding * 2;
            finalCanvas.height = canvas.height + headerHeight + padding * 2;

            // Header background
            ctx.fillStyle = "#2563EB";
            ctx.fillRect(0, 0, finalCanvas.width, headerHeight);

            // Load logo
            const logo = new Image();
            logo.src = logoUrl;

            await new Promise((resolve) => {
                logo.onload = resolve;
                logo.onerror = resolve;
            });

            const maxLogoHeight = 40;
            const logoRatio = logo.width / logo.height;
            const logoWidth = maxLogoHeight * logoRatio;
            const logoHeight = maxLogoHeight;

            // Text setup
            const text = "Viigo";
            ctx.font = "bold 50px sans-serif";
            ctx.fillStyle = "#fff";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";

            const textWidth = ctx.measureText(text).width;
            const gap = 20;

            const totalWidth = logoWidth + gap + textWidth;
            const startX = (finalCanvas.width - totalWidth) / 2;

            const headerCenterY = headerHeight / 2;

            // Draw logo
            ctx.drawImage(
                logo,
                startX,
                headerCenterY - logoHeight / 2,
                logoWidth,
                logoHeight
            );

            // Draw text
            ctx.fillText(
                text,
                startX + logoWidth + gap,
                headerCenterY
            );

            // Draw content
            ctx.drawImage(canvas, padding, headerHeight + padding);

            const dataUrl = finalCanvas.toDataURL("image/png");

            // ✅ Proper file sharing
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], "viigo-support.png", { type: "image/png" });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: "Viigo Support",
                    text: "Need help? Contact Viigo support.",
                });
            } else {
                const link = document.createElement("a");
                link.href = dataUrl;
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

    return (
        <div className="px-5 py-4 relative">
            <div className="flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                    <FiArrowLeft onClick={() => navigate(-1)} size={20} />
                    <p className="font-semibold text-lg">Support</p>
                </div>
                <HiShare onClick={handleShare} size={20} className="text-[#475569]" />
            </div>

            <div id="share-area" className="min-h-screen bg-white">

                <p className="py-5 text-[#0F172A] text-sm">Have a question or run into an issue? write to us and our team will get back to you.</p>

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