import { useEffect } from "react";

const DeleteAccount = () => {
  useEffect(() => {
    document.title = "Viigo Partners - How to Delete Your Account";

    return () => {
      document.title = "Viigo Partners - Grow Your Gym";
    };
  }, []);

  return (
    <main className="min-h-screen bg-white px-6 py-8 text-black sm:px-12 lg:px-16">
      <section className="mx-auto max-w-[900px]">
        <div className="space-y-1 text-center">
          <h1 className="text-center text-[28px] font-bold leading-tight sm:text-[34px]">
            Viigo - How to Delete Your Account
          </h1>

          <p className="text-[14px]">Account Deletion Instructions</p>
        </div>

        <div className="mt-7 border-t border-[#bfbfbf]" />

        <div className="mt-8 space-y-7">
          <section>
            <h2 className="text-[14px] font-bold leading-6">
              How to Delete Your Account in the Viigo Partners App
            </h2>

            <p className="text-[14px] leading-[1.7]">
              You can permanently delete your Viigo account directly from the
              Viigo mobile application by following these steps:
            </p>

            <ol className="mt-2 list-decimal space-y-1 pl-5 text-[14px] leading-[1.7]">
              <li>
                Open the Viigo Partners App and go to your <strong>Profile</strong>.
              </li>

              <li>
                Scroll down to find <strong>Delete Account</strong>.
              </li>

              <li>Select a reason for deleting your account.</li>

              <li>
                Check the confirmation box:
                <br />
                <strong>
                  "I understand that deleting my account is permanent and
                  irreversible"
                </strong>
              </li>

              <li>
                Tap <strong>Delete My Account</strong>.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-[14px] font-bold leading-6">
              What Happens When You Delete Your Account
            </h2>

            <ul className="space-y-0.5 text-[14px] leading-[1.7]">
              <li>
                • Your profile, bookings, and all personal data are permanently
                removed from our servers.
              </li>

              <li>• This action is immediate and cannot be undone.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[14px] font-bold leading-6">
              Important Information
            </h2>

            <p className="text-[14px] leading-[1.7]">
              Account deletion is permanent. Once your account has been deleted,
              it cannot be restored and your personal information will no longer
              be available through the Viigo Services.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] font-bold leading-6">Need Help?</h2>

            <div className="space-y-0.5 text-[14px] leading-[1.6]">
              <p>
                If you are unable to delete your account through the Viigo Partners App,
                please contact us for assistance.
              </p>

              <p>Viigo</p>
              <p>
                Email:{" "}
                <a href="mailto:support@viigo.in" className="underline">
                  support@viigo.in
                </a>
              </p>

              <p>
                Website:{" "}
                <a
                  href="https://partners.viigo.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  https://partners.viigo.in
                </a>
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
};

export default DeleteAccount;
