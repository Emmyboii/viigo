import { useAppContext } from "../context/AppContext";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import GymHorizontalCard from "../components/GymHorizontalCard";
import SearchModal from "../components/SearchModal";
import Footer from "../components/Footer";
import MapView from "../components/MapView";
import { IoArrowBack, IoSearchSharp } from "react-icons/io5";
import FilterModal from "../components/FilterModal";
import { HiFilter } from "react-icons/hi";

export default function Explore() {
    const {
        searchResults,
        searchLoading,
        fetchFilteredGyms,
        fetchSortedGyms,
        sortLabel
    } = useAppContext();
    const location = useLocation();
    // const navigate = useNavigate();


    const [showFilter, setShowFilter] = useState(false);

    const [showSearch, setShowSearch] = useState(false);
    const [view, setView] = useState<"map" | "list">("map");

    useEffect(() => {
        if (location.state?.openFilter) {
            setShowFilter(true);
        }
    }, [location.state]);

    useEffect(() => {
        if (location.state?.openSearch) {
            setShowSearch(true);
        }
    }, [location.state]);

    useEffect(() => {
        if (location.state?.sort) {
            fetchSortedGyms(
                location.state.sort,
                location.state.sortLabel
            );
        }
    }, [location.state]);

    // When results come in → switch to list view
    useEffect(() => {
        if (searchResults.length > 0) {
            setView("list");
        }
    }, [searchResults]);

    const handleApplyFilter = async (filters: any) => {
        setShowFilter(false);

        await fetchFilteredGyms(filters);

        setView("list");
    };

    return (
        <div className="relative h-screen bg-white">
            {/* MAP VIEW */}
            {view === "map" && (
                <div className="relative h-full bg-white">

                    <MapView />

                    {/* Search Bar */}
                    <div
                        onClick={() => setShowSearch(true)}
                        className="absolute top-6 left-4 right-16 mr-2 border-[#94A3B8] border bg-white rounded-2xl px-4 py-4 flex items-center shadow-md cursor-pointer"
                    >
                        <IoSearchSharp className="mr-3 text-xl text-gray-500" />
                        <p className="text-sm text-gray-500">
                            Search for Hourly Gyms
                        </p>
                    </div>

                    {/* Filter Button */}
                    <button
                        title="filter"
                        onClick={() => setShowFilter(true)}
                        className="absolute top-6 right-4 bg-white w-12 h-12 rounded-full text-[#94A3B8] border border-[#94A3B8] shadow-md flex items-center justify-center"
                    >
                        <HiFilter />
                    </button>

                </div>
            )}

            {/* LIST VIEW */}
            {view === "list" && (
                <div className="p-4 h-full overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            title="map"
                            onClick={() => {
                                setView("map");
                            }}
                        >
                            <IoArrowBack size={22} />
                        </button>

                        <div
                            onClick={() => setShowSearch(true)}
                            className="flex items-center flex-1 border rounded-xl px-3 py-3 cursor-pointer"
                        >
                            <IoSearchSharp className="mr-2 text-xl text-gray-500" />
                            <p className="text-sm text-gray-600">
                                Search again
                            </p>
                        </div>
                    </div>

                    {sortLabel && (
                        <div className="px-4 pb-2">
                            <div className="inline-flex items-center gap-2 bg-[#DBEAFE] text-[#2563EB] px-3 py-1.5 rounded-lg text-sm">
                                ↕ Sort By : {sortLabel}
                            </div>
                        </div>
                    )}

                    {/* Loading */}
                    {searchLoading && (
                        <p className="text-center py-6">Searching...</p>
                    )}

                    {/* Empty */}
                    {!searchLoading && searchResults.length === 0 && (
                        <p className="text-center py-6 text-gray-400">
                            No gyms found
                        </p>
                    )}

                    {/* Results */}
                    <div className="space-y-4">
                        {searchResults.map((gym) => (
                            <GymHorizontalCard key={gym.id} gym={gym} />
                        ))}
                    </div>
                </div>
            )}

            {/* SEARCH MODAL */}
            {showSearch && (
                <SearchModal
                    onClose={() => setShowSearch(false)}
                    from={location.state?.from}
                />
            )}

            {showFilter && (
                <FilterModal
                    onClose={() => setShowFilter(false)}
                    onApply={handleApplyFilter}
                />
            )}

            <Footer />
        </div>
    );
}