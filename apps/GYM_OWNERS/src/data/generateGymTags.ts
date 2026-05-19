interface GymAmenity {
    name: string;
    icon?: string;
}

interface GymForTags {
    gender_preference: string;
    amenities?: GymAmenity[];
    images?: unknown[];
}

export function generateGymTags(gym: GymForTags): string[] {
    const tags: string[] = [];

    if (gym.gender_preference === "EVERYONE") {
        tags.push("Unisex");
    } else if (gym.gender_preference === "WOMEN_ONLY") {
        tags.push("Women's Gym");
    }

    const amenityNames: string[] = (gym.amenities || []).map((a) =>
        a.name.toLowerCase()
    );

    const hasAmenity = (keywords: string[]) =>
        amenityNames.some((name) =>
            keywords.some((kw) => name.includes(kw))
        );

    if (hasAmenity(["trainer", "coach", "instructor", "personal"])) {
        tags.push("Trainer Available");
    }

    if (hasAmenity(["locker", "storage", "cubby"])) {
        tags.push("Locker Facility");
    }

    if (hasAmenity(["restroom", "washroom", "bathroom", "toilet", "shower"])) {
        tags.push("Washroom Available");
    }

    if ((gym.images || []).length >= 3) {
        tags.push("Verified Photos");
    }

    return tags;
}