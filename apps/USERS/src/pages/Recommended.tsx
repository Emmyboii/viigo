import { useAppContext } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import Container from '../components/layout/Container';
import GymHorizontalCard from '../components/GymHorizontalCard';
import SearchBar2 from '../components/SearchBar2';
import { useState } from 'react';

const Recommended = () => {


    const { recommendedGyms, loading2 } = useAppContext()
    // const [activeId, setActiveId] = useState("");
    // const [showSortModal, setShowSortModal] = useState(false);
    // const [showFilterModal, setShowFilterModal] = useState(false);

    const [query, setQuery] = useState("");
    // const [sort, setSort] = useState("");
    // const [filters, setFilters] = useState<any>({});

    // const chipData = [
    //     { id: "filters", label: "Filters" },
    //     { id: "sort", label: "Sort By" },
    //     // { id: "near", label: "Near Me" },
    //     // { id: "women", label: "Women" },
    //     // { id: "top_rated", label: "Top Rated" },
    // ];

    // const fetchData = () => {
    //     if (sort) {
    //         fetchSortedGyms(sort, "");
    //     } else {
    //         fetchFilteredGyms({
    //             ...filters,
    //             query,
    //         });
    //     }
    // };

    // useEffect(() => {
    //     fetchData();
    // }, [sort, filters, query]);

    if (loading2) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4 p-8 bg-white animate-fadeIn">
                    <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-700 text-lg font-medium">
                        Loading Recommended gyms...
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
            <PageHeader text='Recommended' />
            <div className='mt-14 pb-2'>
                <SearchBar2
                    value={query}
                    onChange={(val: string) => setQuery(val)}
                />
            </div>
            {/* <FilterChips
                items={chipData}
                activeId={activeId}
                onChange={(id) => {
                    setActiveId(id);

                    if (id === "filters") setShowFilterModal(true);
                    if (id === "sort") setShowSortModal(true);

                    if (id === "near") setSort("nearest");
                    if (id === "top_rated") setSort("top_rated");

                    if (id === "women") {
                        setFilters((prev: any) => ({
                            ...prev,
                            women_only: true,
                        }));
                    }
                }}
            /> */}
            {recommendedGyms.length === 0 ? (
                <p className="text-center text-gray-400 py-6">
                    No recommended gyms available
                </p>
            ) : (
                <div className="space-y-4 mb-20 mt-7">
                    {recommendedGyms.map((gym, index) => (
                        <GymHorizontalCard key={index} gym={gym} />
                    ))}
                </div>
            )}

            {/* {showSortModal && (
                <SortModal
                    onClose={() => setShowSortModal(false)}
                    onSelect={(value) => {
                        setShowSortModal(false);
                        setSort(value);
                    }}
                />
            )} */}

            {/* 🎛 FILTER MODAL */}
            {/* {showFilterModal && (
                <FilterModal
                    onClose={() => setShowFilterModal(false)}
                    onApply={(selectedFilters: any) => {
                        setShowFilterModal(false);
                        setFilters(selectedFilters);
                    }}
                />
            )} */}
        </Container>
    )
}

export default Recommended