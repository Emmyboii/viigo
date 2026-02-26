import { useCallback, useEffect, useMemo, useState } from "react";
import { CiCircleAlert } from "react-icons/ci";
import {
    FiArrowLeft,
    FiMapPin,
    FiX,
    FiClock,
    FiArrowRight,
} from "react-icons/fi";
import { FiSun, FiMoon } from "react-icons/fi";
import { FaCircleCheck, FaPlus } from "react-icons/fa6";
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

interface GymType {
    id: string;
    name: string;
    hourly_rate: string;
    phone_number: string;
    location: string;
    open_time: string;
    longitude: string;
    latitude: string;
    close_time: string;
    amenities: Amenity[];
    rules: Rule[];
    images: { id: number; image: string }[];

    peak_morning?: [string, string][];
    peak_evening?: [string, string][];
    calendar_availability?: []

    owner_email: string
}

type ToastType = "success" | "error" | null;

interface EditGymProps {
    display: string,
    setDisplay: React.Dispatch<React.SetStateAction<"details" | "edit" | "create">>;
    // setGymList: React.Dispatch<React.SetStateAction<GymType[]>>;
    setGym: React.Dispatch<React.SetStateAction<GymType | null>>;
    gym?: GymType | null;
}

interface Amenity {
    id: number;
    name: string;
    icon: string;
}

interface Rule {
    id: number;
    description: string;
}

type PhotoType = {
    url: string;
    isNew: boolean;
};

