import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";
import { IoClose, IoChevronBack, IoChevronForward } from "react-icons/io5";
import type { Image } from "./types/gym";
import { getFullImageUrl } from "../context/AppContext";

interface Props {
    images: Image[];
    startIndex: number;
    onClose: () => void;
}

export function FullscreenCarousel({
    images,
    startIndex,
    onClose,
}: Props) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        startIndex,
    });

    const [currentIndex, setCurrentIndex] = useState(startIndex);

    useEffect(() => {
        if (!emblaApi) return;

        emblaApi.scrollTo(startIndex);

        const onSelect = () => {
            setCurrentIndex(emblaApi.selectedScrollSnap());
        };

        emblaApi.on("select", onSelect);
        onSelect();
    }, [emblaApi, startIndex]);

    const scrollPrev = () => emblaApi?.scrollPrev();
    const scrollNext = () => emblaApi?.scrollNext();

    return (
        <div className="fixed inset-0 z-[99] bg-black/95 flex flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 pt-3 text-white">
                <p className="text-sm">
                    {currentIndex + 1} / {images.length}
                </p>

                <button title="close" onClick={onClose}>
                    <IoClose size={28} />
                </button>
            </div>

            {/* Carousel */}
            <div className="relative flex-1 overflow-hidden" ref={emblaRef}>
                <div className="flex h-full">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className="min-w-full h-full flex items-center justify-center"
                        >
                            <img
                                title="imgs"
                                src={getFullImageUrl(img.image)}
                                className="max-h-full max-w-full object-contain select-none"
                                draggable={false}
                            />
                        </div>
                    ))}
                </div>

                {/* 👈 Prev Button */}
                <button
                    title="prev"
                    onClick={scrollPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur"
                >
                    <IoChevronBack size={24} />
                </button>

                {/* 👉 Next Button */}
                <button
                    title="next"
                    onClick={scrollNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur"
                >
                    <IoChevronForward size={24} />
                </button>
            </div>
        </div>
    );
}