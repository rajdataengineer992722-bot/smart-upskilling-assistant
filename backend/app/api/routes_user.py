from fastapi import APIRouter

from app.core.deps import CurrentUser
from app.schemas.user import ProfileUpdateRequest, UserProfile
from app.services.auth_service import update_profile

router = APIRouter()


@router.get("/profile", response_model=UserProfile)
async def get_profile(current_user: CurrentUser) -> UserProfile:
    return UserProfile(**current_user)


@router.post("/update-profile", response_model=UserProfile)
async def save_profile(payload: ProfileUpdateRequest, current_user: CurrentUser) -> UserProfile:
    updated_user = await update_profile(current_user["email"], payload)
    return UserProfile(**updated_user)
