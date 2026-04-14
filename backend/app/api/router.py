from fastapi import APIRouter

from app.api.routes_ai import router as ai_router
from app.api.routes_auth import router as auth_router
from app.api.routes_chat import router as chat_router
from app.api.routes_game import router as game_router
from app.api.routes_knowledge import router as knowledge_router
from app.api.routes_user import router as user_router

api_router = APIRouter()
api_router.include_router(auth_router, tags=["auth"])
api_router.include_router(user_router, tags=["users"])
api_router.include_router(ai_router, tags=["ai"])
api_router.include_router(chat_router, tags=["chat"])
api_router.include_router(game_router, tags=["gamification"])
api_router.include_router(knowledge_router, tags=["knowledge"])
