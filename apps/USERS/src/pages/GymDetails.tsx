import { useParams, useNavigate } from "react-router-dom";
import { gyms } from "../data/gyms";
import BottomSheet from "../components/BottomSheet";
import ImageCarousel from "../components/ImageCarousel";
import { useState, type JSX } from "react";

import {
    IoArrowBack,
    IoInformationCircleOutline,
} from "react-icons/io5";
import { HiLocationMarker, HiOutlineLocationMarker, HiShare } from "react-icons/hi";
import { FaRegClock } from "react-icons/fa6";
import { PiUserGearFill } from "react-icons/pi";
import Footer from "../components/Footer";
import { MdPhone } from "react-icons/md";

export default function GymDetails() {
    const { slug } = useParams();
    const navigate = useNavigate();

    const gym = gyms.find((g) => g.slug === slug);

    const [amenitiesOpen, setAmenitiesOpen] = useState(false);
    const [rulesOpen, setRulesOpen] = useState(false);
    const [priceBreakdownOpen, setPriceBreakdownOpen] = useState(false);

    const tagIcons: Record<string, JSX.Element> = {
        "Hourly Access": <FaRegClock size={12} />,
        "Beginner Friendly": <PiUserGearFill size={12} />,
    };

    if (!gym) return <div className="p-4">Gym not found</div>;

    const visibleAmenities = gym.amenities.slice(0, 4);
    const visibleRules = gym.rules.slice(0, 3);

    return (
        <div className="pb-32 bg-white min-h-screen">

            {/* ===== Header ===== */}
            <div className="fixed top-0 left-0 right-0 z-40 bg-white flex items-center justify-between px-4 py-3 shadow-sm">

                <button
                    onClick={() => navigate(-1)}
                    aria-label="Go back"
                    className="p-1"
                >
                    <IoArrowBack size={20} />
                </button>

                <span className="font-medium">Details</span>

                <button
                    aria-label="Share gym"
                    className="p-1"
                >
                    <HiShare className="text-[#475569]" size={20} />
                </button>
            </div>


            <div className="pt-14" />

            {/* ===== Image Carousel ===== */}
            <ImageCarousel images={gym.images} height="h-60" />

            {/* ===== Content ===== */}
            <div className="bg-white p-4 px-5 space-y-6">

                {/* Gym Name */}
                <div>
                    <h1 className="text-xl font-bold">{gym.name}</h1>

                    <div className="flex items-center text-sm text-gray-500 mt-1 gap-1">
                        <HiLocationMarker size={14} />
                        <span>{gym.distance}</span>
                        <span>•</span>
                        <span>Open Till {gym.closeTime}</span>
                    </div>

                    {/* Call & Map Buttons */}
                    <div className="flex gap-3 mt-3">
                        <div className="bg-[#F1F5F9] text-[#94A3B8] p-2 rounded-lg">
                            <MdPhone size={16} />
                        </div>
                        <div className="bg-[#F1F5F9] text-[#94A3B8] p-2 rounded-lg">
                            <HiOutlineLocationMarker size={16} />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex gap-2 mt-3 flex-wrap">
                        {gym.tags.map((tag, i) => (
                            <span
                                key={i}
                                className="flex items-center gap-1 bg-blue-100 text-blue-600 text-xs px-3 py-2 rounded-full"
                            >
                                {tagIcons[tag]}
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="border border-dashed border-[#CBD5E1]"></div>

                {/* ===== Amenities ===== */}
                <div>
                    <h2 className="text-lg font-semibold mb-3">
                        What’s Included
                    </h2>

                    <div className="space-y-3">
                        {visibleAmenities.map((item, i) => (
                            <p key={i} className="text-sm text-gray-700">
                                {item}
                            </p>
                        ))}
                    </div>

                    {gym.amenities.length > 4 && (
                        <button
                            onClick={() => setAmenitiesOpen(true)}
                            className="mt-4 w-full bg-gray-100 py-3 rounded-xl text-[#94A3B8] font-medium"
                        >
                            Show all {gym.amenities.length} amenities
                        </button>
                    )}
                </div>

                <div className="border border-dashed border-[#CBD5E1]"></div>

                {/* ===== Rules ===== */}
                <div>
                    <h2 className="text-lg font-semibold mb-3">
                        Things to Keep in Mind
                    </h2>

                    <div className="space-y-2 text-sm text-gray-600">
                        {visibleRules.map((rule, i) => (
                            <p key={i}>
                                {i + 1}. {rule}
                            </p>
                        ))}
                    </div>

                    {gym.rules.length > 3 && (
                        <button
                            onClick={() => setRulesOpen(true)}
                            className="mt-4 w-full bg-gray-100 py-3 rounded-xl mb-10 text-[#94A3B8] font-medium"
                        >
                            View all rules
                        </button>
                    )}
                </div>
            </div>

            {/* ===== Sticky Bottom CTA ===== */}
            <div className="fixed bottom-14 left-0 right-0 bg-white border-t px-4 py-3 flex justify-between items-center">
                <div className="space-y-2">
                    <p className="text-xs text-gray-500">
                        Gym timings : {gym.timings}
                    </p>

                    <div className="flex items-center gap-1">
                        <p className="text-xl font-bold">
                            ₹{gym.price}/Hr
                        </p>
                        <IoInformationCircleOutline
                            size={22}
                            onClick={() => setPriceBreakdownOpen(true)}
                            className="text-gray-400"
                        />
                    </div>
                </div>

                <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium">
                    Select Slot
                </button>
            </div>

            <Footer />

            {/* ===== Amenities Bottom Sheet ===== */}
            <BottomSheet
                open={amenitiesOpen}
                onClose={() => setAmenitiesOpen(false)}
                title="What This Place Offers"
            >
                {gym.amenities.map((item, i) => (
                    <p key={i} className="mb-3 text-sm">
                        {item}
                    </p>
                ))}
            </BottomSheet>

            {/* ===== Rules Bottom Sheet ===== */}
            <BottomSheet
                open={rulesOpen}
                onClose={() => setRulesOpen(false)}
                title="Things to Know"
            >
                {gym.rules.map((rule, i) => (
                    <p key={i} className="mb-3 text-sm">
                        {i + 1}. {rule}
                    </p>
                ))}
            </BottomSheet>

            {/* ===== Price Breakdown Bottom Sheet ===== */}
            <BottomSheet
                open={priceBreakdownOpen}
                onClose={() => setPriceBreakdownOpen(false)}
                title="Price Breakdown"
            >
                <div className="border border-[#DBEAFE] py-3 px-4 rounded-md space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[#6A6A6A]">2Hours</p>
                        <p className="text-sm font-medium text-[#0F172A]">Rs. {gym.price}</p>
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[#6A6A6A]">Platform Fee</p>
                        <p className="text-sm font-medium text-[#0F172A]">Rs. 10</p>
                    </div>

                    <div className="border border-dashed border-[#CBD5E1]"></div>

                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[#6A6A6A]">Total</p>
                        <p className="text-sm font-medium text-[#0F172A]">Rs. {gym.price + 10}</p>
                    </div>
                </div>
            </BottomSheet>

        </div>
    );
}
