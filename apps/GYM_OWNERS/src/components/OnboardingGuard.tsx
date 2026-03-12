import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(`${backendUrl}/api/onboarding/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        setCompleted(data?.data?.is_completed || false);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    checkOnboarding();
  }, []);

  if (loading) return null;

  if (!completed) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default OnboardingGuard;