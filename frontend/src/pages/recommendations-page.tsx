import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, BookOpenCheck } from "lucide-react";
import { getRecommendations } from "@/api/assistant";
import { getProfile } from "@/api/user";
import { SourceList } from "@/components/source-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function RecommendationsPage() {
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const recommendationQuery = useQuery({
    queryKey: ["recommendations-page", profileQuery.data?.id],
    queryFn: () =>
      getRecommendations({
        role: profileQuery.data?.role,
        skills: profileQuery.data?.skills,
        goals: profileQuery.data?.goals,
      }),
    enabled: Boolean(profileQuery.data),
  });

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[32px] p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Learning Recommendations</p>
        <h1 className="mt-3 text-4xl font-semibold">Curated next steps for your career goals</h1>
        <p className="mt-4 max-w-3xl text-base text-muted-foreground">
          These recommendations combine your role, goals, and current skills into focused courses and practice tasks you can start this week.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {recommendationQuery.data?.recommendations.map((course) => (
          <Card key={course.title} className="animate-enter">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge>{course.difficulty}</Badge>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="pt-4">{course.title}</CardTitle>
              <CardDescription>{course.source}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{course.reason}</p>
              <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                Why now: This content directly supports one of your highest-priority growth areas.
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenCheck className="h-5 w-5 text-primary" />
              Skill gaps to address
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {recommendationQuery.data?.skill_gaps.map((gap) => (
              <Badge key={gap} className="bg-secondary text-secondary-foreground">
                {gap}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Real-world tasks</CardTitle>
            <CardDescription>Practice what you learn in realistic, job-adjacent ways.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendationQuery.data?.real_world_tasks.map((task) => (
              <div key={task} className="rounded-3xl bg-slate-50 px-4 py-4 text-sm text-slate-700">
                {task}
              </div>
            ))}
            <SourceList sources={recommendationQuery.data?.sources ?? []} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
