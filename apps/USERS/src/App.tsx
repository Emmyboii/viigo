import { Route, Routes, useLocation } from "react-router-dom"
import AuthPage from "./pages/AuthPage"
import Loader from './components/Loader';
import UserHome from "./pages/UserHome";
import OTPVerification from "./pages/OTPVerification";
import WorkoutForm from "./pages/WorkoutForm";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import GymDetails from "./pages/GymDetails";
import ReviewPay from "./pages/ReviewPay";
// import PaymentSuccess from "./pages/PaymentSuccess";
import Notifications from "./pages/Notification";
import Bookings from "./pages/Bookings";
import CancelBooking from "./pages/CancelBooking";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import NotFound from "./pages/NotFound";
import FAQ from "./pages/FAQ";
import Support from "./pages/Support";
import { useAppContext } from "./context/AppContext";
import Explore from "./pages/Explore";
import Recommended from "./pages/Recommended";
import NearBy from "./pages/NearBy";
import { useEffect } from "react";

function App() {

  const { loading, userData } = useAppContext();
  const location = useLocation();

  useEffect(() => {
    if (
      !location.pathname.startsWith("/reviewpay") &&
      !location.pathname.startsWith("/gyms/")
    ) {
      localStorage.removeItem("bookingData");
    }
  }, [location.pathname]);

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
                <UserHome />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recommended"
            element={
              <ProtectedRoute>
                <Recommended />
              </ProtectedRoute>
            }
          />

          <Route
            path="/nearby"
            element={
              <ProtectedRoute>
                <NearBy />
              </ProtectedRoute>
            }
          />

          <Route
            path="/explore"
            element={
              <ProtectedRoute>
                <Explore />
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

          {/* <Route
            path="/payment/success"
            element={
              <ProtectedRoute>
                <PaymentSuccess Loading={loading} />
              </ProtectedRoute>
            }
          /> */}

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
            path="/cancelbooking/:slug"
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
