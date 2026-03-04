import { useAppContext } from "../context/AppContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import GymHorizontalCard from "../components/GymHorizontalCard";
import SearchModal from "../components/SearchModal";
import Footer from "../components/Footer";
import MapView from "../components/MapView";
import { IoArrowBack, IoSearchSharp } from "react-icons/io5";
import FilterModal from "../components/FilterModal";
import { HiFilter, HiShare } from "react-icons/hi";
import FilterChips from "../components/FilterChips";
import SortModal from "../components/SortModal";
import { FaFilter } from "react-icons/fa";
import { BiSortAlt2 } from "react-icons/bi";

export default function Explore() {
    const {
        searchResults,
        searchLoading,
        fetchFilteredGyms,
        fetchSortedGyms,
        // sortLabel
    } = useAppContext();

    const location = useLocation();
    const navigate = useNavigate();

    const [query, setQuery] = useState("");

    const [filters, setFilters] = useState({
        sort: "price_high",
        radius: 5,
        min_price: "",
        max_price: "",
        amenities: [] as string[],
    });

    const [showFilter, setShowFilter] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [view, setView] = useState<"map" | "list">("map");
    const [showSortModal, setShowSortModal] = useState(false);
    const [activeId, setActiveId] = useState("");
    const [currentSortLabel, setCurrentSortLabel] = useState<string | null>(null);
    const chipData = [
        { id: "filters", label: "Filters", icon: <FaFilter /> },
        { id: "sort", label: "Sort By", icon: <BiSortAlt2 className="text-xl" /> },
    ];

    const chipData2 = [
        { id: "filters", label: "Filters", icon: <FaFilter /> },
    ];


    useEffect(() => {
        if (!location.pathname.startsWith("/explore")) {
            // user left /explore
            setView("map");
        }
    }, [location.pathname]);

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

    const handleApplyFilter = async (newFilters: any) => {
        setFilters(newFilters);   // store them
        setShowFilter(false);
        await fetchFilteredGyms(newFilters);
        setView("list");
        setCurrentSortLabel(null);
    };

    useEffect(() => {
        if (location.state?.sort) {
            fetchSortedGyms(
                location.state.sort,
                location.state.sortLabel
            );
        }
    }, [location.state]);

    useEffect(() => {
        if (location.state?.sort) {
            fetchSortedGyms(location.state.sort, location.state.sortLabel);
            setCurrentSortLabel(location.state.sortLabel);
            // setActiveId("sort");
        }
    }, [location.state]);

    useEffect(() => {
        if (view === "map") {
            setCurrentSortLabel(null);
            setActiveId("");
            setQuery("")

            if (location.state?.openFilter) {
                navigate(location.pathname, {
                    replace: true,
                    state: {
                        ...location.state,
                        openFilter: false,
                    },
                });
            }
        }
    }, [view]);

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
                    <div className="pt-12"></div>

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            onClick={() => setShowSearch(true)}
                            className="flex items-center flex-1 border rounded-xl px-3 py-3 cursor-pointer"
                        >
                            <IoSearchSharp className="mr-2 text-xl text-gray-500" />
                            <p className="text-sm text-gray-600">
                                {query ? query : "Search by Name or location"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full">
                        <FilterChips
                            items={currentSortLabel ? chipData2 : chipData}
                            activeId={activeId}
                            onChange={(id) => {
                                setActiveId(id);

                                if (id === "filters") {
                                    setShowFilter(true);
                                }

                                if (id === "sort") {
                                    setShowSortModal(true);
                                }
                            }}
                        />

                        {currentSortLabel && (
                            <div className="mt-4 w-full">
                                <button
                                    onClick={() => setShowSortModal(true)}
                                    className="inline-flex items-center text-nowrap gap-2 bg-[#DBEAFE] border border-[#2563EB] text-[#2563EB] px-3 py-1.5 rounded-lg text-sm w-full justify-center"
                                >
                                    <BiSortAlt2 className="text-xl" /> Sort By : {currentSortLabel}
                                </button>
                            </div>
                        )}
                    </div>

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

                    {!searchLoading && (
                        <>
                            <p className="text-[#94A3B8] text-sm my-3">{searchResults.length} Gym{searchResults.length > 1 && "s"} found</p>

                            {/* Results */}
                            <div className="space-y-4">
                                {searchResults.map((gym, i) => (
                                    <div key={i} className="mt-4">
                                        <div className="fixed top-0 left-0 right-0 z-40 bg-white flex items-center justify-between px-4 py-3" >

                                            <div className='flex items-center gap-2'>
                                                <button
                                                    onClick={() => {
                                                        setView("map");
                                                    }}
                                                    aria-label="Go back"
                                                    className="p-1"
                                                >
                                                    <IoArrowBack size={20} />
                                                </button>

                                                <span className="font-medium">Explore Gym</span>
                                            </div>

                                            <button
                                                aria-label="Share gym"
                                                className="p-1"
                                            >
                                                <HiShare className="text-[#475569]" size={20} />
                                            </button>
                                        </div>
                                        <GymHorizontalCard key={gym.id} gym={gym} />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* SEARCH MODAL */}
            {showSearch && (
                <SearchModal
                    onClose={() => setShowSearch(false)}
                    from={location.state?.from}
                    setQuery={setQuery}
                    query={query}
                />
            )}

            {showFilter && (
                <FilterModal
                    filters={filters}
                    onClose={() => setShowFilter(false)}
                    onApply={handleApplyFilter}
                />
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

                    currentSort={currentSortLabel ? location.state?.sort || "" : ""} />
            )}

            <Footer />
        </div>
    );
}