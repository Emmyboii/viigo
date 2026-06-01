import type { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface PublicRouteProps {
    children: JSX.Element;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
    const token = localStorage.getItem("token");
    const location = useLocation();


    if (token) {
        const from = (location.state as { from?: string })?.from || "/";
        console.log("PublicRoute: redirecting to:", from);
        return <Navigate to={from} replace />;
    }

    return children;
};

export default PublicRoute;