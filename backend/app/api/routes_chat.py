from fastapi import APIRouter

from app.core.deps import CurrentUser
from app.schemas.ai import ChatRequest, ChatResponse
from app.services.ai_service import generate_chat_response

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest, current_user: CurrentUser) -> ChatResponse:
    return await generate_chat_response(current_user, payload)
