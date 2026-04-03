import { IoSearchSharp } from "react-icons/io5";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import muscle from '../assets/muscle.png'
import { FiClock } from "react-icons/fi";

type Props = {
    onClose: () => void;
    onClose2: () => void;
    from?: string;
    query?: string
    setQuery: React.Dispatch<React.SetStateAction<string>>
    setCurrentSortLabel?: React.Dispatch<React.SetStateAction<string | null>>
};

export default function SearchModal({ onClose, onClose2, from, query, setQuery, setCurrentSortLabel }: Props) {
    const navigate = useNavigate();
    const { searchGyms, searchResults, nearbyGyms } = useAppContext();

    const [recent, setRecent] = useState<string[]>([]);

    // Load recent searches
    useEffect(() => {
        const stored = localStorage.getItem("recentSearches");
        if (stored) {
            setRecent(JSON.parse(stored));
        }
    }, []);

    // Save recent
    const saveRecent = (value: string) => {
        const updated = [
            value,
            ...recent.filter((r) => r !== value),
        ].slice(0, 6);

        setRecent(updated);
        localStorage.setItem("recentSearches", JSON.stringify(updated));
    };

    // Live search as user types
    useEffect(() => {
        const delay = setTimeout(() => {
            if (query?.trim()) {
                searchGyms(query);
            }
        }, 400);

        return () => clearTimeout(delay);
    }, [query]);

    const handleSelect = async (value: string) => {
        setQuery(value);
        await searchGyms(value);
        saveRecent(value);
        if (from === "/") {
            onClose2();
        } else {
            onClose();
        }
        setCurrentSortLabel?.(null)
    };

    const handleCancel = () => {
        if (from === "/") {
            navigate("/");
        } else {
            onClose();
        }
    };

    const handleGymClick = (gym: any) => {
        if (from === "/") {
            onClose2();
        } else {
            onClose();
        }
        setCurrentSortLabel?.(null)
        navigate(`/gyms/${gym.slug}`);
    };

    return (
        <div className="fixed inset-0 bg-white z-[100] p-4 flex flex-col">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
                <div className="bg-white border rounded-xl flex items-center px-3 w-full py-4 cursor-pointer">
                    <IoSearchSharp className="mr-2 text-xl text-gray-500" />
                    <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={async (e) => {
                            if (e.key === "Enter" && query?.trim()) {
                                await searchGyms(query);
                                saveRecent(query);
                                if (from === "/") {
                                    onClose2();
                                } else {
                                    onClose();
                                }
                                setCurrentSortLabel?.(null)

                                navigate("/explore", {
                                    state: { query },
                                });
                            }
                        }}
                        placeholder="Search Here"
                        className="outline-none w-full text-sm placeholder:text-[#0F172A] bg-transparent"
                    />
                </div>

                <button
                    onClick={handleCancel}
                    className="ml-3 text-sm font-medium text-blue-600"
                >
                    Cancel
                </button>
            </div>

            {/* LIVE SUGGESTIONS */}
            {query && searchResults.length > 0 && (
                <div className="mb-6">
                    {searchResults.slice(0, 5).map((gym) => (
                        <div
                            key={gym.id}
                            onClick={() => {
                                // setCurrentSortLabel?.(null)
                                handleGymClick(gym)
                            }}
                            className="py-3 border-b cursor-pointer flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <img src={muscle} width={14} alt="" />

                                <div>
                                    <p className="text-sm font-medium">
                                        {gym.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {gym.distance} • ₹{Number(gym.hourly_rate)}/Hr
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 bg-[#F1F5F9] rounded p-1.5">
                                <FiClock className="text-gray-400" size={16} />

                                <p className="text-[#94A3B8] text-xs">{gym.open_status}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* RECENT SEARCHES */}
            {!query && recent.length > 0 && (
                <div className="mb-6">
                    <p className="text-sm text-[#94A3B8] font-medium mb-2">
                        Recent Searches
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {recent.map((item) => (
                            <button
                                key={item}
                                onClick={() => handleSelect(item)}
                                className="px-3 py-1.5 rounded-lg bg-[#F1F5F9] text-sm flex items-center gap-2"
                            >
                                <FiClock className="text-gray-400" size={16} />

                                {item}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* POPULAR NEAR YOU */}
            {!query && nearbyGyms?.length > 0 && (
                <div>
                    <p className="text-sm text-[#94A3B8] font-medium mb-2">
                        Popular near you
                    </p>

                    {nearbyGyms.slice(0, 5).map((gym) => (
                        <div
                            key={gym.id}
                            onClick={() => handleGymClick(gym)}
                            className="py-3 border-b cursor-pointer flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <img src={muscle} width={14} alt="" />

                                <div>
                                    <p className="text-sm font-medium">
                                        {gym.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {gym.distance} • ₹{Number(gym.hourly_rate)}/Hr
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 bg-[#F1F5F9] rounded p-1.5">
                                <FiClock className="text-gray-400" size={16} />

                                <p className="text-[#94A3B8] text-xs">{gym.open_status}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}