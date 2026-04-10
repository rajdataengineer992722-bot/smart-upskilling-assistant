import { Target, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserProfile } from "@/types";

type ProfileCardProps = {
  profile: UserProfile;
};

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <Card className="animate-enter">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <UserRound className="h-5 w-5 text-primary" />
          {profile.name}
        </CardTitle>
        <CardDescription>{profile.role}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700">Core skills</p>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <Badge key={skill}>{skill}</Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Target className="h-4 w-4 text-emerald-600" />
            Learning goals
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.goals.map((goal) => (
              <Badge key={goal} className="bg-secondary text-secondary-foreground">
                {goal}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
