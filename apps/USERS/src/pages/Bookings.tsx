import FilterChips from "../components/FilterChips"
import Container from "../components/layout/Container"
import PageHeader from "../components/PageHeader"
import SearchBar from "../components/SearchBar"
import { HiLocationMarker } from "react-icons/hi"
import { CiCalendar } from "react-icons/ci"
import { FiClock } from "react-icons/fi"
import Footer from "../components/Footer"
import { useEffect, useState } from "react"
import BookingModal from "../components/BookingModal"

export type Booking = {
    id: number;
    booking_reference: string;
    gym_name: string;
    gym_location: string;
    gym_image: string;
    display_date: string;
    display_time: string;
    price_tag: string;
    status: "PENDING" | "CONFIRMED" | "CANCELLED";
};

const Bookings = () => {

    const chipData = [
        { id: "upcoming", label: "Upcoming", icon: '' },
        { id: "past", label: "Past", icon: '' },
        { id: "cancelled", label: "Cancelled", icon: '' },
        { id: "all", label: "All", icon: '' },
    ];

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("all");
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [showModal, setShowModal] = useState(false);

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await fetch(`${backendUrl}/client/bookings/my-bookings/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();
                setBookings(data.data);
            } catch (err) {
                console.error("Error fetching bookings", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const filteredBookings = bookings.filter((b) => {
        switch (activeFilter) {
            case "upcoming":
                return b.status === "PENDING";
            case "past":
                return b.status === "CONFIRMED";
            case "cancelled":
                return b.status === "CANCELLED";
            case "all":
            default:
                return true;
        }
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4 p-8 bg-white animate-fadeIn">
                    <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-700 text-lg font-medium">
                        Loading Bookings...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>

            {!showModal && (
                <div className="min-h-screen px-4 py-4">
                    <PageHeader text="Bookings" />

                    <div className="pt-14" />

                    <SearchBar />
                    <FilterChips
                        items={chipData}
                        activeId={activeFilter}
                        onChange={(id) => setActiveFilter(id)}
                    />
                    <div className="space-y-4 mb-20 mt-8">
                        {filteredBookings.length === 0 ? (
                            <div className="text-center text-gray-500 mt-10">
                                No bookings found for "{chipData.find(c => c.id === activeFilter)?.label}"
                            </div>
                        ) : (
                            filteredBookings.map((gym, index) => (
                                <div
                                    key={index}
                                    onClick={() => {
                                        setSelectedBooking(gym);
                                        setShowModal(true);
                                        localStorage.setItem("selectedBookingId", String(gym.id));
                                    }}
                                    className="bg-white rounded border border-[#E2E8F0] min-h-[140px] h-full flex gap-3"
                                >
                                    <img src={`http://api.viigo.in/${gym.gym_image}`} title="gym" className="w-24 min-h-full rounded-tl rounded-bl object-cover" />

                                    <div className="flex flex-col justify-between w-full p-3 pl-0">

                                        <div className="space-y-1.5">
                                            <h3 className="font-normal">{gym.gym_name}</h3>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <HiLocationMarker className="text-[#475569] text-xl" />
                                                {gym.gym_location}
                                            </p>

                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <CiCalendar className="text-[#475569] text-xl" />
                                                Date and Time : {gym.display_date}
                                            </p>

                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <FiClock className="text-[#475569] text-xl" />
                                                Time : {gym.display_time}
                                            </p>
                                        </div>

                                        <div className="flex flex-col justify-between items-start mt-4 gap-2">
                                            <span className="font-normal text-sm text-nowrap">{gym.price_tag}</span>
                                            <button className="bg-white rounded-full border border-[#CBD5E1] text-center text-[#475569] text-[11px] px-2.5 py-2">
                                                Booking ID : #{gym.booking_reference}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <Footer />

                </div>
            )}

            {showModal && selectedBooking && (
                <BookingModal
                    booking={selectedBooking}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    )
}

export default Bookings