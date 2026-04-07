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
import { useRef } from "react";
import SelectionModal from "../components/SelectionModal";
import { MdError } from "react-icons/md";
import { RiArrowRightSLine } from "react-icons/ri";

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
    error?: string;
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
    distance: string;
    address_line_1: string,
    gender_preference: "EVERYONE" | "WOMEN_ONLY" | "MEN_ONLY",
    area: string,
    city: string,
    state: string,
    postal_code: string,
    open_time: string;
    longitude: string;
    latitude: string;
    close_time: string;
    amenities: Amenity[];
    rules: Rule[];
    images: { id: number; image: string }[];

    peak_morning?: ([string, string] | { start: string; end: string })[];
    peak_evening?: ([string, string] | { start: string; end: string })[];
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
    const [bookingFor, setBookingFor] = useState(gym?.gender_preference);
    const [price, setPrice] = useState(gym?.hourly_rate || "");
    const [phone, setPhone] = useState(gym?.phone_number || "+91 ");
    const [location, setLocation] = useState(gym?.location || "");
    const [addressLine1, setAddressLine1] = useState(gym?.address_line_1 || "");
    const [area, setArea] = useState(gym?.area || "");
    const [city, setCity] = useState(gym?.city || "");
    const [state, setState] = useState(gym?.state || "");
    const [postalCode, setPostalCode] = useState(gym?.postal_code || "");
    const [locationModal, setLocationModal] = useState(false);
    const [startTime, setStartTime] = useState(gym?.open_time || "00:00");
    const [endTime, setEndTime] = useState(gym?.close_time || "00:01");
    // const [latitude, setLatitude] = useState<string>(gym?.latitude || "");
    // const [longitude, setLongitude] = useState<string>(gym?.longitude || "");

    const [priceError, setPriceError] = useState("");

    useEffect(() => {
        if (price && Number(price) > 200) {
            setPriceError("Price cannot be greater than 200");
        } else {
            setPriceError("");
        }
    }, [price]);

    const [morningPeak, setMorningPeak] = useState<PeakHour[]>(() => {
        if (gym?.peak_morning && gym.peak_morning.length > 0) {
            return gym.peak_morning.map((item) => {
                if (Array.isArray(item)) {
                    // It's a [start, end] tuple
                    const [start, end] = item;
                    return { id: crypto.randomUUID(), start, end };
                } else {
                    // It's already an object { start, end }
                    return { id: crypto.randomUUID(), start: item.start, end: item.end };
                }
            });
        }

        return [{ id: crypto.randomUUID(), start: "00:00", end: "00:01" }];
    });

    const [eveningPeak, setEveningPeak] = useState<PeakHour[]>(() => {
        if (gym?.peak_evening && gym.peak_evening.length > 0) {
            return gym.peak_evening.map((item) => {
                if (Array.isArray(item)) {
                    const [start, end] = item;
                    return { id: crypto.randomUUID(), start, end };
                } else {
                    return { id: crypto.randomUUID(), start: item.start, end: item.end };
                }
            });
        }

        return [
            {
                id: crypto.randomUUID(),
                start: "16:00",
                end: gym?.close_time || "00:01",
            },
        ];
    });

    useEffect(() => {
        const handlePopState = (e: PopStateEvent) => {
            if (e.state?.display) {
                setDisplay(e.state.display as "details" | "edit" | "create");
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [setDisplay]);

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
    const [visibleAmenities2, setVisibleAmenities2] = useState<Amenity[]>([])
    const [visibleRules, setVisibleRules] = useState<Rule[]>([])

    const [modalType, setModalType] = useState<"amenities" | "rules" | null>(null);

    useEffect(() => {
        if (modalType === "amenities" || modalType === "rules" || locationModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [modalType, locationModal]);

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

    const geocodeAddress = async (address: string) => {
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

        const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                address
            )}&components=country:IN&key=${apiKey}`
        );

        const data = await res.json();

        if (data.status !== "OK") {
            console.error(data);
            throw new Error("Failed to geocode address");
        }

        const { lat, lng } = data.results[0].geometry.location;

        return {
            lat: lat.toFixed(6),
            lng: lng.toFixed(6),
        };
    };

    useEffect(() => {
        if (!gym) return;

        const formatted = JSON.stringify({
            name: gym?.name,
            gender_preference: gym?.gender_preference,
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
            gender_preference: bookingFor,
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
        bookingFor,
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
                setVisibleAmenities2(data.data.slice(0, 10));

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

        if (Number(price) > 200) {
            setPriceError("Price cannot be greater than 200");
            return;
        }

        (document.activeElement as HTMLElement)?.blur();

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", gymName);
            formData.append("gender_preference", bookingFor);
            formData.append("hourly_rate", price);
            formData.append("phone_number", phone);
            formData.append("location", location);
            formData.append("open_time", startTime);
            formData.append("close_time", endTime);

            formData.append("address_line_1", addressLine1);
            formData.append("area", area);
            formData.append("city", city);
            formData.append("state", state);
            formData.append("postal_code", postalCode);

            const { lat, lng } = await geocodeAddress(location);

            formData.append("latitude", lat);
            formData.append("longitude", lng);

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



            const message =
                display === "edit"
                    ? "Changes saved successfully!"
                    : "Gym created successfully!";
            setToast({ type: "success", message });

            setTimeout(() => {
                setDisplay("details");
                localStorage.setItem("gymDisplay", "details");
                if (window.history.state?.display === "edit") {
                    window.history.back();
                }
            }, 1500);

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

    const MORNING_END_LIMIT = "11:59";
    const EVENING_START_LIMIT = "16:00";

    const isMorningValid = (p: PeakHour, gymStartTime: string) => {
        if (!p.start || !p.end) return false;

        const start = timeToMinutes(p.start);
        const end = timeToMinutes(p.end);

        return (
            start >= timeToMinutes(gymStartTime) &&
            end <= timeToMinutes(MORNING_END_LIMIT) &&
            end > start
        );
    };

    const isEveningValid = (p: PeakHour, gymEndTime: string) => {
        if (!p.start || !p.end) return false;

        const start = timeToMinutes(p.start);
        const end = timeToMinutes(p.end);

        return (
            start >= timeToMinutes(EVENING_START_LIMIT) &&
            end <= timeToMinutes(gymEndTime) &&
            end > start
        );
    };


    const isFormValid =
        bookingFor &&
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
        morningPeak.every((p) => isMorningValid(p, startTime)) &&
        eveningPeak.every((p) => isEveningValid(p, endTime));

    return (
        <div className="min-h-screen pb-32 mk:bg-[#CBD5E1] max-w-[1900px] mk:mx-auto w-screen mk:w-full">
            {/* Header */}
            <div className="flex items-center justify-between mk:p-4 bg-white">
                <div className="flex items-center gap-3 p-4 bg-white cursor-pointer">
                    <FiArrowLeft
                        onClick={() => {
                            if (display === "edit" && gym?.images.length !== 0) {
                                setDisplay("details");
                                localStorage.setItem("gymDisplay", "details");
                                if (window.history.state?.display === "edit") {
                                    window.history.back();
                                }
                            } else if (display === "create") {
                                navigate(-1)
                            } else {
                                navigate(-1)
                            }
                        }}
                        size={20} />
                    <h1 className="font-semibold text-lg">Edit Gym Details</h1>
                </div>

                <div className="mk:flex hidden items-center gap-4">
                    <button
                        onClick={() => {
                            if (display === "edit" && gym?.images.length !== 0) {
                                setDisplay("details");
                                localStorage.setItem("gymDisplay", "details");
                                if (window.history.state?.display === "edit") {
                                    window.history.back();
                                }
                            } else if (display === "create") {
                                navigate(-1)
                            } else {
                                navigate(-1)
                            }
                        }}
                        className={`bg-white border border-[#CBD5E1] cursor-pointer rounded-md text-sm font-semibold py-3 px-4`}
                    >
                        Cancel
                    </button>

                    <button
                        disabled={!isFormValid || isLoading || !isChanged || Number(price) > 200}
                        onClick={handleSubmit}
                        className={`w-full py-3 px-4 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition ${isFormValid && !isLoading && isChanged && Number(price) <= 200
                            ? "bg-[#2563EB] text-white cursor-pointer"
                            : "bg-[#CBD5E1] text-[#FFFFFF] cursor-not-allowed"
                            }`}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                            </div>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </div>

            {toast && <Toast type={toast.type} text={toast.message} onClose={handleToastClose} />}

            <div className="p-4 lj:p-14 lg:p-6 lg:space-y-6 mk:space-y-4 space-y-6">
                <div className="mk:grid grid-cols-2 lj:gap-12 lg:gap-6 gap-4">
                    <div className="lg::space-y-6 mk:space-y-4">
                        <div className="lg:p-6 mk:p-4 space-y-6 bg-white mk:border border-[#CBD5E1] mk:rounded-lg">

                            <p className="hidden mk:block text-[22px] font-semibold text-[#0F172A]">General Information</p>
                            {/* Gym Name */}
                            <Input label="Gym Name" value={gymName} onChange={setGymName} />

                            <div className="relative">
                                <p className="text-base mb-1 text-[#0F172A] font-semibold">Who Can Book This Gym?</p>
                                <div className="flex items-start gap-6 flex-col mt-6">
                                    <label className="flex items-center mr-4 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="bookingFor"
                                            value="EVERYONE"
                                            checked={bookingFor === "EVERYONE"}
                                            onChange={() => setBookingFor("EVERYONE")}
                                            className="w-4 h-4 accent-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-[#0F172A]">Everyone</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="bookingFor"
                                            value="WOMEN_ONLY"
                                            checked={bookingFor === "WOMEN_ONLY"}
                                            onChange={() => setBookingFor("WOMEN_ONLY")}
                                            className="w-4 h-4 accent-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-[#0F172A]">Women Only</span>
                                    </label>
                                </div>

                                <p className="text-[#475569] text-[11px] pt-6">
                                    <CiCircleAlert className="inline mr-0.5 text-sm" />
                                    Tip: This setting helps us show your gym to the appropriate audience.
                                </p>
                            </div>

                            <div>
                                <Input2
                                    label="How much do you charge per hour?"
                                    placeholder="Example ₹150/Hour"
                                    value={price}
                                    onChange={setPrice}
                                    error={priceError}
                                />

                                <p className="text-[#475569] text-[11px] pt-2">
                                    <CiCircleAlert className="inline mr-0.5 text-sm" />
                                    Tip: Set a nominal price to attract more customers. You can edit this anytime
                                </p>
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

                            <div>
                                <p className="text-base mb-1 text-[#0F172A] font-semibold">Location</p>

                                <div
                                    onClick={() => {
                                        setLocationModal(true)
                                        window.history.pushState({ modal: "location" }, "");
                                    }}
                                    className="flex items-center justify-between gap-3 border border-[#475569] h-[50px] rounded-lg px-3 py-2 bg-white cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 text-sm text-[#0F172A] truncate">
                                        <FiMapPin className="text-[#475569]" />
                                        {location || "Select Gym Location"}
                                    </div>

                                    <RiArrowRightSLine className="text-[#475569] text-[24px]" />
                                </div>
                            </div>
                        </div>

                        <div className="lg:p-6 mk:p-4 space-y-6 bg-white mk:border border-[#CBD5E1] mk:rounded-lg min-h-[200px] mk:block hidden">
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
                                                className="absolute -top-2 -right-2 cursor-pointer bg-white p-1 rounded-full shadow"
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
                        </div>
                    </div>

                    <div className="lg::space-y-6 mk:space-y-4">
                        <div className="lg:p-6 mk:p-4 space-y-6 bg-white mk:border border-[#CBD5E1] mk:rounded-lg">
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
                                gymStartTime={startTime}
                            />

                        </div>

                        {/* Amenities */}
                        <div className="mk:pt-6 lg:px-6 mk:px-4 space-y-6 bg-white mk:border border-[#CBD5E1] mk:rounded-lg mk:block hidden">
                            <Section title="Amenities">
                                <div className="flex flex-wrap gap-3 mt-2">
                                    {visibleAmenities2.map((item) => {
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
                                                className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition cursor-pointer
                                        ${active
                                                        ? "bg-blue-100 border-blue-500 text-blue-600"
                                                        : "bg-[#F1F5F9] text-[#0F172A]"
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
                                    onClick={() => {
                                        setModalType("amenities")
                                        window.history.pushState({ modal: "amenities" }, "");
                                    }}
                                    className="mt-6 w-full bg-[#F1F5F9] py-3 rounded-md mb-10 text-[#94A3B8] font-semibold text-sm"
                                >
                                    Add More
                                </button>
                            </Section>
                        </div>
                    </div>
                </div>

                {/* Photos */}
                <div className="mk:hidden">
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
                                        className="absolute -top-2 -right-2 bg-white p-1 rounded-full shadow cursor-pointer"
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
                </div>

                {/* Amenities */}
                <div className="mk:hidden">
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
                                        className={`flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer text-xs font-medium transition
                                        ${active
                                                ? "bg-blue-100 border-blue-500 text-blue-600"
                                                : "bg-[#F1F5F9] text-[#0F172A]"
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
                            onClick={() => {
                                setModalType("amenities")
                                window.history.pushState({ modal: "amenities" }, "");
                            }}
                            className="mt-6 w-full bg-[#F1F5F9] cursor-pointer py-3 rounded-md mb-10 text-[#94A3B8] font-semibold text-sm"
                        >
                            Add More
                        </button>
                    </Section>
                </div>

                {/* Rules */}
                <div className="mk:pt-6 lg:px-6 px-4 space-y-6 bg-white mk:border border-[#CBD5E1] mk:rounded-lg">
                    <Section title="Rules">
                        <div className="space-y-3">
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
                                        className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition
                                        ${active ? "border-[#2563EB] bg-blue-50" : "border-[#E2E8F0]"}
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

                                        <p className="text-sm flex-1 text-gray-700">{item.description}</p>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => {
                                setModalType("rules")
                                window.history.pushState({ modal: "rules" }, "");
                            }}
                            className="mt-6 w-full bg-[#F1F5F9] cursor-pointer py-3 rounded-md mb-10 text-[#94A3B8] font-semibold text-sm"
                        >
                            Add More
                        </button>
                    </Section>
                </div>
            </div>

            {/* Save Button */}
            <div className="fixed z-50 mk:hidden bottom-0 left-0 right-0 bg-white p-4 border-t">
                <button
                    disabled={!isFormValid || isLoading || !isChanged || Number(price) > 200}
                    onClick={handleSubmit}
                    className={`w-full py-4 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition ${isFormValid && !isLoading && isChanged && Number(price) <= 200
                        ? "bg-[#2563EB] text-white cursor-pointer"
                        : "bg-[#CBD5E1] text-[#FFFFFF] cursor-not-allowed"
                        }`}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                        </div>
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
                    title2={modalType === "amenities" ? `amenities` : `rules`}
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
                            ? window.innerWidth > 850
                                ? visibleAmenities2.map((a) => a.id)
                                : visibleAmenities.map((a) => a.id)
                            : visibleRules.map((r) => r.id)
                    }
                    onClose={() => {
                        setModalType(null)
                        window.history.back();
                    }}
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
                        window.history.back();
                    }}
                />
            )}



            <LocationModal
                open={locationModal}
                onClose={() => {
                    setLocationModal(false)
                    window.history.back();
                }}
                addressLine1={addressLine1}
                area={area}
                city={city}
                state={state}
                postalCode={postalCode}
                onSave={(data) => {
                    setAddressLine1(data.address_line_1);
                    setArea(data.area);
                    setCity(data.city);
                    setState(data.state);
                    setPostalCode(data.postal_code);

                    setLocation(
                        `${data.address_line_1}, ${data.area}, ${data.city}, ${data.state} ${data.postal_code}`
                    );
                }}
            />

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

const Input2 = ({ label, value, onChange, placeholder, icon, error }: InputProps) => {
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

            {error && (
                <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
        </div>
    );
};

const TimeInput = ({ value, onChange }: TimeInputProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        inputRef.current?.showPicker?.(); // modern browsers
        inputRef.current?.focus();
    };

    return (
        <div
            onClick={handleClick}
            className="flex items-center justify-center bg-white rounded-lg px-3 py-2 w-full shadow-sm cursor-pointer"
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

            <div className="bg-[#DBEAFE] mk:bg-[#BFDBFE] rounded-lg p-3 py-5">
                <div className="flex items-center justify-between gap-1">
                    <div className="flex-">
                        <p className="text-sm mb-2 text-[#0F172A] font-medium">Start Time</p>
                        <TimeInput value={start} onChange={setStart} />
                    </div>

                    <FiArrowRight className="mt-6 text-gray-600" size={18} />

                    <div className="flex-">
                        <p className="text-sm mb-2 text-[#0F172A] font-medium">End Time</p>
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
    gymEndTime,
    gymStartTime
}: {
    morning: PeakHour[];
    evening: PeakHour[];
    setMorning: React.Dispatch<React.SetStateAction<PeakHour[]>>;
    setEvening: React.Dispatch<React.SetStateAction<PeakHour[]>>;
    gymEndTime: string
    gymStartTime: string
}) => {
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Set Gym Peak Hours</h2>

            <PeakSection
                title="Morning"
                data={morning}
                setData={setMorning}
                icon={<FiSun size={16} />}
                gymStartTime={gymStartTime}
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
    gymStartTime
}: {
    title: string;
    icon: React.ReactNode;
    data: PeakHour[];
    setData: React.Dispatch<React.SetStateAction<PeakHour[]>>;
    gymEndTime?: string;
    gymStartTime?: string;
}) => {
    const addMore = () => {
        setData((prev) => [
            ...prev,
            { id: crypto.randomUUID(), start: "00:00", end: "00:00" },
        ]);
    };

    useEffect(() => {
        if (!gymEndTime) return;

        const endLimit = timeToMinutes(gymEndTime);
        const minStart = timeToMinutes("16:00");

        setData((prev) =>
            prev.map((p) => {
                let start = p.start;
                let end = p.end;

                if (timeToMinutes(start) < minStart) {
                    start = "16:00";
                }

                if (timeToMinutes(end) > endLimit) {
                    end = gymEndTime;
                }

                return { ...p, start, end };
            })
        );
    }, [gymEndTime, setData]);

    useEffect(() => {
        if (title !== "Morning" || !gymStartTime) return;

        setData((prev) =>
            prev.map((p) => {
                let start = p.start;
                let end = p.end;

                if (timeToMinutes(start) < timeToMinutes(gymStartTime)) {
                    start = gymStartTime;
                }

                if (timeToMinutes(end) > timeToMinutes("11:59")) {
                    end = "11:59";
                }

                return { ...p, start, end };
            })
        );
    }, [gymStartTime, title, setData]);

    const updateTime = (id: string, field: "start" | "end", value: string) => {
        setData((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    return (
        <div className="bg-[#DBEAFE] mk:bg-[#BFDBFE] rounded-lg p-3 py-5 space-y-5">
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
                            className="mt-6 text-red-500 cursor-pointer hover:text-red-600 text-sm font-medium"
                        >
                            Delete
                        </button>
                    )}

                    {!isEndTimeValid(item.start, item.end) && (
                        <p className="text-red-500 text-xs mt-1">End time must be later than start time</p>
                    )}

                    {title === "Morning" && (
                        <>
                            {timeToMinutes(item.start) < timeToMinutes(gymStartTime || "00:00") && (
                                <p className="text-red-500 text-xs">
                                    Morning peak must start after gym opening time
                                </p>
                            )}

                            {timeToMinutes(item.end) > timeToMinutes("11:59") && (
                                <p className="text-red-500 text-xs">
                                    Morning peak must end before 11:59 AM
                                </p>
                            )}
                        </>
                    )}

                    {title === "Evening" && (
                        <>
                            {timeToMinutes(item.start) < timeToMinutes("16:00") && (
                                <p className="text-red-500 text-xs">
                                    Evening peak must start from 4:00 PM
                                </p>
                            )}

                            {timeToMinutes(item.end) > timeToMinutes(gymEndTime || "23:59") && (
                                <p className="text-red-500 text-xs">
                                    Evening peak cannot exceed gym closing time
                                </p>
                            )}
                        </>
                    )}

                    {(index === data.length - 1 && title === "Morning") && (
                        <button
                            onClick={addMore}
                            className="w-full bg-[#F1F5F9] cursor-pointer text-[#94A3B8] py-2 rounded-md text-xs font-medium hover:bg-blue-300 transition"
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
        <h2 className="font-semibold text-[#0F172A] mb-2">{title}</h2>
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

interface LocationModalProps {
    open: boolean
    onClose: () => void

    addressLine1: string
    area: string
    city: string
    state: string
    postalCode: string

    onSave: (data: {
        address_line_1: string
        area: string
        city: string
        state: string
        postal_code: string
    }) => void
}

function LocationModal({
    open,
    onClose,
    onSave,
    addressLine1,
    area,
    city,
    state,
    postalCode
}: LocationModalProps) {

    const [line1, setLine1] = useState(addressLine1);
    const [line2, setLine2] = useState(area);
    const [cityValue, setCity] = useState(city);
    const [stateValue, setState] = useState(state);
    const [zip, setZip] = useState(postalCode);


    useEffect(() => {
        if (!open) return;

        window.history.pushState({ modal: "location" }, "");

        const handlePopState = () => {
            onClose();
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, [open, onClose]);

    if (!open) return null;

    const handleSubmit = () => {
        if (!line1 || !cityValue || !stateValue || !zip) return;

        onSave({
            address_line_1: line1,
            area: line2,
            city: cityValue,
            state: stateValue,
            postal_code: zip
        });

        onClose();
    };

    return (
        <>
            {window.innerWidth >= 850 && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 bg-black/40 z-50"
                />
            )}
            <div className={`fixed z-50 bg-white overflow-y-auto inset-0 mk:inset-auto mk:right-0 mk:top-0 mk:min-h-screen mk:w-[480px] ${window.innerWidth >= 850 ? "animate-slideRight" : "animate-slideUp"}`}>
                <div className="bg-white w-full p-5 h-screen flex flex-col">


                    <div className="flex-1 space-y-4 overflow-y-auto">
                        <div className="flex items-center gap-3 mb-2">
                            <FiArrowLeft onClick={onClose} className="cursor-pointer" />
                            <h2 className="font-semibold text-lg">Add Gym Location</h2>
                        </div>

                        <LocationInput label="Address" value={line1} onChange={setLine1} />
                        <LocationInput label="Area" value={line2} onChange={setLine2} />
                        <LocationInput label="City" value={cityValue} onChange={setCity} />
                        <LocationInput label="State" value={stateValue} onChange={setState} />
                        <div className='mt-4'>
                            <p className="text-sm text-[#0F172A] mb-1">ZIP / Postal Code</p>
                            <input
                                value={zip}
                                title="zip"
                                onChange={(e) => setZip(e.target.value)}
                                className="border border-[#475569] w-1/2 rounded-lg px-3 py-3 outline-none placeholder:text-sm"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full bg-blue-600 cursor-pointer text-white py-3 rounded-xl font-medium mt-4"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </>
    );
}

function LocationInput({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div>
            <p className="text-sm text-[#0F172A] mb-1">{label}</p>
            <input
                value={value}
                title="location"
                onChange={(e) => onChange(e.target.value)}
                className="border border-[#475569] w-full rounded-lg px-3 py-3 outline-none"
            />
        </div>
    );
}