from fastapi import APIRouter

from app.core.deps import CurrentUser
from app.schemas.gamification import BadgeListResponse, LeaderboardResponse
from app.services.gamification_service import get_badges_for_user, get_leaderboard

router = APIRouter()


@router.get("/badges", response_model=BadgeListResponse)
async def badges(current_user: CurrentUser) -> BadgeListResponse:
    return await get_badges_for_user(current_user["email"])


@router.get("/leaderboard", response_model=LeaderboardResponse)
async def leaderboard(_: CurrentUser) -> LeaderboardResponse:
    return await get_leaderboard()
