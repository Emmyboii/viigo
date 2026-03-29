import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useRef, useState } from "react";
import { FullscreenCarousel } from "./FullscreenCarousel";
import { getFullImageUrl } from "../context/AppContext";

interface Props {
    images: { id: number; image: string }[];
    height?: string;
    delay?: number;
    enableFullscreen?: boolean;
}

export default function ImageCarousel({
    images,
    height = "h-40",
    delay,
    enableFullscreen = true,
}: Props) {
    // 🎲 Random delay between 2500–4500ms if not provided
    const randomDelay =
        delay ?? 2500 + Math.floor(Math.random() * 2000);

    const autoplay = useRef(
        Autoplay({
            delay: randomDelay,
            stopOnInteraction: false,
        })
    );

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [startIndex, setStartIndex] = useState(0);

    useEffect(() => {
        if (isFullscreen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isFullscreen]);

    const openFullscreen = (index: number) => {
        setStartIndex(index);
        setIsFullscreen(true);

        // Push history state
        window.history.pushState({ fullscreen: true }, "");
    };

    const closeFullscreen = () => {
        setIsFullscreen(false);

        // Go back only if we pushed state
        if (window.history.state?.fullscreen) {
            window.history.back();
        }
    };

    useEffect(() => {
        const handlePopState = () => {
            if (isFullscreen) {
                setIsFullscreen(false);
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [isFullscreen]);

    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true },
        [autoplay.current]
    );

    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        if (!emblaApi) return;

        const onSelect = () => {
            setSelectedIndex(emblaApi.selectedScrollSnap());
        };

        emblaApi.on("select", onSelect);
        onSelect();
    }, [emblaApi]);

    // Pause on hold
    const handlePointerDown = () => autoplay.current.stop();
    const handlePointerUp = () => autoplay.current.play();

    return (
        <div
            className="relative"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >
            {/* Dots */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 flex gap-1">
                {images?.map((_, index) => (
                    <div
                        key={index}
                        className={`h-2 w-2 rounded-full ${selectedIndex === index
                            ? "bg-white"
                            : "bg-white/50"
                            }`}
                    />
                ))}
            </div>

            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    {images?.map((img, index) => (
                        <div key={index} className="min-w-full">
                            <img
                                src={getFullImageUrl(img.image)}
                                title="Gym_images"
                                className={`w-full ${height} object-cover`}
                                draggable={false}
                                onClick={() => {
                                    if (!enableFullscreen) return;
                                    openFullscreen(index);
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {enableFullscreen && isFullscreen && (
                <FullscreenCarousel
                    images={images}
                    startIndex={startIndex}
                    onClose={closeFullscreen}
                />
            )}
        </div>
    );
}
