import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState<boolean | null>(null); // null = unknown yet
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(`${backendUrl}/api/onboarding/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch onboarding status");

        const data = await res.json();

        setCompleted(data?.data?.is_completed || false);
      } catch (err) {
        console.error(err);
        setHasError(true); // NEW — mark that we couldn't determine status, don't guess "false"
      } finally {
        setLoading(false);
      }
    };

    checkOnboarding();
  }, []);

  if (loading) return null;

  // NEW — request failed (network drop, server down, etc). We don't know their
  // real onboarding status, so don't force them to /onboarding. Let them through.
  if (hasError) {
    return children;
  }

  if (completed === false) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default OnboardingGuard; 