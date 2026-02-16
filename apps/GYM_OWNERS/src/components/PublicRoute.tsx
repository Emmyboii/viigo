import type { JSX } from "react";
import { Navigate } from "react-router-dom";

interface PublicRouteProps {
    children: JSX.Element;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
    const token = localStorage.getItem("token");

    // If logged in, redirect to home
    if (token) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PublicRoute;
