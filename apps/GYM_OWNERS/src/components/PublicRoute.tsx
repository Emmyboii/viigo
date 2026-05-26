import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface PublicRouteProps {
    children: ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
    const token = localStorage.getItem("token");

    // If logged in, redirect to home
    if (token) {
        return <Navigate to="/onboarding" replace />;
    }

    return children;
};

export default PublicRoute;
