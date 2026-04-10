import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, BrainCircuit } from "lucide-react";
import { AxiosError } from "axios";
import { login, signup } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

export function AuthPage() {
  const { login: persistToken } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [form, setForm] = useState({
    name: "Alex Morgan",
    email: "alex@example.com",
    password: "password123",
    role: "Software Engineer",
    skills: "React, TypeScript, APIs",
    goals: "System Design, Cloud Architecture, Leadership",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        skills: form.skills.split(",").map((skill) => skill.trim()),
        goals: form.goals.split(",").map((goal) => goal.trim()),
      };
      return mode === "signup" ? signup(payload) : login(payload);
    },
    onSuccess: (response) => {
      persistToken(response.access_token);
      window.location.href = "/";
    },
  });

  const errorMessage =
    mutation.error instanceof AxiosError
      ? mutation.error.response?.data?.detail ?? mutation.error.message
      : mutation.error instanceof Error
        ? mutation.error.message
        : "";

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(74,222,128,0.18),_transparent_28%)]" />
        <div className="relative">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2">
            <BrainCircuit className="h-4 w-4 text-sky-300" />
            Smart Upskilling Assistant
          </div>
          <h1 className="mt-8 max-w-xl text-5xl font-semibold leading-tight">
            Build measurable employee growth with AI-guided learning journeys.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/70">
            Personalized roadmaps, weekly plans, skill gap analysis, coaching, badges, and leaderboards in one production-ready workspace.
          </p>
        </div>

        <div className="relative grid gap-4 md:grid-cols-2">
          {["Skill gap intelligence", "Weekly coaching plans", "Real-world practice tasks", "Badge-driven motivation"].map((item) => (
            <div key={item} className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-sm text-white/60">Capability</p>
              <p className="mt-2 text-xl font-medium">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center p-6 md:p-10">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle className="text-3xl">{mode === "signup" ? "Create your workspace" : "Welcome back"}</CardTitle>
            <CardDescription>
              {mode === "signup"
                ? "Set up a learner profile and let the assistant generate a personalized growth system."
                : "Log in to continue your weekly learning streak."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === "signup" ? (
              <Input
                placeholder="Full name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
            ) : null}
            <Input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
            <Input
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />
            {mode === "signup" ? (
              <>
                <Input
                  placeholder="Current role"
                  value={form.role}
                  onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                />
                <Input
                  placeholder="Skills, comma separated"
                  value={form.skills}
                  onChange={(event) => setForm((current) => ({ ...current, skills: event.target.value }))}
                />
                <Input
                  placeholder="Goals, comma separated"
                  value={form.goals}
                  onChange={(event) => setForm((current) => ({ ...current, goals: event.target.value }))}
                />
              </>
            ) : null}

            <Button className="h-12 w-full rounded-2xl" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              {mode === "signup" ? "Start learning smarter" : "Login to dashboard"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}

            <button
              type="button"
              onClick={() => setMode((current) => (current === "signup" ? "login" : "signup"))}
              className="w-full text-sm font-medium text-slate-600"
            >
              {mode === "signup" ? "Already have an account? Switch to login" : "Need an account? Switch to signup"}
            </button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
