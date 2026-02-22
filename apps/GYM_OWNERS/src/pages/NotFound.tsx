import { motion, useAnimation } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiHome, FiArrowLeft } from "react-icons/fi";
import { useEffect } from "react";

export default function NotFound({ Loading }: { Loading: boolean }) {
    const navigate = useNavigate();

    const controls = useAnimation();

    useEffect(() => {
        if (!Loading) {
            controls.start({
                x: 0,
                opacity: 1,
                transition: {
                    type: "spring",
                    stiffness: 50,
                    damping: 11,
                    mass: 1.2,
                },
            });
        }
    }, [Loading, controls]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F172A] via-[#020617] to-black text-white px-6">
            <div className="text-center max-w-lg w-full">
                {/* Animated 404 */}
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-[90px] md:text-[120px] font-bold bg-gradient-to-r from-blue-500 to-cyan-400 text-transparent bg-clip-text"
                >
                    404
                </motion.h1>

                {/* Title */}
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-2xl font-semibold mt-2"
                >
                    Page Not Found
                </motion.h2>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-400 mt-3 text-sm"
                >
                    Oops! The page you’re looking for doesn’t exist or has been moved.
                </motion.p>

                {/* Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center justify-center gap-3 mt-8 flex-wrap"
                >
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition text-sm"
                    >
                        <FiArrowLeft />
                        Go Back
                    </button>

                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition text-sm font-medium"
                    >
                        <FiHome />
                        Go Home
                    </button>
                </motion.div>

                {/* Floating Glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ repeat: Infinity, duration: 6 }}
                        className="absolute top-10 left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{ y: [0, 20, 0] }}
                        transition={{ repeat: Infinity, duration: 8 }}
                        className="absolute bottom-10 right-10 w-52 h-52 bg-cyan-400/20 rounded-full blur-3xl"
                    />
                </div>
            </div>
        </div>
    );
}
