import { IoArrowBack } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom';
import { RiShareFill } from "react-icons/ri";

interface PageHeaderProps {
    text: string
    onShare: () => void;
}

const PageHeader = ({ text, onShare }: PageHeaderProps) => {

    const navigate = useNavigate();

    const handleBack = () => {
        // If we have pushed modal/sheet/fullscreen state → go back in history
        if (window.history.state?.sheet || window.history.state?.fullscreenCarousel || window.history.state?.modal || window.history.state?.modal === "sort") {
            window.history.back();
            return;
        }

        // Otherwise, navigate normally
        navigate(-1);
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-40 bg-white flex items-center justify-between px-4 py-3" >

            <div className='flex items-center gap-2'>
                <button
                    onClick={handleBack}
                    aria-label="Go back"
                    className="p-1"
                >
                    <IoArrowBack size={20} />
                </button>

                <span className="font-semibold text-[#0F172A] text-lg">{text}</span>
            </div>

            <button
                aria-label="Share gym"
                onClick={onShare}
                className="p-1"
            >
                <RiShareFill className="text-[#475569] text-lg" size={22} />
            </button>
        </div>
    )
}

export default PageHeader