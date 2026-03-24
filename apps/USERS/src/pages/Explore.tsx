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
import logoUrl from "../assets/icon2.png";
import html2canvas from "html2canvas";

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

    useEffect(() => {
        return () => {
            window.history.replaceState({}, document.title);
        };
    }, []);

    const handleShare = async () => {
        const element = document.getElementById("share-area");

        if (!element) return;

        try {
            await document.fonts.ready;

            const canvas = await html2canvas(element, {
                useCORS: true,
                allowTaint: false,
                scrollX: 0,
                scrollY: -window.scrollY,
                windowWidth: document.documentElement.clientWidth,
                windowHeight: document.documentElement.clientHeight,
                scale: 2,
            });

            const finalCanvas = document.createElement("canvas");
            const ctx = finalCanvas.getContext("2d");
            if (!ctx) return;

            const headerHeight = 100;
            const padding = 40; // 👈 adjust spacing here

            // ✅ Increase canvas size
            finalCanvas.width = canvas.width + padding * 2;
            finalCanvas.height = canvas.height + headerHeight + padding * 2;

            // 🔵 Header background (include padding)
            ctx.fillStyle = "#2563EB";
            ctx.fillRect(0, 0, finalCanvas.width, headerHeight + padding);

            // 🧠 Logo
            const logo = new Image();
            logo.src = logoUrl;

            await new Promise((resolve) => {
                logo.onload = resolve;
                logo.onerror = resolve;
            });

            const maxLogoHeight = 40;
            const logoRatio = logo.width / logo.height;
            const logoWidth = maxLogoHeight * logoRatio;
            const logoHeight = maxLogoHeight;

            // Text
            const text = "Viigo";
            ctx.font = "bold 50px sans-serif";
            ctx.fillStyle = "#fff";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";

            const textWidth = ctx.measureText(text).width;
            const gap = 20;

            // ✅ Center properly (with padding accounted)
            const totalWidth = logoWidth + gap + textWidth;
            const startX = (finalCanvas.width - totalWidth) / 2;

            // Draw logo
            ctx.drawImage(
                logo,
                startX,
                (headerHeight + padding - logoHeight) / 2,
                logoWidth,
                logoHeight
            );

            // Draw text
            ctx.fillText(
                text,
                startX + logoWidth + gap,
                (headerHeight + padding) / 2
            );

            // 🖼 Draw content with padding offset
            ctx.drawImage(canvas, padding, headerHeight + padding);

            const dataUrl = finalCanvas.toDataURL("image/png");

            // ✅ Share or fallback to download
            if (navigator.share) {
                await navigator.share({
                    title: "Viigo Share",
                    text: "Check out this gym!",
                    url: dataUrl,
                });
            } else {
                const link = document.createElement("a");
                link.href = dataUrl;
                link.download = "viigo-share.png";
                link.click();
            }
        } catch (err) {
            console.error("Share failed:", err);
        }
    };

    return (
        <div className="relative h-screen bg-white">
            {/* MAP VIEW */}
            {view === "map" && (
                <div className="relative h-full bg-white">

                    <MapView selectedGymFromDetails={location.state?.gym} />

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
                <div className="p-4 h-full overflow-y-auto pb-28">

                    <div id="share-area" className="min-h-screen bg-white">

                        {/* HEADER (OUTSIDE MAP) */}
                        <div className="fixed top-0 left-0 right-0 z-40 bg-white flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-2">
                                <button title="back" onClick={() => setView("map")} className="p-1">
                                    <IoArrowBack size={20} />
                                </button>

                                <span className="font-medium">Explore Gym</span>
                            </div>

                            <button onClick={handleShare} title="share" className="p-1">
                                <HiShare className="text-[#475569]" size={20} />
                            </button>
                        </div>

                        <div className="pt-12"></div>

                        {/* Search + Filters */}
                        <div className="flex items-center gap-3 mb-2">
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

                        <p className="text-[#94A3B8] text-sm my-3">
                            {searchResults.length} Gym{searchResults.length > 1 && "s"} found
                        </p>

                        {/* RESULTS */}
                        {searchLoading ? (
                            <p className="text-center py-6">Searching...</p>
                        ) : searchResults.length === 0 ? (
                            <p className="text-center py-6 text-gray-400">
                                No gyms found
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {searchResults.map((gym) => (
                                    <GymHorizontalCard key={gym.id} gym={gym} />
                                ))}
                            </div>
                        )}

                    </div>
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