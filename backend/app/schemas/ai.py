from pydantic import BaseModel, Field


class RecommendationRequest(BaseModel):
    role: str | None = None
    skills: list[str] = Field(default_factory=list)
    goals: list[str] = Field(default_factory=list)


class CourseRecommendation(BaseModel):
    title: str
    source: str
    difficulty: str
    reason: str


class RecommendationResponse(BaseModel):
    roadmap_summary: str
    skill_gaps: list[str]
    recommendations: list[CourseRecommendation]
    real_world_tasks: list[str]


class WeeklyPlanRequest(BaseModel):
    role: str | None = None
    skills: list[str] = Field(default_factory=list)
    goals: list[str] = Field(default_factory=list)
    available_hours: int = Field(default=5, ge=1, le=40)


class DailyTask(BaseModel):
    day: str
    focus: str
    tasks: list[str]


class WeeklyPlanResponse(BaseModel):
    summary: str
    weekly_plan: list[DailyTask]
    stretch_goal: str


class SkillGapItem(BaseModel):
    skill: str
    current_level: int = Field(ge=0, le=100)
    target_level: int = Field(ge=0, le=100)
    gap: int = Field(ge=0, le=100)


class SkillGapResponse(BaseModel):
    overview: str
    gaps: list[SkillGapItem]
    priority_skills: list[str]


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


class ChatResponse(BaseModel):
    message: str
    suggestions: list[str]
