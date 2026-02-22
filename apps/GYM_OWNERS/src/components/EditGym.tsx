import { useEffect, useState } from "react";
import { CiCircleAlert } from "react-icons/ci";
import {
    FiArrowLeft,
    FiMapPin,
    FiX,
    FiClock,
    FiArrowRight,
} from "react-icons/fi";
import { FiSun, FiMoon } from "react-icons/fi";
import { FaPlus } from "react-icons/fa6";
import { useNavigate } from "react-router";

interface PeakHour {
    id: string;
    start: string;
    end: string;
}

interface TimeInputProps {
    value: string;
    onChange: (value: string) => void;
}

interface InputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: React.ReactNode;
}

interface SectionProps {
    title: string;
    children: React.ReactNode;
}

const ALL_AMENITIES = [
    "Locker",
    "Restroom",
    "Trainer",
    "Shower",
    "Parking",
    "WiFi",
];

const ALL_RULES = [
    "Slot timing is strictly followed",
    "Hourly passes must be used in one continuous session",
    "Wear proper workout attire and shoes",
    "No outside food allowed",
    "Maintain hygiene",
];

interface EditGymProps {
    setDisplay: React.Dispatch<React.SetStateAction<"details" | "edit">>;
}

export default function EditGym({ setDisplay }: EditGymProps) {

    const navigate = useNavigate();

    const [gymName, setGymName] = useState("");
    const [price, setPrice] = useState("");
    const [phone, setPhone] = useState('+91 ');
    const [location, setLocation] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [startTime, setStartTime] = useState("00:00");
    const [endTime, setEndTime] = useState("00:01");

    const [morningPeak, setMorningPeak] = useState<PeakHour[]>([
        { id: crypto.randomUUID(), start: "00:00", end: "00:01" },
    ]);

    const [eveningPeak, setEveningPeak] = useState<PeakHour[]>([
        { id: crypto.randomUUID(), start: "00:00", end: "00:01" },
    ]);

    const [photos, setPhotos] = useState<string[]>([]);

    const [visibleAmenities, setVisibleAmenities] = useState<string[]>([
        "Locker",
        "Restroom",
        "Trainer",
    ]);

    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

    const [visibleRules, setVisibleRules] = useState<string[]>([
        "Slot timing is strictly followed",
        "Hourly passes must be used in one continuous session",
    ]);

    const [selectedRules, setSelectedRules] = useState<string[]>([]);

    const [modalType, setModalType] = useState<"amenities" | "rules" | null>(null);

    useEffect(() => {
        if (modalType === "amenities" || modalType === "rules") {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [modalType]);

    // Photos Logic
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newPhotos = Array.from(files).map((file) =>
            URL.createObjectURL(file)
        );

        setPhotos((prev) => [...prev, ...newPhotos]);
    };

    const removePhoto = (url: string) => {
        setPhotos((prev) => prev.filter((p) => p !== url));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Remove +91 and spaces at the start, keep only digits
        let digitsOnly = value.replace(/^(\+91\s?)/, "").replace(/\D/g, "");

        // Limit to 10 digits
        if (digitsOnly.length > 10) digitsOnly = digitsOnly.slice(0, 10);

        // Set value with +91 and a space
        setPhone(`+91 ${digitsOnly}`);
    };



    const isFormValid =
        gymName.trim() &&
        price.trim() &&
        phone.replace("+91 ", "").length === 10 &&
        location.trim() &&
        startTime &&
        endTime &&
        isEndTimeValid(startTime, endTime) &&
        selectedAmenities.length > 0 &&
        selectedRules.length > 0 &&
        photos.length > 0 &&
        morningPeak.every(
            (p) => p.start && p.end && isEndTimeValid(p.start, p.end)
        ) &&
        eveningPeak.every(
            (p) => p.start && p.end && isEndTimeValid(p.start, p.end)
        );

    return (
        <div className="min-h-screen pb-32">
            {/* Header */}
            <div onClick={() => navigate(-1)} className="flex items-center gap-3 p-4 bg-white">
                <FiArrowLeft size={20} />
                <h1 className="font-semibold text-lg">Edit Gym Details</h1>
            </div>

            <div className="p-4 space-y-6">
                {/* Gym Name */}
                <Input label="Gym Name" value={gymName} onChange={setGymName} />

                <div>
                    <Input
                        label="How much do you charge per hour?"
                        placeholder="Example ₹210/Hour"
                        value={price}
                        onChange={setPrice}
                    />

                    <p className="text-[#475569] text-[10px] pt-1"><CiCircleAlert className="inline mr-0.5 text-sm" />Tip: Set a nominal price to attract more customers.You can edit this anytime </p>
                </div>

                <div>
                    <p className="text-base mb-1 text-[#0F172A] font-semibold">Phone Number</p>
                    <div className="relative">
                        <input
                            type="text"
                            name=""
                            id=""
                            value={phone}
                            onChange={handleChange}
                            title="number"
                            className="border border-[#475569] text-[#0F172A] text-sm w-full rounded-lg py-2 px-4 outline-none pt-7"
                        />
                        <p className="text-[#475569] absolute top-2 left-4 text-xs font-normal">10 Digit Phone Number</p>
                    </div>
                </div>

                <Input
                    label="Location"
                    value={location}
                    onChange={setLocation}
                    icon={<FiMapPin />}
                />

                {/* Gym Timings */}
                <GymTimings
                    start={startTime}
                    end={endTime}
                    setStart={setStartTime}
                    setEnd={setEndTime}
                />

                {/* Peak Hours */}
                <GymPeakHours
                    morning={morningPeak}
                    evening={eveningPeak}
                    setMorning={setMorningPeak}
                    setEvening={setEveningPeak}
                />

                {/* Photos */}
                <Section title="Gym Photos">
                    <div className="flex gap-3 flex-wrap">
                        {photos.map((url) => (
                            <div key={url} className="relative">
                                <img
                                    src={url}
                                    title="gymphotos"
                                    className="w-24 h-24 object-cover rounded-lg"
                                />
                                <button
                                    title="remove"
                                    onClick={() => removePhoto(url)}
                                    className="absolute -top-2 -right-2 bg-white p-1 rounded-full shadow"
                                >
                                    <FiX size={14} />
                                </button>
                            </div>
                        ))}

                        <label className="w-24 h-24 border-2 border-dashed border-[#2563EB] rounded-lg flex items-center justify-center cursor-pointer">
                            <FaPlus className="size-6 text-[#2563EB]" />
                            <input
                                type="file"
                                multiple
                                hidden
                                onChange={handlePhotoUpload}
                            />
                        </label>
                    </div>
                    <p className="text-[11px] text-[#0F172A] mt-3">Add Atleast 3 high quality Photos</p>
                </Section>

                {/* Amenities */}
                <Section title="Amenities">
                    <div className="flex flex-wrap gap-2 mt-2">
                        {visibleAmenities.map((item) => {
                            const active = selectedAmenities.includes(item);

                            return (
                                <button
                                    key={item}
                                    onClick={() =>
                                        setSelectedAmenities((prev) =>
                                            prev.includes(item)
                                                ? prev.filter((i) => i !== item)
                                                : [...prev, item]
                                        )
                                    }
                                    className={`px-3 py-1.5 rounded-full text-sm
                                     ${active
                                            ? "bg-blue-100 text-blue-600"
                                            : "bg-gray-100 text-gray-600"}
                                    `}
                                >
                                    {item}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => setModalType("amenities")}
                        className="mt-4 w-full bg-gray-100 py-3 rounded-xl mb-10 text-[#94A3B8] font-medium"
                    >
                        Add More
                    </button>
                </Section>

                {/* Rules */}
                <Section title="Rules">
                    <div className="space-y-3 mt-2">
                        {visibleRules.map((item) => {
                            const active = selectedRules.includes(item);

                            return (
                                <div
                                    key={item}
                                    onClick={() =>
                                        setSelectedRules((prev) =>
                                            prev.includes(item)
                                                ? prev.filter((i) => i !== item)
                                                : [...prev, item]
                                        )
                                    }
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer
                                        ${active ? "border-blue-500 bg-blue-50" : "border-gray-200"}
                                    `}
                                >
                                    {/* Radio */}
                                    <div
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center
                                        ${active ? "border-blue-500" : "border-gray-400"}
                                        `}
                                    >
                                        {active && (
                                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-700">{item}</p>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => setModalType("rules")}
                        className="mt-4 w-full bg-gray-100 py-3 rounded-xl mb-10 text-[#94A3B8] font-medium"
                    >
                        Add More
                    </button>
                </Section>
            </div>

            {/* Save Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t">
                <button
                    disabled={!isFormValid || isLoading}
                    onClick={() => {
                        if (!isFormValid || isLoading) return;

                        setIsLoading(true);

                        setTimeout(() => {
                            setIsLoading(false);
                            setDisplay("details");
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }, 1500);
                    }}
                    className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition ${isFormValid && !isLoading
                            ? "bg-blue-600 text-white"
                            : "bg-gray-300 text-gray-500"
                        }`}
                >
                    {isLoading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                        </>
                    ) : (
                        "Save Changes"
                    )}
                </button>
            </div>

            {/* Modal */}
            {modalType && (
                <SelectionModal
                    open={true}
                    title={modalType === "amenities" ? "Amenities" : "Select Rules"}
                    options={modalType === "amenities" ? ALL_AMENITIES : ALL_RULES}
                    existing={modalType === "amenities" ? visibleAmenities : visibleRules}
                    onClose={() => setModalType(null)}
                    onSave={(items) => {
                        if (modalType === "amenities") {
                            setVisibleAmenities((prev) => [...prev, ...items]);
                        } else {
                            setVisibleRules((prev) => [...prev, ...items]);
                        }

                        setModalType(null);
                    }}
                />
            )}
        </div>
    );
}

const Input = ({ label, value, onChange, placeholder, icon }: InputProps) => (
    <div className="relative">
        <p className="text-base mb-1 text-[#0F172A] font-semibold">{label}</p>
        <div className="flex items-center border border-[#475569] h-[50px] rounded-lg px-3 py-2 bg-white">
            {icon && <div className="mr-2 absolute right-2 text-[#475569] text-[20px]">{icon}</div>}
            <input
                className="w-full outline-none text-sm"
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    </div>
);

import { useRef } from "react";
import SelectionModal from "../components/SelectionModal";

const TimeInput = ({ value, onChange }: TimeInputProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        inputRef.current?.showPicker?.(); // modern browsers
        inputRef.current?.focus();
    };

    return (
        <div
            onClick={handleClick}
            className="flex items-center justify-center bg-white rounded-xl px-3 py-3 w-full shadow-sm cursor-pointer"
        >
            <FiClock className="text-gray-400 mr-2" size={16} />

            <input
                title="time"
                ref={inputRef}
                type="time"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="outline-none text-sm w-full bg-transparent cursor-pointer"
            />
        </div>
    );
};

const GymTimings = ({
    start,
    end,
    setStart,
    setEnd,
}: {
    start: string;
    end: string;
    setStart: (v: string) => void;
    setEnd: (v: string) => void;
}) => {
    const isValid = isEndTimeValid(start, end);

    return (
        <div className="space-y-3">
            <h2 className="text-lg font-semibold">Gym Timings</h2>

            <div className="bg-blue-100 rounded-lg p-3 py-5">
                <div className="flex items-center justify-between gap-1">
                    <div className="flex-">
                        <p className="text-sm mb-2 text-gray-700">Start Time</p>
                        <TimeInput value={start} onChange={setStart} />
                    </div>

                    <FiArrowRight className="mt-6 text-gray-600" size={18} />

                    <div className="flex-">
                        <p className="text-sm mb-2 text-gray-700">End Time</p>
                        <TimeInput value={end} onChange={setEnd} />
                    </div>
                </div>

                {!isValid && (
                    <p className="text-red-500 text-xs mt-2">
                        End time must be later than start time
                    </p>
                )}
            </div>
        </div>
    );
};

const GymPeakHours = ({
    morning,
    evening,
    setMorning,
    setEvening,
}: {
    morning: PeakHour[];
    evening: PeakHour[];
    setMorning: React.Dispatch<React.SetStateAction<PeakHour[]>>;
    setEvening: React.Dispatch<React.SetStateAction<PeakHour[]>>;
}) => {
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Set Gym Peak Hours</h2>

            <PeakSection
                title="Morning"
                data={morning}
                setData={setMorning}
                icon={<FiSun size={16} />}
            />

            <PeakSection
                title="Evening"
                data={evening}
                setData={setEvening}
                icon={<FiMoon size={16} />}
            />
        </div>
    );
};

const isEndTimeValid = (start: string, end: string) => {
    if (!start || !end) return true;

    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;

    return endMinutes > startMinutes;
};

const PeakSection = ({
    title,
    icon,
    data,
    setData,
}: {
    title: string;
    icon: React.ReactNode;
    data: PeakHour[];
    setData: React.Dispatch<React.SetStateAction<PeakHour[]>>;
}) => {
    const addMore = () => {
        setData((prev) => [
            ...prev,
            { id: crypto.randomUUID(), start: "00:00", end: "00:00" },
        ]);
    };

    const updateTime = (
        id: string,
        field: "start" | "end",
        value: string
    ) => {
        setData((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    return (
        <div className="bg-blue-100 rounded-lg p-3 py-5 space-y-5">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
                {icon}
                {title}
            </div>

            {data.map((item, index) => (
                <div key={item.id} className="space-y-3">
                    <div className="flex items-center justify-between gap-1">
                        <div className="flex-">
                            <p className="text-sm mb-2 text-gray-700">Start Time</p>
                            <TimeInput
                                value={item.start}
                                onChange={(v) => updateTime(item.id, "start", v)}
                            />
                        </div>

                        <FiArrowRight className="mt-6 text-gray-600" size={18} />

                        <div className="flex-">
                            <p className="text-sm mb-2 text-gray-700">End Time</p>
                            <TimeInput
                                value={item.end}
                                onChange={(v) => updateTime(item.id, "end", v)}
                            />
                        </div>
                    </div>

                    {/* DELETE BUTTON */}
                    {data.length > 1 && (
                        <button
                            onClick={() =>
                                setData((prev) => prev.filter((p) => p.id !== item.id))
                            }
                            className="mt-6 text-red-500 hover:text-red-600 text-sm font-medium"
                        >
                            Delete
                        </button>
                    )}

                    {!isEndTimeValid(item.start, item.end) && (
                        <p className="text-red-500 text-xs mt-1">
                            End time must be later than start time
                        </p>
                    )}

                    {(index === data.length - 1 && title === "Morning") && (
                        <button
                            onClick={addMore}
                            className="w-full bg-blue-200 text-gray-600 py-2 rounded-xl text-sm font-medium hover:bg-blue-300 transition"
                        >
                            Add More
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

const Section = ({ title, children }: SectionProps) => (
    <div>
        <h2 className="font-medium mb-2">{title}</h2>
        {children}
    </div>
);
