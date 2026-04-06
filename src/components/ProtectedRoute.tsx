import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import TitanSkeleton from "./titan/TitanSkeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireSubscription?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireSubscription = false,
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <TitanSkeleton variant="kpi" />
          <TitanSkeleton variant="card" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    if (profile.role === "facilitateur") return <Navigate to="/facilitateur" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  if (requireSubscription && profile?.role === "entreprise") {
    const status = profile?.subscription_status;
    if (status !== "active" && status !== "past_due") {
      return <Navigate to="/pricing" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
