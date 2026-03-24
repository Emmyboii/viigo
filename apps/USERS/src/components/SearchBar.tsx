import { IoSearchSharp } from "react-icons/io5";
import { useNavigate, useLocation } from "react-router-dom";

export default function SearchBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      onClick={() =>
        navigate("/explore", {
          state: { openSearch: true, from: location.pathname },
        })
      }
      className="bg-white border rounded-lg flex items-center px-3 py-4 cursor-pointer"
    >
      <IoSearchSharp className="text-[#475569] mr-2 text-xl" />
      <input
        type="text"
        placeholder="Search for Hourly Gyms"
        className="outline-none w-full text-sm placeholder:text-[#0F172A] bg-transparent"
      />
    </div>
  );
}