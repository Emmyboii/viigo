import Container from "../components/layout/Container";
import LocationHeader from "../components/Header";
import SearchBar from "../components/SearchBar";
import FilterChips from "../components/FilterChips";
import SectionHeader from "../components/SectionHeader";
import GymCard from "../components/GymCard";
import GymHorizontalCard from "../components/GymHorizontalCard";
import gym1 from '../assets/gymImg.png'
import gym2 from '../assets/gymImg2.png'
import gym3 from '../assets/gymImg3.png'
import gym4 from '../assets/gymImg4.png'
import gym5 from '../assets/gymImg5.png'
import gym6 from '../assets/gymImg6.png'
import useEmblaCarousel from "embla-carousel-react";
import type { Gym } from "../components/types/gym";
import Footer from "../components/Footer";


export default function UserHome() {

    const [emblaRef] = useEmblaCarousel({
        align: "start",
        dragFree: false,
        containScroll: "trimSnaps",
    });

    const recommendedGyms: Gym[] = [
        {
            name: "Fight To Fitness",
            images: [gym1, gym2, gym3],
            distance: "0.8Km",
            location: "Pallavaram",
            open: "Open Till 10 PM",
            price: 370,
            facilities: ["Trainer", "Shower", "Locker", "Restroom", "Parking"],
        },
        {
            name: "Iron Core Gym",
            images: [gym2, gym5, gym6, gym4],
            distance: "1.2Km",
            location: "Chromepet",
            open: "Open Till 11 PM",
            price: 420,
            facilities: ["Trainer", "Locker", "Parking"],
        },
        {
            name: "Beast Mode Fitness",
            images: [gym3, gym4],
            distance: "0.5Km",
            location: "Tambaram",
            open: "Open Till 9 PM",
            price: 350,
            facilities: ["Trainer", "Shower", "Restroom"],
        },
        {
            name: "Powerhouse Arena",
            images: [gym1, gym2, gym3],
            distance: "2.1Km",
            location: "Velachery",
            open: "Open Till 12 AM",
            price: 500,
            facilities: ["Trainer", "Shower", "Locker", "Parking"],
        },
    ];

    const hourlyGyms: Gym[] = [
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
            <LocationHeader />
            <SearchBar />
            <FilterChips />

            <SectionHeader title="Recommended For You" />
            <div className="overflow-hidden py-2" ref={emblaRef}>
                <div className="flex gap-4">
                    {recommendedGyms.map((gym, index) => (
                        <div
                            key={index}
                            className="flex-[0_0_85%]"
                        >
                            <GymCard gym={gym} />
                        </div>
                    ))}
                </div>
            </div>


            <SectionHeader title="Hourly Gyms Near You" />
            <div className="space-y-4 mb-20">
                {hourlyGyms.map((gym, index) => (
                    <GymHorizontalCard key={index} gym={gym} />
                ))}
            </div>

            <Footer />
        </Container>
    );
}
