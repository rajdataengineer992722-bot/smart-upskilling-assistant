import { useQuery } from "@tanstack/react-query";
import { Brain, Sparkles, Trophy } from "lucide-react";
import { getRecommendations, getSkillGapAnalysis, getWeeklyPlan } from "@/api/assistant";
import { getProfile } from "@/api/user";
import { ChatPanel } from "@/components/chat-panel";
import { ProfileCard } from "@/components/profile-card";
import { SkillGapChart } from "@/components/skill-gap-chart";
import { WeeklyPlanCard } from "@/components/weekly-plan-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function DashboardPage() {
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const profile = profileQuery.data;

  const skillGapQuery = useQuery({
    queryKey: ["skill-gap", profile?.id],
    queryFn: () =>
      getSkillGapAnalysis({
        role: profile?.role,
        skills: profile?.skills,
        goals: profile?.goals,
      }),
    enabled: Boolean(profile),
  });

  const planQuery = useQuery({
    queryKey: ["weekly-plan", profile?.id],
    queryFn: () =>
      getWeeklyPlan({
        role: profile?.role,
        skills: profile?.skills,
        goals: profile?.goals,
        available_hours: 6,
      }),
    enabled: Boolean(profile),
  });

  const recommendationQuery = useQuery({
    queryKey: ["recommendations", profile?.id],
    queryFn: () =>
      getRecommendations({
        role: profile?.role,
        skills: profile?.skills,
        goals: profile?.goals,
      }),
    enabled: Boolean(profile),
  });

  if (profileQuery.isLoading || !profile) {
    return <div className="glass-panel rounded-[32px] p-8 text-sm text-slate-600">Loading your workspace...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="glass-panel overflow-hidden rounded-[32px] p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground">
              <Sparkles className="h-4 w-4" />
              AI-powered growth operating system
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight">
              Welcome back, {profile.name.split(" ")[0]}. Let’s move your learning momentum forward.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Your dashboard combines skill intelligence, personalized planning, coaching, and motivation systems so your next step is always clear.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <Card className="bg-slate-950 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="h-4 w-4 text-sky-300" />
                  Priority skills
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-white/75">
                {(skillGapQuery.data?.priority_skills ?? []).join(", ") || "Analyzing..."}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Progress tracker</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <Progress value={profile.progress} />
                <p className="text-sm text-muted-foreground">{profile.progress}% roadmap progress</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  Active badges
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">{profile.badges.join(", ")}</CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <ProfileCard profile={profile} />
          {skillGapQuery.data ? <SkillGapChart data={skillGapQuery.data} /> : null}
          {planQuery.data ? <WeeklyPlanCard plan={planQuery.data} /> : null}
        </div>
        <div className="grid gap-6">
          <ChatPanel />
          {recommendationQuery.data ? (
            <Card>
              <CardHeader>
                <CardTitle>AI Learning Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{recommendationQuery.data.roadmap_summary}</p>
                <div className="grid gap-3">
                  {recommendationQuery.data.real_world_tasks.map((task) => (
                    <div key={task} className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      {task}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}
