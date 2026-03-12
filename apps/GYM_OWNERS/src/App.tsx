// import { Route, Routes } from "react-router-dom"
// import AuthPage from "./pages/AuthPage"
// import Loader from './components/Loader';
// import OTPVerification from "./pages/OTPVerification";
// import WorkoutForm from "./pages/WorkoutForm";
// import GymOwnerHome from "./pages/GymOwnerHome";
// import ProtectedRoute from "./components/ProtectedRoute";
// import PublicRoute from "./components/PublicRoute";
// import Gym from "./pages/Gym";
// import Wallet from "./pages/Wallet";
// import Profile from "./pages/Profile";
// import EditProfile from "./pages/EditProfile";
// import Notifications from "./pages/Notification";
// import Support from "./pages/Support";
// import NotFound from "./pages/NotFound";
// import Transactions from "./pages/Transactions";
// import TransactionDetails from "./pages/TransactionDetails";
// import FAQ from "./pages/FAQ";
// import { useAppContext } from "./context/AppContext";

// function App() {

//   const { loading, userData, selectedGym, setSelectedGym, display, setDisplay, isLoading } = useAppContext();

//   return (
//     <div className="font-manrope relative">
//       {/* Loader */}
//       <div
//         className={`fixed inset-0 z-50 transition-opacity duration-500 ${loading ? "opacity-100" : "opacity-0 pointer-events-none"
//           }`}
//       >
//         <Loader />
//       </div>

//       <div className={`${loading ? "hidden" : "block"}`}>
//         <Routes>
//           <Route
//             path="/login"
//             element={
//               <PublicRoute>
//                 <AuthPage />
//               </PublicRoute>
//             }
//           />

//           <Route
//             path="/signup"
//             element={
//               <PublicRoute>
//                 <AuthPage />
//               </PublicRoute>
//             }
//           />

//           <Route
//             path="/validateotp"
//             element={
//               <PublicRoute>
//                 <OTPVerification />
//               </PublicRoute>
//             }
//           />
//           <Route
//             path="/onboarding"
//             element={
//               <ProtectedRoute>
//                 <WorkoutForm />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/"
//             element={
//               <ProtectedRoute>
//                 <GymOwnerHome />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/gym"
//             element={
//               <ProtectedRoute>
//                 {userData && <Gym setGym={setSelectedGym} display={display} setDisplay={setDisplay} gym={selectedGym} loading={isLoading} />}
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/wallet"
//             element={
//               <ProtectedRoute>
//                 <Wallet />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/wallet/transactions"
//             element={
//               <ProtectedRoute>
//                 <Transactions />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/wallet/transactions/:id"
//             element={
//               <ProtectedRoute>
//                 <TransactionDetails />
//               </ProtectedRoute>
//             }
//           />


//           <Route
//             path="/profile"
//             element={
//               <ProtectedRoute>
//                 <Profile user={userData} />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/profile/edit"
//             element={
//               <ProtectedRoute>
//                 <EditProfile />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/notifications"
//             element={
//               <ProtectedRoute>
//                 <Notifications Loading={loading} />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/support"
//             element={
//               <ProtectedRoute>
//                 <Support />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/faq"
//             element={
//               <ProtectedRoute>
//                 <FAQ />
//               </ProtectedRoute>
//             }
//           />

//           <Route path="*" element={<NotFound Loading={loading} />} />
//         </Routes>
//       </div>
//     </div>
//   )
// }

// export default App


import { Route, Routes } from "react-router-dom"
import AuthPage from "./pages/AuthPage"
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
import { useAppContext } from "./context/AppContext";
import OnboardingGuard from "./components/OnboardingGuard";
import EditWallet from "./pages/EditWallet";

function App() {

  const { loading, userData, selectedGym, setSelectedGym, display, setDisplay, isLoading } = useAppContext();

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
                <OnboardingGuard>
                  <GymOwnerHome />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/gym"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  {userData && <Gym setGym={setSelectedGym} display={display} setDisplay={setDisplay} gym={selectedGym} loading={isLoading} />}
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <Wallet />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/wallet/edit"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <EditWallet />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/wallet/transactions"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <Transactions />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/wallet/transactions/:id"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <TransactionDetails />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />


          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <Profile user={userData} />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <EditProfile />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <Notifications Loading={loading} />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <Support />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/faq"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <FAQ />
                </OnboardingGuard>
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
