from datetime import timedelta

from pymongo.errors import DuplicateKeyError

from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.mongodb import get_database
from app.schemas.auth import TokenResponse
from app.schemas.user import ProfileUpdateRequest, UserCreate
from app.services.gamification_service import assign_badges


async def create_user(payload: UserCreate) -> TokenResponse:
    database = get_database()
    user_document = payload.model_dump()
    user_document["password"] = get_password_hash(payload.password)
    user_document["progress"] = 10
    user_document["badges"] = ["Getting Started"]

    try:
        await database.users.insert_one(user_document)
    except DuplicateKeyError as exc:
        raise ValueError("A user with this email already exists") from exc

    token = create_access_token(
        subject=payload.email,
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )
    return TokenResponse(access_token=token)


async def authenticate_user(email: str, password: str) -> TokenResponse | None:
    database = get_database()
    user = await database.users.find_one({"email": email})
    if not user or not verify_password(password, user["password"]):
        return None

    token = create_access_token(subject=email)
    return TokenResponse(access_token=token)


async def update_profile(email: str, payload: ProfileUpdateRequest) -> dict:
    database = get_database()
    updates = {key: value for key, value in payload.model_dump().items() if value is not None}

    if updates:
        await database.users.update_one({"email": email}, {"$set": updates})

    user = await database.users.find_one({"email": email}, {"password": 0})
    if not user:
        raise ValueError("User not found")

    recalculated_badges = assign_badges(user.get("progress", 0))
    await database.users.update_one({"email": email}, {"$set": {"badges": recalculated_badges}})

    user["badges"] = recalculated_badges
    user["id"] = str(user.pop("_id"))
    return user
