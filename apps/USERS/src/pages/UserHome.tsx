import Container from "../components/layout/Container";
import LocationHeader from "../components/Header";
import SearchBar from "../components/SearchBar";
import FilterChips from "../components/FilterChips";
import SectionHeader from "../components/SectionHeader";
import GymCard from "../components/GymCard";
import GymHorizontalCard from "../components/GymHorizontalCard";
import useEmblaCarousel from "embla-carousel-react";
import Footer from "../components/Footer";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import SortModal from "../components/SortModal";


export default function UserHome() {

    const { recommendedGyms, nearbyGyms, loading2 } = useAppContext()

    const navigate = useNavigate();
    const [activeId, setActiveId] = useState("");
    const [showSortModal, setShowSortModal] = useState(false);

    const [emblaRef] = useEmblaCarousel({
        align: "start",
        dragFree: false,
        containScroll: "trimSnaps",
    });

    const chipData = [
        { id: "filters", label: "Filters" },
        { id: "sort", label: "Sort By" },
        { id: "near", label: "Near Me" },
        { id: "women", label: "Women" },
        { id: "top_rated", label: "Top Rated" },
    ];

    if (loading2) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4 p-8 bg-white animate-fadeIn">
                    <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-700 text-lg font-medium">
                        Loading
                    </p>
                    <p className="text-gray-400 text-sm text-center">
                        This might take a few seconds. Sit tight!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <Container>
            <LocationHeader />
            <SearchBar />
            <FilterChips
                items={chipData}
                activeId={activeId}
                onChange={(id) => {
                    setActiveId(id);

                    if (id === "filters") {
                        navigate("/explore", { state: { openFilter: true } });
                    }

                    if (id === "sort") {
                        setShowSortModal(true);
                    }
                }}
            />
            
            <SectionHeader title="Recommended For You" url="/recommended" />

            {recommendedGyms.length === 0 ? (
                <p className="text-center text-gray-400 py-6">
                    No recommended gyms available
                </p>
            ) : (
                <div className="overflow-hidden py-2" ref={emblaRef}>
                    <div className="flex gap-4 embla__container">
                        {recommendedGyms.map((gym, index) => (
                            <div key={index} className={`embla__slide ${recommendedGyms.length === 1 ? "" : "flex-[0_0_85%] "}`}>
                                <GymCard gym={gym} />
                            </div>
                        ))}
                    </div>
                </div>
            )}


            <SectionHeader title="Hourly Gyms Near You" url="/nearby" />

            {nearbyGyms.length === 0 ? (
                <p className="text-center text-gray-400 py-6">
                    No gyms found near you
                </p>
            ) : (
                <div className="space-y-4 mb-20">
                    {nearbyGyms.map((gym, index) => (
                        <GymHorizontalCard key={index} gym={gym} />
                    ))}
                </div>
            )}

            {showSortModal && (
                <SortModal
                    onClose={() => setShowSortModal(false)}
                    onSelect={(value, label) => {
                        setShowSortModal(false);

                        navigate("/explore", {
                            state: {
                                sort: value,
                                sortLabel: label,
                            },
                        });
                    }}
                />
            )}

            <Footer />
        </Container>
    );
}
