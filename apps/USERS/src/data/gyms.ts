import gym1 from "../assets/gymImg.png";
import gym2 from "../assets/gymImg2.png";

export const gyms = [
    {
        id: 1,

        name: "Fight To Fitness",
        slug: "fight-to-fitness",

        price: 370,
        timings: "9 AM - 10 PM",
        closeTime: "10 PM",

        distance: "0.8 Km • Pallavaram",

        phone: "+91 9876543210",
        locationLink: "https://maps.google.com",

        tags: ["Hourly Access", "Beginner Friendly"],

        amenities: [
            "Restroom",
            "Shower",
            "Locker",
            "Personal Trainer",
            "Parking",
            "Air Conditioning",
            "Cardio Area",
            "Weight Training Zone"
        ],

        rules: [
            "Slot timing is strictly followed",
            "Hourly passes must be used in one continuous session",
            "No refunds for missed slots",
            "Carry your own towel",
            "Proper gym shoes required"
        ],

        images: [gym1, gym2],
    },
];
