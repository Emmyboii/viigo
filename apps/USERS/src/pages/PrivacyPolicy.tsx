import { useEffect } from "react";

const PrivacyPolicy = () => {

    useEffect(() => {
        document.title = "Viigo - Privacy Policy";

        // Optional: restore the default title when leaving the page
        return () => {
            document.title = "Viigo - Find Gyms Near You";
        };
    }, []);

    return (
        <main className="min-h-screen bg-white px-6 py-8 text-black sm:px-12 lg:px-16">
            <section className="mx-auto max-w-[900px]">
                <div className="space-y-1 text-center">
                    <h1 className="text-center text-[28px] font-bold leading-tight sm:text-[34px]">
                        Viigo - Privacy Policy
                    </h1>
                    <p className="text-[14px]">Effective Date: June 2, 2026</p>
                </div>

                <div className="mt-7 border-t border-[#bfbfbf]" />


                <div className="mt-8 space-y-7">

                    <section>
                        <h2 className="text-[14px] font-bold leading-6">1. Introduction</h2>
                        <p className="text-[14px] leading-[1.7]">
                            Viigo ("Viigo", "we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the Viigo mobile application, website, and related services (collectively, the "Services").
                        </p>
                    </section>

                    <section>
                        <h2 className="text-[14px] font-bold leading-6">2. Information We Collect</h2>
                        <ul className="text-[14px] leading-[1.7] space-y-0.5">
                            <li>• Full name</li>
                            <li>• Mobile number</li>
                            <li>• Email address</li>
                            <li>• Profile information</li>
                            <li>• Location information</li>
                            <li>• Booking and activity information</li>
                            <li>• Device and usage information</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-[14px] font-bold leading-6">3. Payment Information</h2>
                        <p className="text-[14px] leading-[1.7]">
                            Payments are processed by trusted third-party providers, including Razorpay. Viigo does not store complete card details, UPI PINs, or banking credentials.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-[14px] font-bold leading-6">4. How We Use Your Information</h2>
                        <ul className="text-[14px] leading-[1.7] space-y-0.5">
                            <li>• Manage accounts and bookings</li>
                            <li>• Process payments</li>
                            <li>• Provide customer support</li>
                            <li>• Improve services</li>
                            <li>• Prevent fraud and abuse</li>
                            <li>• Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-[14px] font-bold leading-6">5. Information Sharing</h2>
                        <p className="text-[14px] leading-[1.7]">
                            We do not sell personal information. Information may be shared with fitness partners, service providers, legal authorities when required, or during business transfers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-[14px] font-bold leading-6">6. User Rights</h2>
                        <p className="text-[14px] leading-[1.7]">
                            Users may request access, correction, or deletion of personal information subject to applicable laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-[14px] font-bold leading-6">7. Data Retention</h2>
                        <p className="text-[14px] leading-[1.7]">
                            Information is retained as long as necessary to provide services and meet legal obligations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-[14px] font-bold leading-6">8. Data Security</h2>
                        <p className="text-[14px] leading-[1.7]">
                            We implement reasonable safeguards to protect user information, but no method of transmission or storage is completely secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-[14px] font-bold leading-6">9. Children's Privacy</h2>
                        <p className="text-[14px] leading-[1.7]">
                            Viigo is not intended for children under 18 without parental or guardian consent.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-[14px] font-bold leading-6">10. Changes to this Policy</h2>
                        <p className="text-[14px] leading-[1.7]">
                            We may update this Privacy Policy periodically. Updates will be posted within the Services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-[14px] font-bold leading-6">11. Contact Us</h2>
                        <div className="space-y-0.5 text-[14px] leading-[1.6]">
                            <p>Viigo</p>
                            <p>Email: support@viigo.in</p>
                            <p>Website: https://viigo.in</p>
                        </div>
                    </section>

                </div>
            </section>
        </main>
    );
};

export default PrivacyPolicy;