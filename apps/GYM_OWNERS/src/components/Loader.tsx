import { useEffect, useState } from 'react';
import icon from '../assets/icon2.png';

export default function Loader() {
    const [complete, setComplete] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setComplete(true);
        }, 1980); // animation time

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="h-screen w-full bg-[#2F5FD0] flex items-center justify-center">
            <div className="relative w-[120px] h-[120px] flex items-center justify-center">

                {!complete && (
                    <>
                        {/* Static line */}
                        <div className="absolute w-[4px] h-[50px] bg-white origin-bottom" />

                        {/* Rotating line */}
                        <div className="absolute w-[4px] h-[50px] bg-white origin-bottom animate-spinToTop" />
                    </>
                )}

                {/* Final Icon */}
                {complete && (
                    <div className="text-white font-bold animate-fadeIn">
                        <img src={icon} alt="" />
                    </div>
                )}
            </div>
        </div>
    );
}
