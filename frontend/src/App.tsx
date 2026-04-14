import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { AuthPage } from "@/pages/auth-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { GamificationPage } from "@/pages/gamification-page";
import { KnowledgePage } from "@/pages/knowledge-page";
import { RecommendationsPage } from "@/pages/recommendations-page";
import { useAuth } from "@/hooks/use-auth";

function App() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={token ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="recommendations" element={<RecommendationsPage />} />
        <Route path="gamification" element={<GamificationPage />} />
        <Route path="knowledge" element={<KnowledgePage />} />
      </Route>
      <Route path="*" element={<Navigate to={token ? "/" : "/auth"} replace />} />
    </Routes>
  );
}

export default App;
