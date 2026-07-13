export function GymCardSkeleton() {
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden h-[350px] flex flex-col">
            <div className="h-40 animate-shimmer" />
            <div className="p-4 flex flex-col flex-1">
                <div className="h-4 animate-shimmer rounded w-3/4" />
                <div className="flex items-center gap-2 mt-2">
                    <div className="h-3 animate-shimmer rounded w-1/2" />
                    <div className="h-3 animate-shimmer rounded w-1/4" />
                </div>
                <div className="flex gap-2 mt-3">
                    <div className="h-6 animate-shimmer rounded-full w-16" />
                    <div className="h-6 animate-shimmer rounded-full w-20" />
                    <div className="h-6 animate-shimmer rounded-full w-12" />
                </div>
                <div className="flex justify-between items-center mt-auto pt-4">
                    <div className="h-5 animate-shimmer rounded w-20" />
                    <div className="h-4 animate-shimmer rounded w-20" />
                </div>
            </div>
        </div>
    );
}

export function GymHorizontalCardSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-[#E2E8F0] flex">
            <div className="w-[85px] min-h-[110px] animate-shimmer rounded-tl rounded-bl flex-shrink-0" />
            <div className="flex flex-col justify-between w-full p-3">
                <div>
                    <div className="h-4 animate-shimmer rounded w-2/3" />
                    <div className="flex items-center gap-2 mt-2">
                        <div className="h-3 animate-shimmer rounded w-1/3" />
                        <div className="h-3 animate-shimmer rounded w-1/4" />
                    </div>
                    <div className="flex gap-1 mt-2">
                        <div className="h-6 animate-shimmer rounded-full w-16" />
                        <div className="h-6 animate-shimmer rounded-full w-16" />
                    </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <div className="h-5 animate-shimmer rounded w-16" />
                    <div className="h-8 animate-shimmer rounded w-[121px]" />
                </div>
            </div>
        </div>
    );
}

export function BookingCardSkeleton() {
    return (
        <div className="bg-white rounded border border-[#E2E8F0] min-h-[140px] flex gap-3">
            <div className="w-20 min-h-full animate-shimmer rounded-tl rounded-bl flex-shrink-0" />
            <div className="flex flex-col justify-between w-full p-3 pl-0">
                <div className="space-y-[7px]">
                    <div className="h-4 animate-shimmer rounded w-2/3" />
                    <div className="h-3 animate-shimmer rounded w-1/2" />
                    <div className="h-3 animate-shimmer rounded w-3/4" />
                    <div className="h-3 animate-shimmer rounded w-1/2" />
                </div>
                <div className="flex justify-between items-center mt-4 gap-2">
                    <div className="h-3 animate-shimmer rounded w-16" />
                    <div className="h-7 animate-shimmer rounded-full w-36" />
                </div>
            </div>
        </div>
    );
}

export function CancelBookingSkeleton() {
    return (
        <div className="min-h-screen p-4 max-w-[1300px] mx-auto">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-5 h-5 animate-shimmer rounded" />
                <div className="h-5 animate-shimmer rounded w-32" />
            </div>

            {/* Gym card */}
            <div className="bg-white rounded shadow-sm border flex">
                <div className="w-20 min-h-[90px] animate-shimmer rounded-tl rounded-bl flex-shrink-0" />
                <div className="flex-1 p-3 space-y-2">
                    <div className="h-4 animate-shimmer rounded w-2/3" />
                    <div className="h-3 animate-shimmer rounded w-1/2" />
                    <div className="h-3 animate-shimmer rounded w-1/3" />
                </div>
            </div>

            {/* Refund summary */}
            <div className="bg-white rounded-xl p-4 mt-5 border shadow-sm space-y-3">
                <div className="h-4 animate-shimmer rounded w-1/3" />
                <div className="flex justify-between">
                    <div className="h-3 animate-shimmer rounded w-1/4" />
                    <div className="h-3 animate-shimmer rounded w-16" />
                </div>
                <div className="flex justify-between">
                    <div className="h-3 animate-shimmer rounded w-1/3" />
                    <div className="h-3 animate-shimmer rounded w-16" />
                </div>
                <div className="border border-dashed border-gray-200" />
                <div className="flex justify-between">
                    <div className="h-3 animate-shimmer rounded w-1/3" />
                    <div className="h-3 animate-shimmer rounded w-16" />
                </div>
            </div>

            {/* Reasons */}
            <div className="mt-8 space-y-3">
                <div className="h-4 animate-shimmer rounded w-1/2 mb-3" />
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 animate-shimmer rounded w-full" />
                ))}
            </div>
        </div>
    );
}

export function EditProfileSkeleton() {
    return (
        <div className="p-5 max-w-[1300px] mx-auto">
            <div className="pt-14" />
            <div className="border border-gray-100 py-6 px-4 rounded-md space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-4 animate-shimmer rounded w-28" />
                        <div className="h-3 animate-shimmer rounded w-40" />
                    </div>
                    <div className="w-[69px] h-[69px] rounded-full animate-shimmer" />
                </div>
                <div className="border border-dashed border-gray-200" />
                <div className="space-y-4 pt-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-3 animate-shimmer rounded w-20" />
                            <div className="h-[50px] animate-shimmer rounded-lg w-full" />
                        </div>
                    ))}
                </div>
            </div>
            <div className="h-[50px] animate-shimmer rounded-md w-full mt-8" />
        </div>
    );
}

export function FAQSkeleton() {
    return (
        <div className="min-h-screen py-6 max-w-[1300px] mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-5 h-5 animate-shimmer rounded" />
                <div className="h-5 animate-shimmer rounded w-20" />
            </div>
            <div className="h-3 animate-shimmer rounded w-48 mb-4" />
            <div className="flex gap-3 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 animate-shimmer rounded-lg w-20 flex-shrink-0" />
                ))}
            </div>
            <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-14 animate-shimmer rounded-xl w-full" />
                ))}
            </div>
        </div>
    );
}

