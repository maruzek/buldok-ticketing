import { Navigate, Outlet, useLocation } from "react-router";
import useAuth from "../hooks/useAuth";
import { useEffect, useRef } from "react";

type ProtectedRouteProps = {
  allowedRoles?: string[];
};

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { auth } = useAuth();
  const location = useLocation();
  const wasAuthenticated = useRef(!!auth.user);

  useEffect(() => {
    if (auth.user) {
      wasAuthenticated.current = true;
    }
  }, [auth.user]);

  if (!auth.user) {
    console.log("ProtectedRoute: No user found, redirecting to login.");
    const reason = wasAuthenticated.current ? "?reason=unauthenticated" : "";
    return <Navigate to={`/${reason}`} state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = auth.user?.roles || [];

    const hasRequiredRole = allowedRoles.some((role) =>
      userRoles.includes(role)
    );

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
  }
  return <Outlet />;
};

export default ProtectedRoute;
