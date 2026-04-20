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
// import * as htmlToImage from "html-to-image";
import { snapdom } from "@zumer/snapdom";

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


    type ModalType = "search" | "filter" | "sort";

    const openModal = (type: ModalType) => {
        if (type === "search") setShowSearch(true);
        if (type === "filter") setShowFilter(true);
        if (type === "sort") setShowSortModal(true);

        window.history.pushState({ modal: type }, "");
    };

    const closeModal = (type: ModalType, skipHistory = false) => {
        if (type === "search") setShowSearch(false);
        if (type === "filter") setShowFilter(false);
        if (type === "sort") setShowSortModal(false);

        if (!skipHistory && window.history.state?.modal === type) {
            window.history.back();
        }
    };

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
    const [currentSortLabel, setCurrentSortLabel] = useState<string | null>(() => {
        return location.state?.sortLabel || null;
    });
    const [currentSort, setCurrentSort] = useState<string>(() => {
        return location.state?.sort || "";
    });
    const chipData = [
        { id: "filters", label: "Filters", icon: <FaFilter /> },
        { id: "sort", label: "Sort By", icon: <BiSortAlt2 className="text-xl" /> },
    ];

    const chipData2 = [
        { id: "filters", label: "Filters", icon: <FaFilter /> },
    ];


    useEffect(() => {
        const unlisten = () => {
            setView("map");
            setShowSearch(false);
            setShowFilter(false);
            setShowSortModal(false);
            setActiveId("");
            setQuery("");
        };

        // If user is not on explore, reset
        if (!location.pathname.startsWith("/explore")) {
            unlisten();
        }

        return () => {
            // Clean up if component unmounts
            unlisten();
        };
    }, [location.pathname]);

    useEffect(() => {
        if (location.state?.openFilter) {
            // Open WITHOUT pushing history
            setShowFilter(true);
        }
    }, [location.state]);

    useEffect(() => {
        if (location.state?.openSearch) {
            openModal("search");
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
        closeModal("filter");
        await fetchFilteredGyms(newFilters);
        setView("list");
        setCurrentSortLabel(null);
    };

    useEffect(() => {
        if (location.state?.sort) {
            const { sort, sortLabel } = location.state;

            setCurrentSort(sort);
            setCurrentSortLabel(sortLabel);

            fetchSortedGyms(sort, sortLabel);

            localStorage.setItem("gymSort", JSON.stringify({ sort, sortLabel }));

            // ✅ clear state
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state]);

    useEffect(() => {
        const saved = localStorage.getItem("gymSort");

        if (saved) {
            const { sort, sortLabel } = JSON.parse(saved);
            fetchSortedGyms(sort, sortLabel);
            setCurrentSort(sort);
            setCurrentSortLabel(sortLabel);
        }
    }, []);

    useEffect(() => {
        return () => {
            if (!window.location.pathname.startsWith("/explore")) {
                localStorage.removeItem("gymSort");
            }
        };
    }, []);

    useEffect(() => {
        if (view === "map") {
            // setCurrentSortLabel(null);
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
        const bottomBar = document.getElementById("share-bottom-bar");

        if (!element) return;

        // Save original styles
        if (bottomBar) {

            bottomBar.style.position = "relative";
            bottomBar.style.bottom = "0px";
        }
        try {
            await document.fonts.ready;

            // 🧠 SNAPDOM (replaces html-to-image)
            const canvasEl = await snapdom.toCanvas(element, {
                scale: 2, // similar to pixelRatio
                backgroundColor: "#ffffff",
            });

            const baseImage = new Image();
            baseImage.src = canvasEl.toDataURL("image/png");

            await new Promise((res) => {
                baseImage.onload = res;
            });

            // 🎨 FINAL CANVAS
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Adjust header height dynamically if needed
            const headerHeight = 150 * 3; // taller header for bigger logo/text

            canvas.width = baseImage.width;
            canvas.height = baseImage.height + headerHeight;

            // 🔷 Gradient header
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, "#2563EB");
            gradient.addColorStop(1, "#3B82F6");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, headerHeight);

            // 🧠 Logo
            const logo = new Image();
            logo.crossOrigin = "anonymous";
            logo.src = logoUrl;
            await new Promise((res) => { logo.onload = res; logo.onerror = res; });

            // Scale logo bigger
            const logoHeight = 80 * 3; // bigger than before
            const logoWidth = logoHeight * (logo.width / logo.height);

            // 🧠 Text
            const text = "Viigo";
            ctx.font = `bold ${70 * 3}px sans-serif`; // larger font
            ctx.fillStyle = "#fff";

            // Center logo + text horizontally
            const textWidth = ctx.measureText(text).width;
            const gap = 20;
            const totalWidth = logoWidth + gap + textWidth;
            const startX = (canvas.width - totalWidth) / 2;

            // Draw logo
            ctx.drawImage(
                logo,
                startX,
                (headerHeight - logoHeight) / 2, // vertically center
                logoWidth,
                logoHeight
            );

            // Draw text vertically centered
            ctx.textBaseline = "middle";
            ctx.fillText(
                text,
                startX + logoWidth + gap,
                headerHeight / 2
            );

            // 🖼 Draw main content
            ctx.drawImage(baseImage, 0, headerHeight);

            // 📦 Export
            // const finalUrl = canvas.toDataURL("image/png");
            const blob = await new Promise<Blob | null>((resolve) =>
                canvas.toBlob(resolve, "image/png")
            );

            if (blob) {
                const file = new File([blob], "viigo-share.png", { type: "image/png" });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: "Viigo Share",
                        text: "Check out this gym!",
                    });
                } else {
                    // Fallback download
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(file);
                    link.download = "viigo-share.png";
                    link.click();
                }
            }
        } catch (err) {
            console.error("Share failed:", err);
        }
    };

    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            const modal = event.state?.modal;

            // If there's no modal in state → close everything
            if (!modal) {
                setShowSearch(false);
                setShowFilter(false);
                setShowSortModal(false);
            } else {
                // Restore specific modal if needed
                setShowSearch(modal === "search");
                setShowFilter(modal === "filter");
                setShowSortModal(modal === "sort");
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    return (
        <div className="relative h-screen bg-white">
            {/* MAP VIEW */}
            {view === "map" && (
                <div className="relative h-full bg-white">

                    <MapView selectedGymFromDetails={location.state?.gym} />

                    {/* Search Bar */}
                    <div
                        onClick={() => {
                            setCurrentSortLabel(null);
                            openModal("search");
                        }}
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
                        onClick={() => {
                            setCurrentSortLabel(null);
                            openModal("filter");
                        }}
                        className="absolute top-6 right-4 bg-[#F1F5F9] w-12 h-12 rounded-full text-[#94A3B8] border border-[#CBD5E1] shadow-md flex items-center justify-center"
                    >
                        <HiFilter />
                    </button>

                </div>
            )}

            {/* LIST VIEW */}
            {view === "list" && (
                <div className="h-full overflow-y-auto my-container pb-28 max-w-[1300px] mx-auto">

                    <div id="share-area" className="min-h-screen bg-white p-4">

                        {/* HEADER (OUTSIDE MAP) */}
                        <div className="fixed max-w-[1300px] mx-auto top-0 left-0 right-0 z-40 bg-white flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-2">
                                <button title="back" onClick={() => {
                                    setCurrentSortLabel(null);

                                    if (window.history.state?.modal) {
                                        window.history.back();
                                        return;
                                    }

                                    setView("map")
                                }}
                                    className="p-1">
                                    <IoArrowBack size={20} />
                                </button>

                                <span className="font-semibold text-[#0F172A] text-lg text-nowrap">Explore Gym</span>
                            </div>

                            <button onClick={handleShare} title="share" className="p-1">
                                <HiShare className="text-[#475569]" size={20} />
                            </button>
                        </div>

                        <div className="pt-11"></div>

                        {/* Search + Filters */}
                        <div className="flex items-center gap-3 mb-">
                            <div
                                onClick={() => openModal("search")}
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
                                        openModal("filter")
                                    }

                                    if (id === "sort") {
                                        openModal("sort")
                                    }
                                }}
                            />

                            {currentSortLabel && (
                                <div className="mt-4 w-full">
                                    <button
                                        onClick={() => openModal("sort")}
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
                    onClose={() => closeModal("search", true)}
                    onClose2={() => setShowSearch(false)}
                    from={location.state?.from}
                    setQuery={setQuery}
                    query={query}
                    setCurrentSortLabel={setCurrentSortLabel}
                />
            )}

            {showFilter && (
                <FilterModal
                    filters={filters}
                    from={location.state?.from}
                    onClose={() => closeModal("filter")}
                    onApply={handleApplyFilter}
                />
            )}

            {showSortModal && (
                <SortModal
                    onClose={() => closeModal("sort")}
                    onSelect={(value, label) => {
                        // 1️⃣ Update state immediately
                        setCurrentSort(value);
                        setCurrentSortLabel(label);

                        // 2️⃣ Fetch sorted gyms immediately
                        fetchSortedGyms(value, label);

                        // 3️⃣ Persist for reloads
                        localStorage.setItem("gymSort", JSON.stringify({ sort: value, sortLabel: label }));

                        // 4️⃣ Close the modal
                        closeModal("sort");
                    }}

                    currentSort={currentSort} />
            )}

            <Footer />
        </div>
    );
}