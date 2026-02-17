// notifications.ts
export const notifications = [
    {
        id: 1,
        type: "booking",
        title: "Upcoming Session",
        description:
            "You have booked session with Fight to fitness on 5th december for 1.5 hours",
        time: "4 hours ago",
        unread: true,
    },
    {
        id: 2,
        type: "start",
        title: "Session Started",
        description: "Prakash M's session has started.",
        time: "2 mins ago",
    },
    {
        id: 3,
        type: "end",
        title: "Session Ended",
        description: "Prakash M's session has ended.",
        time: "42 mins ago",
    },
    {
        id: 4,
        type: "payment",
        title: "Payment Received",
        description:
            "Paid ₹390 to fit fitness for your booking on 5th december for 2 hours",
        time: "15 mins ago",
    },
    {
        id: 5,
        type: "warning",
        title: "Session Ending Soon",
        description:
            "Prakash M's session will end in 10 minutes.",
        time: "Just now",
    },
];
