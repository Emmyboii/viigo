import { IoClose } from "react-icons/io5";

export default function BottomSheet({
    open,
    onClose,
    title,
    children,
}: any) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">

            {/* Overlay */}
            <div
                onClick={onClose}
                className="absolute inset-0 bg-black/40"
            />

            {/* Sheet */}
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-5 max-h-[70vh] overflow-y-auto animate-slideUp">

                {/* Drag Indicator */}
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

                {/* Title + Close */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">
                        {title}
                    </h3>

                    <button
                        onClick={onClose}
                        aria-label="Close"
                        type="button"
                        className="p-1 rounded-full hover:bg-gray-100 transition"
                    >
                        <IoClose size={20} />
                    </button>
                </div>

                {/* Content */}
                {children}
            </div>
        </div>
    );
}
