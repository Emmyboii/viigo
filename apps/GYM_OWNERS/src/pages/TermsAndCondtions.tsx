const terms = [
  {
    title: "1. About Viigo",
    body: "Viigo is a fitness booking and social fitness platform that enables users to discover and book gyms, fitness centers, trainers, and fitness-related services.",
  },
  {
    title: "2. Eligibility",
    body: "Users must be at least 18 years old or use the platform with guardian consent. Users confirm that all information provided is accurate and lawful.",
  },
  {
    title: "3. User Account",
    body: "Users are responsible for maintaining the confidentiality of account credentials and all activities under their account.",
  },
  {
    title: "4. Fitness Bookings",
    body: "Bookings are confirmed only after successful payment and slot availability confirmation. Users must follow gym rules and timing requirements.",
  },
  {
    title: "5. Payments",
    body: "Payments are processed through third-party gateways. Additional taxes or convenience fees may apply.",
  },
  {
    title: "6. Refunds and Cancellations",
    body: "Refund eligibility depends on booking type, timing, and partner policies. No-shows may not qualify for refunds.",
  },
  {
    title: "7. Health Disclaimer",
    body: "Fitness activity involves inherent risks. Users participate at their own risk and should consult a medical professional before beginning any fitness program.",
  },
  {
    title: "8. User Conduct",
    body: "Users must not engage in unlawful, abusive, fraudulent, or harmful activities while using the platform.",
  },
  {
    title: "9. Intellectual Property",
    body: "All Viigo branding, content, and software are protected under applicable intellectual property laws.",
  },
  {
    title: "10. Privacy",
    body: "Viigo may collect user information including contact details, location data, booking information, and device information for operational purposes.",
  },
  {
    title: "11. Notifications and Communications",
    body: "Users consent to receiving OTPs, booking alerts, push notifications, emails, and promotional communications.",
  },
  {
    title: "12. Third-Party Services",
    body: "Viigo may integrate with payment gateways, maps, cloud providers, SMS services, and authentication providers.",
  },
  {
    title: "13. Limitation of Liability",
    body: "Viigo shall not be liable for indirect damages, injuries, service interruptions, disputes, or losses arising from platform usage.",
  },
  {
    title: "14. Indemnification",
    body: "Users agree to indemnify Viigo from claims or liabilities arising from misuse of the platform or violation of these Terms.",
  },
  {
    title: "15. Suspension and Termination",
    body: "Viigo may suspend or terminate accounts that violate policies, create safety concerns, or engage in fraudulent activity.",
  },
  {
    title: "16. Modifications to the Platform",
    body: "Viigo may add, remove, or modify features and pricing at any time without prior notice.",
  },
  {
    title: "17. Changes to Terms",
    body: "Continued use of Viigo after updates to these Terms constitutes acceptance of the revised Terms.",
  },
  {
    title: "18. Governing Law",
    body: "These Terms are governed by the laws of India. Disputes shall fall under the jurisdiction of courts in Chennai, Tamil Nadu, India.",
  },
];

const TermsAndCondtions = () => {
  return (
    <main className="min-h-screen bg-white px-6 py-8 text-black sm:px-12 lg:px-16">
      <section className="mx-auto max-w-[900px]">
        <h1 className="text-center text-[28px] font-bold leading-tight sm:text-[34px]">
          Viigo - Terms and Conditions
        </h1>

        <div className="mt-14 border-t border-[#bfbfbf]" />

        <p className="mt-16 max-w-[870px] text-[16px] leading-[1.75] sm:text-[18px]">
          Welcome to Viigo. These Terms and Conditions ("Terms") govern your
          access to and use of the Viigo mobile application, website, platform,
          and related services ("Platform", "Viigo", "we", "our", or "us"). By
          accessing, registering, or using Viigo, you agree to comply with these
          Terms.
        </p>

        <div className="mt-16 space-y-11">
          {terms.map((term) => (
            <section key={term.title}>
              <h2 className="text-[14px] font-bold leading-6 sm:text-[15px]">
                {term.title}
              </h2>
              <p className="text-[14px] leading-[1.7] sm:text-[15px]">
                {term.body}
              </p>
            </section>
          ))}
        </div>

        <section className="mt-14">
          <h2 className="text-[14px] font-bold leading-6 sm:text-[15px]">
            19. Contact Information
          </h2>
          <div className="space-y-1 text-[14px] leading-[1.6] sm:text-[15px]">
            <p>Viigo Support</p>
            <p>Email: support@viigo.in</p>
            <p>Website: www.viigo.in</p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-[14px] font-bold leading-6 sm:text-[15px]">
            20. Acceptance of Terms
          </h2>
          <p className="text-[14px] leading-[1.7] sm:text-[15px]">
            By using Viigo, users confirm that they have read, understood, and
            agreed to these Terms and Conditions.
          </p>
        </section>
      </section>
    </main>
  );
};

export default TermsAndCondtions;
