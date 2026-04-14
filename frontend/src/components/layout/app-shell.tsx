import { Award, BookOpenText, BrainCircuit, LayoutDashboard, LogOut, Sparkles } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/recommendations", label: "Recommendations", icon: BrainCircuit },
  { to: "/knowledge", label: "Knowledge Base", icon: BookOpenText },
  { to: "/gamification", label: "Gamification", icon: Award },
];

export function AppShell() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-4 py-6 md:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="glass-panel flex flex-col rounded-[32px] p-5 shadow-glow">
          <div className="rounded-[28px] bg-slate-950 p-5 text-white">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <Sparkles className="h-6 w-6 text-sky-300" />
              </div>
              <div>
                <p className="text-sm text-white/70">AI Learning Companion</p>
                <h1 className="text-xl font-semibold">UpskillOS</h1>
              </div>
            </div>
            <p className="text-sm leading-6 text-white/75">
              Personalized weekly growth plans, skill gap insights, and coaching in one place.
            </p>
          </div>

          <nav className="mt-6 flex flex-1 flex-col gap-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    isActive ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-white/80",
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <Button
            variant="outline"
            className="mt-4 w-full justify-start rounded-2xl"
            onClick={() => {
              logout();
              navigate("/auth");
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </aside>

        <main className="space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
