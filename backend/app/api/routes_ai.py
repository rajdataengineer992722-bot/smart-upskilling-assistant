from fastapi import APIRouter

from app.core.deps import CurrentUser
from app.schemas.ai import (
    RecommendationRequest,
    RecommendationResponse,
    SkillGapResponse,
    WeeklyPlanRequest,
    WeeklyPlanResponse,
)
from app.services.ai_service import (
    generate_learning_recommendations,
    generate_skill_gap_analysis,
    generate_weekly_learning_plan,
)

router = APIRouter()


@router.post("/recommend-learning", response_model=RecommendationResponse)
async def recommend_learning(
    payload: RecommendationRequest,
    current_user: CurrentUser,
) -> RecommendationResponse:
    return await generate_learning_recommendations(current_user, payload)


@router.post("/generate-weekly-plan", response_model=WeeklyPlanResponse)
async def generate_weekly_plan(
    payload: WeeklyPlanRequest,
    current_user: CurrentUser,
) -> WeeklyPlanResponse:
    return await generate_weekly_learning_plan(current_user, payload)


@router.post("/skill-gap-analysis", response_model=SkillGapResponse)
async def skill_gap_analysis(
    payload: RecommendationRequest,
    current_user: CurrentUser,
) -> SkillGapResponse:
    return await generate_skill_gap_analysis(current_user, payload)
