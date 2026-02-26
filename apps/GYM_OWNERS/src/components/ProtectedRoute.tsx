import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    // Check for token in localStorage
    const token = localStorage.getItem("token");

    if (!token) {
        // Not logged in, redirect to /login
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
