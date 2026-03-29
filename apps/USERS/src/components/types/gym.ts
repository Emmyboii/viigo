export interface Amenity {
    id?: number;
    name?: string;
    image?: string;
}

interface Rule {
    id: number;
    description: string;
}

export interface Image {
    id: number;
    image: string;
}

export interface Gym {
    id: number;
    name: string;
    slug: string;
    owner_email: string;
    phone_number: string;
    location: string;
    address_line_1: string,
    area: string,
    city: string,
    state: string,
    postal_code: string,
    latitude: string;
    longitude: string;
    open_time: string;
    close_time: string;
    open_status: string;
    hourly_rate: number;
    distance: string;
    images: Image[];
    amenities: Amenity[];
    rules: Rule[];
    peak_morning?: ([string, string] | { start: string; end: string })[];
    peak_evening?: ([string, string] | { start: string; end: string })[];
    calendar_availability?: any[];
}
