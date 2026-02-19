import FilterChips from "../components/FilterChips"
import Container from "../components/layout/Container"
import PageHeader from "../components/PageHeader"
import SearchBar from "../components/SearchBar"
import gym1 from '../assets/gymImg.png'
import gym2 from '../assets/gymImg2.png'
import gym3 from '../assets/gymImg3.png'
import gym4 from '../assets/gymImg4.png'
import gym5 from '../assets/gymImg5.png'
import gym6 from '../assets/gymImg6.png'
import type { Gym } from "../components/types/gym"
import ImageCarousel from "../components/ImageCarousel"
import { HiLocationMarker } from "react-icons/hi"
import { CiCalendar } from "react-icons/ci"
import { FiClock } from "react-icons/fi"
import Footer from "../components/Footer"

const Bookings = () => {

    const chipData = [
        { id: "upcoming", label: "Upcoming X" },
        { id: "past", label: "Past" },
        { id: "cancelled", label: "Cancelled" },
        { id: "all", label: "All" },
    ];

    const bookings: Gym[] = [
        {
            name: "Cure Fitness",
            images: [gym4, gym5],
            distance: "0.7Km",
            location: "Chromepet",
            open: "Open Till 11 PM",
            price: 120,
            facilities: ["Restroom", "Locker"],
        },
        {
            name: "Flex Zone Gym",
            images: [gym2, gym3, gym6],
            distance: "1.5Km",
            location: "Pallavaram",
            open: "Open Till 10 PM",
            price: 150,
            facilities: ["Locker", "Parking"],
        },
        {
            name: "Urban Strength",
            images: [gym3, gym6],
            distance: "0.9Km",
            location: "Tambaram",
            open: "Open Till 9:30 PM",
            price: 180,
            facilities: ["Trainer", "Restroom"],
        },
        {
            name: "Lift & Burn Studio",
            images: [gym4, gym5, gym6],
            distance: "2.4Km",
            location: "Velachery",
            open: "Open Till 10 PM",
            price: 200,
            facilities: ["Trainer", "Shower", "Locker"],
        },
        {
            name: "Rapid Fitness Club",
            images: [gym1, gym2],
            distance: "3.1Km",
            location: "Guindy",
            open: "Open Till 11 PM",
            price: 140,
            facilities: ["Restroom", "Parking"],
        },
    ];

    return (
        <Container>

            <PageHeader text="Bookings" />

            <div className="pt-14" />

            <SearchBar />
            <FilterChips items={chipData} />

            <div className="space-y-4 mb-20 mt-8">
                {bookings.map((gym, index) => (
                    <div key={index} className="bg-white rounded border border-[#E2E8F0] min-h-[140px] h-full flex gap-3">
                        <div className="w-28 rounded-tl rounded-bl h-full overflow-hidden">
                            <ImageCarousel images={gym.images} height="h-40" />
                        </div>

                        <div className="flex flex-col justify-between w-full p-3">

                            <div className="space-y-1.5">
                                <h3 className="font-normal">{gym.name}</h3>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <HiLocationMarker className="text-[#475569] text-xl" />
                                    G.S.T Road, {gym.location}
                                </p>

                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <CiCalendar className="text-[#475569] text-xl" />
                                    Date and Time : 5th December
                                </p>

                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <FiClock className="text-[#475569] text-xl" />
                                    Time : 11AM  - 12:30 PM
                                </p>
                            </div>

                            <div className="flex justify-between items-center mt-2 gap-2">
                                <span className="font-normal text-sm text-nowrap">₹{gym.price}/1.5 Hr</span>
                                <button className="bg-white rounded-full border text-nowrap border-[#CBD5E1] text-[#475569] text-[11px] px-2.5 py-2">
                                    Booking ID : #23242Q
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Footer />
        </Container>
    )
}

export default Bookings