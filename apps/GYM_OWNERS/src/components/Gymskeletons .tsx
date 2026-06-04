export function GymOwnerHomeSkeleton() {
    return (
        <div className="min-h-screen py-4 w-screen mk:w-full mk:mx-auto animate-pulse">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-2 pt-2 px-5 mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-200 rounded-full" />
                    <div className="space-y-1">
                        <div className="h-3 bg-gray-200 rounded w-28" />
                        <div className="h-3 bg-gray-200 rounded w-20" />
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="w-20 h-7 bg-gray-200 rounded-full" />
                    <div className="w-6 h-6 bg-gray-200 rounded-full" />
                </div>
            </div>

            {/* OTP box */}
            <div className="bg-gray-200 rounded-lg h-[90px] mx-5 mb-5" />

            {/* Bookings section */}
            <div className="px-5">
                <div className="h-4 bg-gray-200 rounded w-20 mb-4" />
                {/* Filter chips */}
                <div className="flex gap-2 mt-2 mb-5">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-8 bg-gray-200 rounded-lg w-20 flex-shrink-0" />
                    ))}
                </div>
                {/* User cards */}
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-4 py-2.5 rounded-lg border border-[#E2E8F0]">
                            <div className="w-[66px] h-[66px] rounded-full bg-gray-200 flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-4 bg-gray-200 rounded w-28" />
                                    <div className="h-6 bg-gray-200 rounded-full w-16" />
                                </div>
                                <div className="h-3 bg-gray-200 rounded w-32" />
                                <div className="h-3 bg-gray-200 rounded w-40" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function GymOwnerDetailsSkeleton() {
    return (
        <div className="min-h-screen pb-28 max-w-[1900px] mx-auto animate-pulse">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white">
                <div className="h-5 bg-gray-200 rounded w-32" />
                <div className="h-10 bg-gray-200 rounded-md w-36 hidden mk:block" />
            </div>

            {/* Image */}
            <div className="h-48 mk:h-80 bg-gray-200" />

            {/* Content */}
            <div className="p-4 px-5 space-y-6">
                <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="flex gap-2 mt-4">
                        <div className="h-7 bg-gray-200 rounded-full w-20" />
                        <div className="h-7 bg-gray-200 rounded-full w-24" />
                    </div>
                </div>
                <div className="border border-dashed border-gray-100" />
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    {[1, 2, 3, 4].map((i) => <div key={i} className="h-3 bg-gray-200 rounded w-40" />)}
                    <div className="h-10 bg-gray-200 rounded-xl w-full mt-2" />
                </div>
                <div className="border border-dashed border-gray-100" />
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-16" />
                    {[1, 2, 3].map((i) => <div key={i} className="h-3 bg-gray-200 rounded w-full" />)}
                </div>
                {/* Availability */}
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-48" />
                    <div className="h-3 bg-gray-200 rounded w-64" />
                    <div className="border rounded-xl p-3 space-y-3 h-[300px]">
                        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                            <div key={i} className="flex justify-between items-center py-2">
                                <div className="h-4 bg-gray-200 rounded w-40" />
                                <div className="h-7 bg-gray-200 rounded-full w-16" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="fixed mk:hidden bottom-14 left-0 right-0 bg-white border-t px-4 py-3 pb-8 flex items-center justify-between">
                <div className="space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-28" />
                    <div className="h-6 bg-gray-200 rounded w-20" />
                </div>
                <div className="h-[50px] bg-gray-200 rounded-md w-[170px]" />
            </div>
        </div>
    );
}

export function WalletSkeleton() {
    return (
        <div className="min-h-screen animate-pulse bg-white px-5 py-6 max-w-[800px] mx-auto">

            <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-52" />
                <div className="h-4 bg-gray-200 rounded w-72" />
            </div>

            <div className="mt-8">
                <div className="h-5 bg-gray-200 rounded w-40 mb-5" />

                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i}>
                            <div className="h-4 bg-gray-200 rounded w-40 mb-2" />
                            <div className="h-12 bg-gray-200 rounded-lg w-full" />
                        </div>
                    ))}
                </div>

                <div className="h-12 bg-gray-200 rounded-lg w-full mt-8" />
            </div>
        </div>
    );
}

export function UnverifiedWalletSkeleton() {
    return (
        <div className="px-5 max-w-[800px] mx-auto animate-pulse">

            {/* Alert */}
            <div className="h-16 rounded-lg bg-gray-200 mt-8" />

            {/* Balance Card */}
            <div className="mt-8 h-[150px] rounded-lg bg-gray-200" />

            {/* Empty state */}
            <div className="mt-10 flex flex-col items-center gap-3">
                <div className="h-4 bg-gray-200 rounded w-44" />
                <div className="h-4 bg-gray-200 rounded w-56" />
            </div>

            {/* Button */}
            <div className="h-[50px] rounded-lg bg-gray-200 mt-8" />
        </div>
    );
}

export function VerifiedWalletSkeleton() {
    return (
        <div className="mk:bg-[#DBEAFE] min-h-screen animate-pulse">

            <div className="space-y-4 mk:space-y-0 pb-14 pt-4 px-5 mk:grid grid-cols-2 gap-10 mk:p-14 max-w-[1900px] mx-auto">

                {/* LEFT COLUMN */}
                <div className="space-y-6">

                    {/* Wallet card */}
                    <div className="h-[220px] bg-gray-200 rounded-2xl" />

                    {/* Chart */}
                    <div className="bg-white rounded-xl p-5">
                        <div className="flex gap-2 mb-6">
                            <div className="h-8 w-24 rounded-lg bg-gray-200" />
                            <div className="h-8 w-24 rounded-lg bg-gray-200" />
                        </div>

                        <div className="h-[220px] bg-gray-100 rounded-lg" />
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="bg-white rounded-xl p-5">

                    <div className="flex justify-between mb-6">
                        <div className="h-5 bg-gray-200 rounded w-32" />
                        <div className="h-4 bg-gray-200 rounded w-16" />
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div
                                key={i}
                                className="flex justify-between items-center"
                            >
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-28" />
                                    <div className="h-3 bg-gray-200 rounded w-20" />
                                </div>

                                <div className="h-5 bg-gray-200 rounded w-16" />
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

export function WalletDetailsSkeleton() {
    return (
        <div className="min-h-screen animate-pulse">

            {/* Header */}
            <div className="px-5 py-4 border-b">
                <div className="h-6 bg-gray-200 rounded w-36" />
            </div>

            {/* Content */}
            <div className="px-5 mt-8">
                <div className="h-[220px] bg-gray-200 rounded-xl" />

                <div className="space-y-4 mt-8">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-16 bg-gray-200 rounded-xl"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}