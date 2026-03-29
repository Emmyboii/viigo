import { useAppContext } from '../context/AppContext';
import Container from '../components/layout/Container';
import GymHorizontalCard from '../components/GymHorizontalCard';
import SearchBar2 from '../components/SearchBar2';
import { useState } from 'react';
import { IoArrowBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const Recommended = () => {

    const navigate = useNavigate();

    const { recommendedGyms, loading2 } = useAppContext()

    const [query, setQuery] = useState("");

    const filteredGyms = recommendedGyms.filter((gym) => {
        if (!query) return true;

        return (
            gym.name?.toLowerCase().includes(query.toLowerCase()) ||
            gym.area?.toLowerCase().includes(query.toLowerCase())
        );
    });

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

            <div className="fixed top-0 left-0 right-0 z-40 bg-white flex items-center justify-between px-4 py-3" >

                <div className='flex items-center gap-2'>
                    <button
                        onClick={() => navigate(-1)}
                        aria-label="Go back"
                        className="p-1"
                    >
                        <IoArrowBack size={20} />
                    </button>

                    <span className="font-semibold text-lg">Recommended</span>
                </div>
            </div>

            <div className='mt-14 pb-2'>
                <SearchBar2
                    value={query}
                    onChange={(val: string) => setQuery(val)}
                />
            </div>

            {filteredGyms.length === 0 ? (
                <p className="text-center text-gray-400 py-6">
                    {query ? "No gyms match your search" : "No recommended gyms available"}
                </p>
            ) : (
                <div className="space-y-4 mb-20 mt-7">
                    {filteredGyms.map((gym, index) => (
                        <GymHorizontalCard key={index} gym={gym} />
                    ))}
                </div>
            )}

            <Footer />

        </Container>
    )
}

export default Recommended