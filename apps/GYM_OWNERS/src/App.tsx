import { Route, Routes } from "react-router-dom"
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

function App() {

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

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
            path="/workoutform"
            element={
              <ProtectedRoute>
                <WorkoutForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/"
            element={
              <GymOwnerHome />
            }
          />

          <Route
            path="/gym"
            element={
              <Gym />
            }
          />

          <Route
            path="/wallet"
            element={
              <Wallet />
            }
          />

          <Route
            path="/profile"
            element={
              <Profile />
            }
          />

          <Route
            path="/profile/edit"
            element={
              <EditProfile />
            }
          />

          <Route
            path="/notifications"
            element={
              <Notifications Loading={loading} />
            }
          />

          <Route
            path="/support"
            element={
              <Support />
            }
          />


          <Route path="*" element={<NotFound Loading={loading} />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
