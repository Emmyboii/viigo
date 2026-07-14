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
import { useEffect, useState } from "react";
import SortModal from "../components/SortModal";
import { FaFilter } from "react-icons/fa";
import { BiSortAlt2 } from "react-icons/bi";
import { GymCardSkeleton, GymHorizontalCardSkeleton } from "../components/Gymskeletons ";
import NetworkErrorModal from "../components/NetworkErrorModal";

export default function UserHome() {

    const { recommendedGyms, nearbyGyms, loading2, isOffline, networkError } = useAppContext()

    const navigate = useNavigate();
    const [activeId, setActiveId] = useState("");
    const [showSortModal, setShowSortModal] = useState(false);

    const [emblaRef] = useEmblaCarousel({
        align: "start",
        dragFree: false,
        containScroll: "trimSnaps",
    });

    const chipData = [
        { id: "filters", label: "Filters", icon: <FaFilter /> },
        { id: "sort", label: "Sort By", icon: <BiSortAlt2 className="text-xl" /> },
    ];

    const openSortModal = () => {
        setShowSortModal(true);
        window.history.pushState({ modal: "sort" }, "");
    };

    const closeSortModal = () => {
        setShowSortModal(false);
        if (window.history.state?.modal === "sort") {
            window.history.back();
        }
    };

    useEffect(() => {
        const handlePopState = () => {
            if (showSortModal) setShowSortModal(false);
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [showSortModal]);

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
                        navigate("/explore", { state: { openFilter: true, from: location.pathname } });
                    }
                    if (id === "sort") {
                        openSortModal();
                    }
                }}
            />

            {/* ===== Recommended Section ===== */}
            <SectionHeader title="Recommended For You" url="/gyms/recommended" />

            {loading2 ? (
                <div className="overflow-hidden py-2">
                    <div className="flex gap-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex-[0_0_73%]">
                                <GymCardSkeleton />
                            </div>
                        ))}
                    </div>
                </div>
            ) : recommendedGyms.length === 0 ? (
                <p className="text-center text-gray-400 py-6">
                    No recommended gyms available
                </p>
            ) : (
                <div className="overflow-hidden py-2" ref={emblaRef}>
                    <div className="flex gap-3.5 embla__container">
                        {recommendedGyms.map((gym, index) => (
                            <div
                                key={index}
                                className={`embla__slide min-w-0 ${recommendedGyms.length === 1
                                        ? "w-full"
                                        : "basis-[73%] shrink-0 grow-0"
                                    }`}
                            >
                                <GymCard gym={gym} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ===== Nearby Section ===== */}
            <SectionHeader title="Hourly Gyms Near You" url="/gyms/nearby" />

            {loading2 ? (
                <div className="space-y-4 mb-20">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <GymHorizontalCardSkeleton key={i} />
                    ))}
                </div>
            ) : nearbyGyms.length === 0 ? (
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

            {(isOffline || networkError) && <NetworkErrorModal />}

            {showSortModal && (
                <SortModal
                    onClose={closeSortModal}
                    onSelect={(value, label) => {
                        navigate("/explore", {
                            state: { sort: value, sortLabel: label },
                            replace: true,
                        });
                        setShowSortModal(false);
                    }}
                    currentSort=""
                />
            )}

            <Footer />
        </Container>
    );
}