export default function EditGym({ display, setDisplay, gym, setGym }: EditGymProps) {

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const navigate = useNavigate();
    const [initialData, setInitialData] = useState<string>("");

    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

    const [gymName, setGymName] = useState(gym?.name || "");
    const [price, setPrice] = useState(gym?.hourly_rate || "");
    const [phone, setPhone] = useState(gym?.phone_number || "+91 ");
    const [location, setLocation] = useState(gym?.location || "");
    const [startTime, setStartTime] = useState(gym?.open_time || "00:00");
    const [endTime, setEndTime] = useState(gym?.close_time || "00:01");
    const [latitude, setLatitude] = useState<string>(gym?.latitude || "");
    const [longitude, setLongitude] = useState<string>(gym?.longitude || "");

    const [morningPeak, setMorningPeak] = useState<PeakHour[]>(() => {
        if (gym?.peak_morning && gym.peak_morning.length > 0) {
            return gym.peak_morning.map(([start, end]) => ({
                id: crypto.randomUUID(),
                start,
                end,
            }));
        }

        return [{ id: crypto.randomUUID(), start: "00:00", end: "00:01" }];
    });

    const [eveningPeak, setEveningPeak] = useState<PeakHour[]>(() => {
        if (gym?.peak_evening && gym.peak_evening.length > 0) {
            return gym.peak_evening.map(([start, end]) => ({
                id: crypto.randomUUID(),
                start,
                end,
            }));
        }

        return [{
            id: crypto.randomUUID(),
            start: "16:00",
            end: gym?.close_time || "00:01",
        }];
    });

    const [photos, setPhotos] = useState<PhotoType[]>(
        gym?.images?.map(img => ({
            url: img.image,
            isNew: false,
        })) || []
    );

    const [selectedAmenities, setSelectedAmenities] = useState<number[]>(
        gym?.amenities?.map(a => a.id) || []
    );
    const [selectedRules, setSelectedRules] = useState<number[]>(
        gym?.rules?.map(r => r.id) || []
    );
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [amenitiesCount, setAmenitiesCount] = useState('');
    const [rules, setRules] = useState<Rule[]>([]);
    const [rulesCount, setRulesCount] = useState('');

    // const visibleAmenities = amenities.slice(0, 6);
    // const visibleRules = rules.slice(0, 6);

    const [visibleAmenities, setVisibleAmenities] = useState<Amenity[]>([])
    const [visibleRules, setVisibleRules] = useState<Rule[]>([])

    const [modalType, setModalType] = useState<"amenities" | "rules" | null>(null);

    useEffect(() => {
        if (modalType === "amenities" || modalType === "rules") {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [modalType]);

    // If gym closes before evening peak start, automatically limit evening start
    useEffect(() => {
        const minStart = timeToMinutes("16:00");
        const endLimit = timeToMinutes(endTime);

        setEveningPeak((prev) =>
            prev.map((p) => {
                let start = p.start;
                let end = p.end;

                if (timeToMinutes(start) < minStart) {
                    start = "16:00";
                }

                if (timeToMinutes(end) > endLimit) {
                    end = endTime;
                }

                return { ...p, start, end };
            })
        );
    }, [endTime]);

    const fetchCurrentLocation = () => {
        if (!navigator.geolocation) {
            setToast({ type: "error", message: "Your browser does not support location access." });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLatitude(latitude.toString());
                setLongitude(longitude.toString());
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    setToast({
                        type: "error",
                        message: "Please allow location access so we can auto-fill your coordinates.",
                    });
                } else {
                    setToast({ type: "error", message: "Unable to get your location." });
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    useEffect(() => {
        // if (display === "create") {
        fetchCurrentLocation();
        // }
    }, [display]);

    useEffect(() => {
        if (!gym) return;

        const formatted = JSON.stringify({
            name: gym?.name,
            price: gym?.hourly_rate,
            phone: gym?.phone_number,
            location: gym?.location,
            start: gym?.open_time,
            end: gym?.close_time,
            amenities: gym?.amenities.map(a => a.id).sort(),
            rules: gym?.rules.map(r => r.id).sort(),
            photos: gym?.images?.map(img => img.image).sort(),
            morning: gym?.peak_morning,
            evening: gym?.peak_evening,
        });

        setInitialData(formatted);
    }, [gym]);

    const currentData = useMemo(() => {
        return JSON.stringify({
            name: gymName,
            price,
            phone,
            location,
            start: startTime,
            end: endTime,
            amenities: selectedAmenities.slice().sort(),
            rules: selectedRules.slice().sort(),
            photos: photos.map(p => p.url).sort(),
            morning: morningPeak.map(p => [p.start, p.end]),
            evening: eveningPeak.map(p => [p.start, p.end]),
        });
    }, [
        gymName,
        price,
        phone,
        location,
        startTime,
        endTime,
        selectedAmenities,
        selectedRules,
        photos,
        morningPeak,
        eveningPeak
    ]);

    const isChanged = initialData !== currentData;

    useEffect(() => {
        const fetchAmenitiesAndRules = async () => {
            const token = localStorage.getItem("token");

            try {
                const res = await fetch(`${backendUrl}/gymowner/amenities/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await res.json();
                if (!res.ok) throw new Error("Failed to fetch amenities");
                setAmenities(data.data);
                setAmenitiesCount(data.data.length);
                setVisibleAmenities(data.data.slice(0, 6));

                const res2 = await fetch(`${backendUrl}/gymowner/rules/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data2 = await res2.json();
                if (!res2.ok) throw new Error("Failed to fetch rules");
                setRules(data2.data);
                setRulesCount(data2.data.length);
                setVisibleRules(data2.data.slice(0, 6));

            } catch (err) {
                console.error(err);
            }
        };

        fetchAmenitiesAndRules();
    }, [backendUrl]);

    // Photos Logic
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newPhotos = Array.from(files).map((file) => ({
            url: URL.createObjectURL(file),
            isNew: true,
        }));

        setPhotos((prev) => [...prev, ...newPhotos]);
    };

    const removePhoto = (url: string) => {
        setPhotos((prev) => prev.filter((p) => p.url !== url));
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

    const handleSubmit = async () => {
        if (!isFormValid || isLoading) return;

        (document.activeElement as HTMLElement)?.blur();

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", gymName);
            formData.append("hourly_rate", price);
            formData.append("phone_number", phone);
            formData.append("location", location);
            formData.append("open_time", startTime);
            formData.append("close_time", endTime);
            formData.append("latitude", latitude);
            formData.append("longitude", longitude);

            // Photos
            // only upload NEW images
            for (const photo of photos) {
                if (photo.isNew) {
                    const blob = await fetch(photo.url).then(res => res.blob());
                    formData.append("uploaded_images", blob, "photo.jpg");
                }
            }

            selectedAmenities.forEach((id) =>
                formData.append("amenities", String(id))
            );

            selectedRules.forEach((id) =>
                formData.append("rules", String(id))
            );

            const peakMorningFormatted = morningPeak.map(p => [p.start, p.end]);
            const peakEveningFormatted = eveningPeak.map(p => [p.start, p.end]);

            formData.append("peak_morning", JSON.stringify(peakMorningFormatted));
            formData.append("peak_evening", JSON.stringify(peakEveningFormatted));

            const token = localStorage.getItem("token");

            let res;
            if (display === "edit") {
                // EDIT existing gym
                res = await fetch(`${backendUrl}/gymowner/gyms/${gym?.id}/`, {
                    method: "PUT",
                    body: formData,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            } else {
                // CREATE new gym
                res = await fetch(`${backendUrl}/gymowner/gyms/create/`, {
                    method: "POST",
                    body: formData,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }

            if (!res.ok) throw new Error("Failed to save gym");

            const data = await res.json();

            const newGym: GymType = data.data;
            setGym(newGym);


            setTimeout(() => {
                setDisplay("details");
                localStorage.setItem("gymDisplay", "details");
            }, 1500);

            const message =
                display === "edit"
                    ? "Changes saved successfully!"
                    : "Gym created successfully!";
            setToast({ type: "success", message });

            setTimeout(() => {
                window.location.reload()
            }, 1000);

            window.scrollTo(0, 0)
        } catch (err) {
            console.error(err);
            setToast({ type: "error", message: "Something went wrong, please try again!" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleToastClose = useCallback(() => {
        setToast(null);
    }, []);


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
            <div className="flex items-center gap-3 p-4 bg-white cursor-pointer">
                <FiArrowLeft
                    onClick={() => {
                        if (display === "edit") {
                            setDisplay("details");
                            localStorage.setItem("gymDisplay", "details");
                        } else if (display === "create") {
                            navigate(-1)
                        } else {
                            navigate(-1)
                        }
                    }}
                    size={20} />
                <h1 className="font-semibold text-lg">Edit Gym Details</h1>
            </div>

            {toast && <Toast type={toast.type} text={toast.message} onClose={handleToastClose} />}

            <div className="p-4 space-y-6">
                {/* Gym Name */}
                <Input label="Gym Name" value={gymName} onChange={setGymName} />

                <div>
                    <Input2
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
                    gymEndTime={endTime}
                />

                {/* Photos */}
                <Section title="Gym Photos">
                    <div className="flex gap-3 flex-wrap">
                        {photos.map((photo) => (
                            <div key={photo.url} className="relative">
                                <img
                                    src={photo.url}
                                    title="gymphotos"
                                    className="w-24 h-24 object-cover rounded-lg"
                                />
                                <button
                                    onClick={() => removePhoto(photo.url)}
                                    title="remove"
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
                    <div className="flex flex-wrap gap-3 mt-2">
                        {visibleAmenities.map((item) => {
                            const active = selectedAmenities.includes(item.id);

                            return (
                                <button
                                    key={item.id}
                                    onClick={() =>
                                        setSelectedAmenities((prev) =>
                                            prev.includes(item.id)
                                                ? prev.filter((i) => i !== item.id)
                                                : [...prev, item.id]
                                        )
                                    }
                                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm border transition
                                        ${active
                                            ? "bg-blue-100 border-blue-500 text-blue-600"
                                            : "bg-gray-100 border-gray-200 text-gray-600"
                                        }
                                    `}
                                >
                                    <img src={item.icon} alt={item.name} className="w-4 h-4" />
                                    {item.name}
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
                            const active = selectedRules.includes(item.id);

                            return (
                                <div
                                    key={item.id}
                                    onClick={() =>
                                        setSelectedRules((prev) =>
                                            prev.includes(item.id)
                                                ? prev.filter((i) => i !== item.id)
                                                : [...prev, item.id]
                                        )
                                    }
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition
                                        ${active ? "border-blue-500 bg-blue-50" : "border-gray-200"}
                                    `}
                                >
                                    <div
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center
                                        ${active ? "border-blue-500" : "border-gray-400"}
                                    `}
                                    >
                                        {active && (
                                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-700">{item.description}</p>
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
                    disabled={!isFormValid || isLoading || !isChanged}
                    onClick={handleSubmit}
                    className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition ${isFormValid && !isLoading && isChanged
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
                    title={modalType === "amenities" ? `Amenities (${amenitiesCount})` : `Select Rules (${rulesCount})`}
                    options={
                        modalType === "amenities"
                            ? amenities.map((a) => ({
                                id: a.id,
                                label: a.name,
                                icon: a.icon,
                            }))
                            : rules.map((r) => ({
                                id: r.id,
                                label: r.description,
                            }))
                    }
                    existing={
                        modalType === "amenities"
                            ? visibleAmenities.map((a) => a.id)
                            : visibleRules.map((r) => r.id)
                    }
                    onClose={() => setModalType(null)}
                    onSave={(items: number[]) => {
                        if (modalType === "amenities") {
                            const selected = amenities.filter(a => items.includes(a.id));
                            setVisibleAmenities((prev) => {
                                const existingIds = new Set(prev.map(a => a.id));
                                const filtered = selected.filter(a => !existingIds.has(a.id));
                                return [...prev, ...filtered];
                            });
                        } else {
                            const selected = rules.filter(r => items.includes(r.id));
                            setVisibleRules((prev) => {
                                const existingIds = new Set(prev.map(r => r.id));
                                const filtered = selected.filter(r => !existingIds.has(r.id));
                                return [...prev, ...filtered];
                            });

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

const Input2 = ({ label, value, onChange, placeholder, icon }: InputProps) => {
    // Handle numeric input only
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow only digits
        const numericValue = e.target.value.replace(/\D/g, "");
        onChange(numericValue);
    };

    return (
        <div className="relative">
            <p className="text-base mb-1 text-[#0F172A] font-semibold">{label}</p>
            <div className="flex items-center border border-[#475569] h-[50px] rounded-lg px-3 py-2 bg-white">
                {icon && <div className="mr-2 absolute right-2 text-[#475569] text-[20px]">{icon}</div>}
                <input
                    type="text" // keep text so we can control pasted input
                    className="w-full outline-none text-sm"
                    value={value}
                    placeholder={placeholder}
                    onChange={handleChange}
                />
            </div>
        </div>
    );
};

import { useRef } from "react";
import SelectionModal from "../components/SelectionModal";
import { MdError } from "react-icons/md";

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
    gymEndTime
}: {
    morning: PeakHour[];
    evening: PeakHour[];
    setMorning: React.Dispatch<React.SetStateAction<PeakHour[]>>;
    setEvening: React.Dispatch<React.SetStateAction<PeakHour[]>>;
    gymEndTime: string
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
                gymEndTime={gymEndTime}
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

const timeToMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
};

const PeakSection = ({
    title,
    icon,
    data,
    setData,
    gymEndTime,
}: {
    title: string;
    icon: React.ReactNode;
    data: PeakHour[];
    setData: React.Dispatch<React.SetStateAction<PeakHour[]>>;
    gymEndTime?: string;
}) => {
    const addMore = () => {
        setData((prev) => [
            ...prev,
            { id: crypto.randomUUID(), start: "00:00", end: "00:00" },
        ]);
    };

    const updateTime = (id: string, field: "start" | "end", value: string) => {
        setData((prev) =>
            prev.map((item) => {
                if (item.id !== id) return item;

                // Evening peak restriction
                if (title === "Evening" && gymEndTime) {
                    const minStart = timeToMinutes("16:00");
                    const endLimit = timeToMinutes(gymEndTime);
                    const newValue = timeToMinutes(value);

                    if (field === "start" && newValue < minStart) {
                        value = "16:00";
                    }

                    if (field === "end" && newValue > endLimit) {
                        value = gymEndTime;
                    }
                }

                return { ...item, [field]: value };
            })
        );
    };

    return (
        <div className="bg-blue-100 rounded-lg p-3 py-5 space-y-5">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
                {icon} {title}
            </div>

            {data.map((item, index) => (
                <div key={item.id} className="space-y-3">
                    <div className="flex items-center justify-between gap-1">
                        <div className="flex-">
                            <p className="text-sm mb-2 text-gray-700">Start Time</p>
                            <TimeInput value={item.start} onChange={(v) => updateTime(item.id, "start", v)} />
                        </div>

                        <FiArrowRight className="mt-6 text-gray-600" size={18} />

                        <div className="flex-">
                            <p className="text-sm mb-2 text-gray-700">End Time</p>
                            <TimeInput value={item.end} onChange={(v) => updateTime(item.id, "end", v)} />
                        </div>
                    </div>

                    {data.length > 1 && (
                        <button
                            onClick={() => setData((prev) => prev.filter((p) => p.id !== item.id))}
                            className="mt-6 text-red-500 hover:text-red-600 text-sm font-medium"
                        >
                            Delete
                        </button>
                    )}

                    {!isEndTimeValid(item.start, item.end) && (
                        <p className="text-red-500 text-xs mt-1">End time must be later than start time</p>
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


function Toast({ text, type, onClose }: { text: string; type: ToastType; onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const isSuccess = type === "success";

    return (
        <div
            className={`fixed w-[280px] bottom-20 z-50 left-1/2 justify-center -translate-x-1/2 
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