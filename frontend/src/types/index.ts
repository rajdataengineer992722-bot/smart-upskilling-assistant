export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  skills: string[];
  goals: string[];
  progress: number;
  badges: string[];
};

export type Recommendation = {
  title: string;
  source: string;
  difficulty: string;
  reason: string;
};

export type RecommendationResponse = {
  roadmap_summary: string;
  skill_gaps: string[];
  recommendations: Recommendation[];
  real_world_tasks: string[];
};

export type SkillGapItem = {
  skill: string;
  current_level: number;
  target_level: number;
  gap: number;
};

export type SkillGapResponse = {
  overview: string;
  gaps: SkillGapItem[];
  priority_skills: string[];
};

export type DailyTask = {
  day: string;
  focus: string;
  tasks: string[];
};

export type WeeklyPlanResponse = {
  summary: string;
  weekly_plan: DailyTask[];
  stretch_goal: string;
};

export type Badge = {
  name: string;
  description: string;
  unlocked: boolean;
};

export type LeaderboardEntry = {
  name: string;
  role: string;
  points: number;
  progress: number;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};
