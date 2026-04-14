import { CalendarDays } from "lucide-react";
import { SourceList } from "@/components/source-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { WeeklyPlanResponse } from "@/types";

type WeeklyPlanCardProps = {
  plan: WeeklyPlanResponse;
};

export function WeeklyPlanCard({ plan }: WeeklyPlanCardProps) {
  return (
    <Card className="animate-enter">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Weekly Learning Plan
        </CardTitle>
        <CardDescription>{plan.summary}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {plan.weekly_plan.map((item) => (
          <div key={item.day} className="rounded-3xl bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{item.day}</p>
              <span className="text-sm text-muted-foreground">{item.focus}</span>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {item.tasks.map((task) => (
                <li key={task} className="rounded-2xl bg-white px-3 py-2">
                  {task}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-900">
          Stretch goal: {plan.stretch_goal}
        </div>
        <SourceList sources={plan.sources} title="Knowledge grounding" />
      </CardContent>
    </Card>
  );
}
