import { IoSearchSharp } from "react-icons/io5";

export default function SearchBar() {
  return (
    <div className="bg-white border rounded-xl flex items-center px-3 py-4">
      <IoSearchSharp className="text-[#475569] mr-2 text-2xl" />
      <input
        type="text"
        placeholder="Search for Hourly Gyms"
        className="outline-none w-full text-sm placeholder:text-[#0F172A]"
      />
    </div>
  );
}
