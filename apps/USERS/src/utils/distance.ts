/**
 * Haversine formula — returns distance in km between two lat/lng points.
 */
export function haversineDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number
): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Returns a formatted distance string like "2.3 km".
 */
export function formatDistance(km: number): string {
    return `${km.toFixed(1)} km`;
}

/**
 * Injects a calculated `distance` string into each gym object.
 * Call this right after any API fetch that returns gyms.
 */
export function injectDistances<T extends { latitude: string | number; longitude: string | number }>(
    gyms: T[],
    userLat: number,
    userLng: number
): (T & { distance: string })[] {
    return gyms.map((gym) => {
        const km = haversineDistance(
            userLat, userLng,
            parseFloat(String(gym.latitude)),
            parseFloat(String(gym.longitude))
        );
        return { ...gym, distance: formatDistance(km) };
    });
}