import { Route, Routes, useNavigate } from "react-router-dom"
import AuthPage from "./pages/AuthPage"
import { useEffect, useState } from "react";
import Loader from './components/Loader';
import OTPVerification from "./pages/OTPVerification";
import WorkoutForm from "./pages/WorkoutForm";
import GymOwnerHome from "./pages/GymOwnerHome";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Gym from "./pages/Gym";
import Wallet from "./pages/Wallet";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Notifications from "./pages/Notification";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import Transactions from "./pages/Transactions";
import TransactionDetails from "./pages/TransactionDetails";
import FAQ from "./pages/FAQ";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

type UserType = {
  full_name: string;
  profile_image: string | null;
  email: string;
  phone_number: string | null;
  user_type: string;
  total_fitness_hours: number;
};

interface Amenity {
  id: number;
  name: string;
  icon: string;
}

interface Rule {
  id: number;
  description: string;
}

interface GymType {
  id: string;
  name: string;
  hourly_rate: string;
  phone_number: string;
  location: string;
  open_time: string;
  close_time: string;
  longitude: string;
  latitude: string;
  amenities: Amenity[];
  rules: Rule[];
  images: { id: number; image: string }[];

  peak_morning?: [string, string][];
  peak_evening?: [string, string][];
  calendar_availability?: []

  owner_email: string
}

function App() {

  const [loading, setLoading] = useState(true);

  const [userData, setUserData] = useState<UserType | null>(null);

  const [display, setDisplay] = useState<"details" | "edit" | "create">(() => {
    const stored = localStorage.getItem("gymDisplay");
    if (stored === "edit" || stored === "create" || stored === "details") {
      return stored;
    }
    return "details";
  });

  const [isLoading, setIsLoading] = useState(true);
  const [selectedGym, setSelectedGym] = useState<GymType | null>(null);

  // Persist display state
  useEffect(() => {
    localStorage.setItem("gymDisplay", display);
  }, [display]);

  useEffect(() => {
    async function fetchGyms() {
      setIsLoading(true);

      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${backendUrl}/gymowner/gyms`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch gyms");

        const data = await res.json();
        const gyms: GymType[] = data.data || [];

        if (gyms.length === 0) {
          setDisplay("create");
          return;
        }

        // 🔥 Find gym belonging to logged-in user
        const matchedGym = gyms.find(
          (gym) => gym?.owner_email === userData?.email
        );

        if (matchedGym) {
          setSelectedGym(matchedGym);
          setDisplay("details");
        } else {
          setDisplay("create");
        }
      } catch (err) {
        console.error(err);
        setDisplay("create");
      } finally {
        setIsLoading(false);
      }
    }

    fetchGyms();
  }, [userData]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${backendUrl}/api/user/profile/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch gyms");
        const data = await res.json();

        setUserData(data?.data)
      } catch (err) {
        console.error(err);
      }
    }
    fetchUsers();
  }, []);

  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3200);

    return () => clearTimeout(timer);
  }, []);


  useEffect(() => {
    const timestamp = localStorage.getItem("tokenTimestamp");

    if (!timestamp) return;

    const savedTime = Number(timestamp);
    const TWO_HOURS = 2 * 60 * 60 * 1000;

    const remainingTime = TWO_HOURS - (Date.now() - savedTime);

    if (remainingTime <= 0) {
      localStorage.removeItem("token");
      localStorage.removeItem("tokenTimestamp");
      navigate("/login");
      return;
    }

    const timer = setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("tokenTimestamp");
      navigate("/login");
    }, remainingTime);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="font-manrope relative">
      {/* Loader */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-500 ${loading ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      >
        <Loader />
      </div>

      <div className={`${loading ? "hidden" : "block"}`}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            }
          />

          <Route
            path="/signup"
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            }
          />

          <Route
            path="/validateotp"
            element={
              <PublicRoute>
                <OTPVerification />
              </PublicRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <WorkoutForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <GymOwnerHome gym={selectedGym} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/gym"
            element={
              <ProtectedRoute>
                {userData && <Gym setGym={setSelectedGym} display={display} setDisplay={setDisplay} gym={selectedGym} loading={isLoading} />}
              </ProtectedRoute>
            }
          />

          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            }
          />

          <Route
            path="/wallet/transactions"
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/wallet/transactions/:id"
            element={
              <ProtectedRoute>
                <TransactionDetails />
              </ProtectedRoute>
            }
          />


          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile user={userData} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications Loading={loading} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <Support />
              </ProtectedRoute>
            }
          />

          <Route
            path="/faq"
            element={
              <ProtectedRoute>
                <FAQ />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound Loading={loading} />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
