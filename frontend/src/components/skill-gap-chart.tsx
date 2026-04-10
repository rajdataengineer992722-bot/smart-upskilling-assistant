import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SkillGapResponse } from "@/types";

type SkillGapChartProps = {
  data: SkillGapResponse;
};

export function SkillGapChart({ data }: SkillGapChartProps) {
  return (
    <Card className="animate-enter">
      <CardHeader>
        <CardTitle>Skill Gap Visualization</CardTitle>
        <CardDescription>{data.overview}</CardDescription>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.gaps}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="skill" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="current_level" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
            <Bar dataKey="target_level" fill="#86efac" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
