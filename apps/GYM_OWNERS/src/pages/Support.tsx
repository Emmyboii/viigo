import { FiArrowLeft } from "react-icons/fi"
import { HiShare } from "react-icons/hi"
import { useNavigate } from "react-router-dom";
import { MdEmail, MdKeyboardArrowRight } from "react-icons/md";
import logoUrl from "../assets/icon2.png";
import * as htmlToImage from "html-to-image";
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

            // 🧠 Convert DOM → image
            const dataUrl = await htmlToImage.toPng(element, {
                pixelRatio: 2,
                cacheBust: true,
            });

            const baseImage = new Image();
            baseImage.src = dataUrl;

            await new Promise((res) => {
                baseImage.onload = res;
            });

            // 🎨 Create final canvas
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const headerHeight = 120;

            canvas.width = baseImage.width;
            canvas.height = baseImage.height + headerHeight;

            // 🔵 Background
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 🔷 Header gradient
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, "#2563EB");
            gradient.addColorStop(1, "#3B82F6");

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, headerHeight);

            // 🧠 Logo
            const logo = new Image();
            logo.src = logoUrl;

            await new Promise((res) => {
                logo.onload = res;
                logo.onerror = res;
            });


            // Max height constraint (this controls visual size)
            const maxLogoHeight = 50;

            // Calculate aspect ratio
            const aspectRatio = logo.width / logo.height;

            // Compute final dimensions
            const logoHeight = maxLogoHeight;
            const logoWidth = logoHeight * aspectRatio;

            // Center content
            const text = "Viigo";
            ctx.font = "bold 50px sans-serif";
            ctx.fillStyle = "#fff";

            // Measure text
            const textWidth = ctx.measureText(text).width;

            // spacing between logo & text
            const gap = 20;

            // total width for centering
            const totalWidth = logoWidth + gap + textWidth;
            const startX = (canvas.width - totalWidth) / 2;

            // draw logo (no distortion)
            ctx.drawImage(
                logo,
                startX,
                (headerHeight - logoHeight) / 2,
                logoWidth,
                logoHeight
            );

            // draw text
            ctx.fillText(
                text,
                startX + logoWidth + gap,
                headerHeight / 2 + 16
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
        <div className="py-4">
            <div className="flex items-center justify-between bg-white px-4">
                <div className="flex items-center gap-2">
                    <FiArrowLeft onClick={() => navigate(-1)} size={20} />
                    <p className="font-semibold text-lg">Support</p>
                </div>
                <HiShare onClick={handleShare} size={20} className="text-[#475569]" />
            </div>

            <div id="share-area" className="min-h-screen bg-white px-5">

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