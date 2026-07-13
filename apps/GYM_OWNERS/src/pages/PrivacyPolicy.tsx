import { useEffect } from "react";

const privacySections = [
    {
        title: "1. Information We Collect",
        body: "Viigo may collect personal information such as your name, phone number, email address, location, profile details, booking history, payment status, and device information when you use the platform.",
    },
    {
        title: "2. How We Use Information",
        body: "We use collected information to create and manage accounts, process bookings, send OTPs and alerts, personalize the user experience, improve services, prevent misuse, and provide customer support.",
    },
    {
        title: "3. Location Data",
        body: "Viigo may use location data to help users discover nearby gyms, fitness centers, trainers, and fitness-related services. Users can manage location permissions through their device settings.",
    },
    {
        title: "4. Booking and Payment Information",
        body: "Booking details may be shared with partner gyms, trainers, or service providers to confirm and manage reservations. Payments are processed through third-party payment gateways and Viigo does not store complete card or banking details.",
    },
    {
        title: "5. Communications",
        body: "Viigo may send service messages, OTPs, booking updates, support responses, promotional offers, emails, and push notifications. Users may opt out of promotional communication where applicable.",
    },
    {
        title: "6. Sharing of Information",
        body: "We may share necessary information with service partners, payment providers, analytics tools, SMS providers, cloud hosting vendors, and legal authorities when required by law or platform safety needs.",
    },
    {
        title: "7. Data Security",
        body: "Viigo uses reasonable technical and organizational measures to protect user information from unauthorized access, misuse, alteration, or disclosure. However, no digital platform can guarantee absolute security.",
    },
    {
        title: "8. Data Retention",
        body: "We retain user information for as long as needed to provide services, comply with legal obligations, resolve disputes, prevent fraud, and enforce platform policies.",
    },
    {
        title: "9. User Rights",
        body: "Users may request access, correction, update, or deletion of their personal information, subject to verification and applicable legal or operational requirements.",
    },
    {
        title: "10. Cookies and Analytics",
        body: "Viigo may use cookies, analytics tools, and similar technologies to understand platform usage, improve performance, remember preferences, and measure service effectiveness.",
    },
    {
        title: "11. Third-Party Links and Services",
        body: "The platform may contain integrations or links to third-party services. Viigo is not responsible for the privacy practices, content, or policies of third-party platforms.",
    },
    {
        title: "12. Children's Privacy",
        body: "Viigo is intended for users who are at least 18 years old or using the platform with guardian consent. We do not knowingly collect information from children without appropriate consent.",
    },
    {
        title: "13. Changes to This Policy",
        body: "Viigo may update this Privacy Policy from time to time. Continued use of the platform after updates means users accept the revised policy.",
    },
];

const PrivacyPolicy = () => {

    useEffect(() => {
        document.title = "Viigo – Privacy Policy";

        // Optional: restore the default title when leaving the page
        return () => {
            document.title = "Viigo – Find Gyms Near You";
        };
    }, []);
    
    return (
        <main className="min-h-screen bg-white px-6 py-8 text-black sm:px-12 lg:px-16">
            <section className="mx-auto max-w-[900px]">
                <h1 className="text-center text-[28px] font-bold leading-tight sm:text-[34px]">
                    Viigo - Privacy Policy
                </h1>

                <div className="mt-14 border-t border-[#bfbfbf]" />

                <p className="mt-16 max-w-[870px] text-[16px] leading-[1.75] sm:text-[18px]">
                    This Privacy Policy explains how Viigo collects, uses, stores, and
                    protects information when users access or use the Viigo mobile
                    application, website, platform, and related services. By using Viigo,
                    users agree to the practices described in this Privacy Policy.
                </p>

                <div className="mt-16 space-y-11">
                    {privacySections.map((section) => (
                        <section key={section.title}>
                            <h2 className="text-[14px] font-bold leading-6 sm:text-[15px]">
                                {section.title}
                            </h2>
                            <p className="text-[14px] leading-[1.7] sm:text-[15px]">
                                {section.body}
                            </p>
                        </section>
                    ))}
                </div>

                <section className="mt-14">
                    <h2 className="text-[14px] font-bold leading-6 sm:text-[15px]">
                        14. Contact Information
                    </h2>
                    <div className="space-y-1 text-[14px] leading-[1.6] sm:text-[15px]">
                        <p>Viigo Support</p>
                        <p>Email: support@viigo.in</p>
                        <p>Website: www.viigo.in</p>
                    </div>
                </section>
            </section>
        </main>
    );
};

export default PrivacyPolicy;