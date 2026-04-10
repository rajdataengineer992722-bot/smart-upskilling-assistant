import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

type ProtectedRouteProps = {
  children: ReactElement;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
}
