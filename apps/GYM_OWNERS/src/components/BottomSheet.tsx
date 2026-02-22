import type { ReactNode } from "react";
import { FiX } from "react-icons/fi";

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
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl flex flex-col max-h-[85vh] animate-slideUp">
        
        {/* Drag handle */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />

        {/* Header */}
        <div className="flex justify-between items-center px-5 mb-3">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button title="close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 overflow-y-auto flex-1 pb-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-[#F8FAFC] py-2 px-4 shadow-2xl shadow-[#000000] bg-white">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
