import { FiArrowLeft } from "react-icons/fi"
import { HiShare } from "react-icons/hi"
import { useNavigate } from "react-router-dom";
import Container from "../components/layout/Container";
import { MdEmail, MdKeyboardArrowRight } from "react-icons/md";

const Support = () => {

    const navigate = useNavigate();

    return (
        <Container>
            <div className="flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                    <FiArrowLeft onClick={() => navigate(-1)} size={20} />
                    <p className="font-medium">Support</p>
                </div>
                <HiShare size={20} />
            </div>

            <p className="py-5">Have a question or run into an issue? write to us and our team will get back to you.</p>

            <div className="border border-[#E2E8F0] py-3 px-4 rounded-lg flex items-center gap-4 justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#BFDBFE] rounded-full">
                        <MdEmail className="text-[#2563EB]" size={20} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[#0F172A] font-semibold">Email Support</p>
                        <p className="text-[#0F172A] text-xs font-normal">Get a reply within 24 hours.</p>
                    </div>
                </div>
                <MdKeyboardArrowRight className="text-[#2563EB]" size={20} />
            </div>
        </Container>
    )
}

export default Support