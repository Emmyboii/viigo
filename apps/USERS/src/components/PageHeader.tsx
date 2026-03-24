import { IoArrowBack } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom';
import { RiShareFill } from "react-icons/ri";

interface PageHeaderProps {
    text: string
    onShare: () => void;
}

const PageHeader = ({ text, onShare }: PageHeaderProps) => {

    const navigate = useNavigate();

    return (
        <div className="fixed top-0 left-0 right-0 z-40 bg-white flex items-center justify-between px-4 py-3" >

            <div className='flex items-center gap-2'>
                <button
                    onClick={() => navigate(-1)}
                    aria-label="Go back"
                    className="p-1"
                >
                    <IoArrowBack size={20} />
                </button>

                <span className="font-semibold text-lg">{text}</span>
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