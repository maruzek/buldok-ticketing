import { Navigate, Outlet, useLocation } from "react-router";
import useAuth from "../hooks/useAuth";

type ProtectedRouteProps = {
  allowedRoles?: string[];
};

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth.user) {
    console.log("ProtectedRoute: No user found, redirecting to login.");
    return (
      <Navigate
        to="/?reason=unauthenticated"
        state={{ from: location }}
        replace
      />
    );
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
