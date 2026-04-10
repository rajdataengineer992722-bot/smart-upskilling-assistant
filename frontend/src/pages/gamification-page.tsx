import { useQuery } from "@tanstack/react-query";
import { Award, Crown, Medal } from "lucide-react";
import { getBadges, getLeaderboard } from "@/api/gamification";
import { Badge as BadgePill } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function GamificationPage() {
  const badgesQuery = useQuery({
    queryKey: ["badges"],
    queryFn: getBadges,
  });

  const leaderboardQuery = useQuery({
    queryKey: ["leaderboard"],
    queryFn: getLeaderboard,
  });

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[32px] p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Gamification Layer</p>
        <h1 className="mt-3 text-4xl font-semibold">Make progress visible, social, and motivating</h1>
        <p className="mt-4 max-w-3xl text-base text-muted-foreground">
          Reward consistent learning with badges and turn roadmap progress into momentum through a lightweight leaderboard.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Badge Collection
            </CardTitle>
            <CardDescription>Unlock milestones as your learning plan advances.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {badgesQuery.data?.map((badge) => (
              <div
                key={badge.name}
                className={`rounded-[28px] p-5 ${
                  badge.unlocked ? "bg-amber-50 text-amber-950" : "bg-slate-100 text-slate-500"
                }`}
              >
                <div className="mb-3 inline-flex rounded-2xl bg-white/70 p-3">
                  <Medal className="h-5 w-5" />
                </div>
                <p className="font-semibold">{badge.name}</p>
                <p className="mt-2 text-sm">{badge.description}</p>
                <div className="mt-4">
                  <BadgePill className={badge.unlocked ? "" : "bg-slate-200 text-slate-600"}>
                    {badge.unlocked ? "Unlocked" : "In progress"}
                  </BadgePill>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Leaderboard
            </CardTitle>
            <CardDescription>Highlight learning momentum across the team.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {leaderboardQuery.data?.map((entry, index) => (
              <div key={`${entry.name}-${index}`} className="flex items-center justify-between rounded-3xl bg-slate-50 px-4 py-4">
                <div>
                  <p className="font-semibold">{entry.name}</p>
                  <p className="text-sm text-muted-foreground">{entry.role}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{entry.points} pts</p>
                  <p className="text-sm text-muted-foreground">{entry.progress}% progress</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
