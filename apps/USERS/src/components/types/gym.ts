export type Facility =
    | "Trainer"
    | "Shower"
    | "Locker"
    | "Restroom"
    | "Parking";

export interface Gym {
    name: string;
    images: string[];
    distance: string;
    location: string;
    open: string;
    price: number;
    facilities: Facility[];
}
