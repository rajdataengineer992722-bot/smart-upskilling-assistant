from pydantic import BaseModel, Field

from app.schemas.knowledge import KnowledgeSource


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
    sources: list[KnowledgeSource] = Field(default_factory=list)


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
    sources: list[KnowledgeSource] = Field(default_factory=list)


class SkillGapItem(BaseModel):
    skill: str
    current_level: int = Field(ge=0, le=100)
    target_level: int = Field(ge=0, le=100)
    gap: int = Field(ge=0, le=100)


class SkillGapResponse(BaseModel):
    overview: str
    gaps: list[SkillGapItem]
    priority_skills: list[str]
    sources: list[KnowledgeSource] = Field(default_factory=list)


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    use_rag: bool = True


class ChatResponse(BaseModel):
    message: str
    suggestions: list[str]
    sources: list[KnowledgeSource] = Field(default_factory=list)
