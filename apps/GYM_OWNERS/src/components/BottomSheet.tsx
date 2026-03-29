import type { ReactNode } from "react";
import { FiX } from "react-icons/fi";
import { useLocation } from "react-router-dom";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
}: BottomSheetProps) {

  const location = useLocation()

  const details = localStorage.getItem("gymDisplay");

  const isDesktop = window.innerWidth >= 850;

  const animation =
    location.pathname === "/gym"
      ? isDesktop
        ? details === "details"
          ? "animate-slideUp"
          : "animate-slideRight"
        : "animate-slideUp"
      : location.pathname === "/"
        ? isDesktop
          ? "animate-slideUp"
          : "animate-slideUp"
        : "animate-slideRight"

  if (!open) return null;

  return (
    <div className={`${location.pathname === "/gym" && details !== 'details' ? 'fixed inset-0 z-[99]' : location.pathname === "/gym" && details === 'details' ? 'fixed mk:absolute inset-0 z-[99]' : 'fixed inset-0 z-[99]'} `}>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* Sheet */}
      <div
        className={`${location.pathname === "/gym" && details !== "details"
          ? `absolute top-0 right-0 h-full w-full mk:w-[490px] bg-white flex flex-col ${animation}`
          : location.pathname === "/"
            ? `absolute bottom-0 right-0 left-0 mk:left-auto bg-white rounded-t-3xl flex flex-col max-h-[85vh] ${animation} mk:w-[480px] mk:rounded-l-3x`
            : `absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl flex flex-col max-h-[85vh] ${animation}`
          }`}
      >
        {/* Drag handle */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4 invisible" />

        {/* Header */}
        <div className="flex justify-between items-center px-5 mb-3 mk:mt-10 mk:px-10">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button title="close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 overflow-y-auto flex-1 pb-5 mk:px-10">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-[#F8FAFC] py-2 px-4 shadow-2xl shadow-[#000000] mk:shadow-none bg-white mk:px-10">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
