import { IoSearchSharp } from "react-icons/io5";

type Props = {
    value: string;
    onChange: (val: string) => void;
};

export default function SearchBar2({ value, onChange }: Props) {
    return (
        <div className="bg-white border rounded-xl flex items-center px-3 py-4 cursor-pointer">
            <IoSearchSharp className="text-[#475569] mr-2 text-2xl" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search For Gyms"
                className="outline-none w-full text-sm placeholder:text-[#0F172A] bg-transparent"
            />
        </div>
    );
}