export function BookingModalSkeleton() {
    return (
        <div className="min-h-screen pb-28 max-w-[400px] mx-auto px-4">
            <div className="flex flex-col items-center pt-10 pb-6 gap-3">
                <div className="w-16 h-16 rounded-full animate-shimmer" />
                <div className="h-5 animate-shimmer rounded w-40" />
                <div className="h-3 animate-shimmer rounded w-56" />
            </div>
            <div className="animate-shimmer rounded-3xl h-[420px] w-full" />
            <div className="mt-6 space-y-3 px-1">
                <div className="h-4 animate-shimmer rounded w-24" />
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex justify-between">
                        <div className="h-3 animate-shimmer rounded w-24" />
                        <div className="h-3 animate-shimmer rounded w-16" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function PaymentSuccessSkeleton() {
    return (
        <div className="min-h-screen pb-28 max-w-[400px] mx-auto px-3">
            <div className="flex flex-col items-center pt-10 pb-6 gap-3">
                <div className="w-16 h-16 rounded-full animate-shimmer" />
                <div className="h-5 animate-shimmer rounded w-40" />
                <div className="h-3 animate-shimmer rounded w-48" />
            </div>
            <div className="animate-shimmer rounded-3xl h-[460px] w-full" />
            <div className="mt-6 space-y-3 px-2">
                <div className="h-4 animate-shimmer rounded w-24" />
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex justify-between">
                        <div className="h-3 animate-shimmer rounded w-24" />
                        <div className="h-3 animate-shimmer rounded w-16" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function GymDetailsSkeleton() {
    return (
        <div className="pb-32 bg-white min-h-screen max-w-[1300px] mx-auto">
            <div className="pt-14" />
            <div className="h-[174px] animate-shimmer" />
            <div className="p-4 space-y-6">
                <div className="space-y-2">
                    <div className="h-6 animate-shimmer rounded w-2/3" />
                    <div className="h-3 animate-shimmer rounded w-1/2" />
                    <div className="flex gap-2 mt-4">
                        <div className="h-7 animate-shimmer rounded-full w-20" />
                        <div className="h-7 animate-shimmer rounded-full w-24" />
                    </div>
                </div>
                <div className="border border-dashed border-gray-100" />
                <div className="space-y-3">
                    <div className="h-4 animate-shimmer rounded w-32" />
                    {[1, 2, 3, 4].map((i) => <div key={i} className="h-3 animate-shimmer rounded w-40" />)}
                    <div className="h-12 animate-shimmer rounded-md w-full mt-4" />
                </div>
                <div className="border border-dashed border-gray-100" />
                <div className="space-y-3">
                    <div className="h-4 animate-shimmer rounded w-16" />
                    {[1, 2, 3].map((i) => <div key={i} className="h-3 animate-shimmer rounded w-full" />)}
                </div>
            </div>
        </div>
    );
}

export function PlanWorkoutSkeleton() {
    return (
        <div className="pb-40 min-h-screen px-3.5 max-w-[1300px] mx-auto">
            <div className="pt-14" />
            <div className="bg-white rounded-xl border flex gap-1 h-[115px]">
                <div className="w-[85px] animate-shimmer rounded-tl-xl rounded-bl-xl flex-shrink-0" />
                <div className="p-3 space-y-2 flex-1">
                    <div className="h-4 animate-shimmer rounded w-2/3" />
                    <div className="h-3 animate-shimmer rounded w-1/2" />
                    <div className="h-4 animate-shimmer rounded w-20" />
                </div>
            </div>
            <div className="h-5 animate-shimmer rounded w-32 mt-5 mb-3" />
            <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="min-w-[70px] h-[90px] animate-shimmer rounded-md flex-shrink-0" />
                ))}
            </div>
            <div className="mt-6 space-y-3">
                <div className="h-4 animate-shimmer rounded w-48" />
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-8 animate-shimmer rounded-md w-16" />)}
                </div>
            </div>
            <div className="mt-7 space-y-3">
                <div className="h-4 animate-shimmer rounded w-36" />
                <div className="h-[110px] animate-shimmer rounded-lg" />
                <div className="h-[90px] animate-shimmer rounded-lg" />
            </div>
        </div>
    );
}

export function ReviewPaySkeleton() {
    return (
        <div className="pb-36 min-h-screen max-w-[1300px] mx-auto">
            <div className="pt-14" />
            <div className="p-4 space-y-4">
                <div className="rounded-xl border flex gap-1 h-[100px]">
                    <div className="w-[85px] animate-shimmer rounded-tl-xl rounded-bl-xl flex-shrink-0" />
                    <div className="flex-1 p-2 space-y-2">
                        <div className="h-4 animate-shimmer rounded w-2/3" />
                        <div className="h-3 animate-shimmer rounded w-1/2" />
                        <div className="h-3 animate-shimmer rounded w-1/3" />
                    </div>
                </div>
                <div className="rounded-xl border p-4 space-y-3 h-[180px]">
                    <div className="h-4 animate-shimmer rounded w-32" />
                    <div className="h-3 animate-shimmer rounded w-48" />
                    <div className="h-3 animate-shimmer rounded w-40" />
                    <div className="h-3 animate-shimmer rounded w-36" />
                </div>
                <div className="space-y-3">
                    <div className="h-4 animate-shimmer rounded w-32" />
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex justify-between">
                            <div className="h-3 animate-shimmer rounded w-28" />
                            <div className="h-3 animate-shimmer rounded w-16" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}