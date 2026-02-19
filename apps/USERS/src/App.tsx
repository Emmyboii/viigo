import { Route, Routes } from "react-router-dom"
import AuthPage from "./pages/AuthPage"
import { useEffect, useState } from "react";
import Loader from './components/Loader';
import UserHome from "./pages/UserHome";
import OTPVerification from "./pages/OTPVerification";
import WorkoutForm from "./pages/WorkoutForm";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import GymDetails from "./pages/GymDetails";
import ReviewPay from "./pages/ReviewPay";
import PaymentSuccess from "./pages/PaymentSuccess";
import Notifications from "./pages/Notification";
import Bookings from "./pages/Bookings";
import CancelBooking from "./pages/CancelBooking";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";

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
              <ProtectedRoute>
                <UserHome />
              </ProtectedRoute>
            }
          />

          <Route
            path="/gyms/:slug"
            element={
              <ProtectedRoute>
                <GymDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reviewpay"
            element={
              <ProtectedRoute>
                <ReviewPay />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment/success"
            element={
              <ProtectedRoute>
                <PaymentSuccess Loading={loading} />
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
            path="/bookings"
            element={
              <ProtectedRoute>
                <Bookings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cancelbookings"
            element={
              <ProtectedRoute>
                <CancelBooking />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
        </Routes>

      </div>
    </div>
  )
}

export default App
