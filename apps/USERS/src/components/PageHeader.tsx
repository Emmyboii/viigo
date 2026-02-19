import { HiShare } from 'react-icons/hi2'
import { IoArrowBack } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
    text: string
}

const PageHeader = ({ text }: PageHeaderProps) => {

    const navigate = useNavigate();

    return (
        <div className="fixed top-0 left-0 right-0 z-40 bg-white flex items-center justify-between px-4 py-3" >

            <button
                onClick={() => navigate(-1)}
                aria-label="Go back"
                className="p-1"
            >
                <IoArrowBack size={20} />
            </button>

            <span className="font-medium">{text}</span>

            <button
                aria-label="Share gym"
                className="p-1"
            >
                <HiShare className="text-[#475569]" size={20} />
            </button>
        </div>
    )
}

export default PageHeader