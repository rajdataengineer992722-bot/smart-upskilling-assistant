import json
from typing import Any

from openai import OpenAI, OpenAIError

from app.core.config import settings
from app.db.mongodb import get_database
from app.schemas.ai import (
    ChatRequest,
    ChatResponse,
    RecommendationRequest,
    RecommendationResponse,
    SkillGapResponse,
    WeeklyPlanRequest,
    WeeklyPlanResponse,
)
from app.schemas.knowledge import KnowledgeSource
from app.services.knowledge_service import search_knowledge_sources

REQUIRED_SKILLS_BY_ROLE = {
    "Software Engineer": ["Data Structures", "System Design", "APIs", "Testing", "Cloud Basics"],
    "Data Analyst": ["SQL", "Python", "Statistics", "Data Visualization", "Experiment Design"],
    "Product Manager": ["Roadmapping", "Stakeholder Management", "Analytics", "User Research", "Prioritization"],
    "UX Designer": ["User Research", "Wireframing", "Prototyping", "Accessibility", "Design Systems"],
}


def _build_context(user: dict[str, Any], payload: RecommendationRequest | WeeklyPlanRequest) -> dict[str, Any]:
    return {
        "role": payload.role or user.get("role", "Software Engineer"),
        "skills": payload.skills or user.get("skills", []),
        "goals": payload.goals or user.get("goals", []),
        "progress": user.get("progress", 0),
    }


def _fallback_skill_gap(role: str, skills: list[str]) -> SkillGapResponse:
    required_skills = REQUIRED_SKILLS_BY_ROLE.get(role, REQUIRED_SKILLS_BY_ROLE["Software Engineer"])
    gaps = []
    for skill in required_skills:
        current_level = 70 if skill in skills else 30
        target_level = 90
        gaps.append(
            {
                "skill": skill,
                "current_level": current_level,
                "target_level": target_level,
                "gap": max(target_level - current_level, 0),
            }
        )

    sorted_gaps = sorted(gaps, key=lambda item: item["gap"], reverse=True)
    return SkillGapResponse(
        overview=f"Focus on the largest gaps for your {role} growth path.",
        gaps=sorted_gaps,
        priority_skills=[item["skill"] for item in sorted_gaps[:3]],
        sources=[],
    )


def _fallback_recommendations(context: dict[str, Any]) -> RecommendationResponse:
    gap_response = _fallback_skill_gap(context["role"], context["skills"])
    recommendations = [
        {
            "title": f"{skill} Foundations",
            "source": "Internal Academy",
            "difficulty": "Intermediate" if index == 0 else "Beginner",
            "reason": f"Targets the {skill.lower()} gap in your current roadmap.",
        }
        for index, skill in enumerate(gap_response.priority_skills)
    ]
    tasks = [
        f"Build a mini project demonstrating {skill.lower()} in a work-relevant scenario."
        for skill in gap_response.priority_skills
    ]
    return RecommendationResponse(
        roadmap_summary=f"Build depth in {', '.join(gap_response.priority_skills)} to move toward your next milestone.",
        skill_gaps=gap_response.priority_skills,
        recommendations=recommendations,
        real_world_tasks=tasks,
        sources=[],
    )


def _fallback_weekly_plan(context: dict[str, Any]) -> WeeklyPlanResponse:
    focus_areas = _fallback_skill_gap(context["role"], context["skills"]).priority_skills
    plan = [
        {
            "day": "Monday",
            "focus": focus_areas[0],
            "tasks": [f"Spend 45 minutes learning {focus_areas[0]}.", "Document 3 key takeaways."],
        },
        {
            "day": "Tuesday",
            "focus": focus_areas[1],
            "tasks": [f"Watch a tutorial on {focus_areas[1]}.", "Create a flashcard summary."],
        },
        {
            "day": "Wednesday",
            "focus": "Applied Practice",
            "tasks": ["Complete one quiz.", f"Start a small exercise using {focus_areas[0]} and {focus_areas[1]}."],
        },
        {
            "day": "Thursday",
            "focus": focus_areas[2],
            "tasks": [f"Read a practical guide on {focus_areas[2]}.", "Map the concept to your current projects."],
        },
        {
            "day": "Friday",
            "focus": "Real-world Task",
            "tasks": ["Ship a small proof of concept.", "Reflect on blockers and what to learn next."],
        },
    ]
    return WeeklyPlanResponse(
        summary="A balanced plan mixing theory, practice, and reflection.",
        weekly_plan=plan,
        stretch_goal="Share your proof of concept with a peer or manager for feedback.",
        sources=[],
    )


def _get_groq_client() -> OpenAI | None:
    if not settings.groq_api_key:
        return None
    return OpenAI(
        api_key=settings.groq_api_key,
        base_url=settings.groq_base_url,
    )


async def _store_learning_plan(user_id: str, plan: WeeklyPlanResponse) -> None:
    database = get_database()
    await database.learning_plans.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "user_id": user_id,
                "weekly_plan": [item.model_dump() for item in plan.weekly_plan],
                "completed_tasks": [],
                "summary": plan.summary,
                "stretch_goal": plan.stretch_goal,
            }
        },
        upsert=True,
    )


def _parse_json_response(content: str) -> dict[str, Any]:
    return json.loads(content.strip())


def _log_ai_failure(operation: str, exc: Exception) -> None:
    # Keep failures visible in logs while allowing the app to fall back gracefully.
    print(f"Groq {operation} failed, falling back to local logic: {exc}")


async def _retrieve_context_sources(
    user: dict[str, Any],
    role: str,
    skills: list[str],
    goals: list[str],
    extra_query: str = "",
    top_k: int = 4,
) -> list[KnowledgeSource]:
    query_parts = [role, *skills[:4], *goals[:4]]
    if extra_query:
        query_parts.append(extra_query)
    query = " | ".join(part for part in query_parts if part)
    return await search_knowledge_sources(query=query, role=role, tags=goals or skills, top_k=top_k)


def _sources_to_prompt_context(sources: list[KnowledgeSource]) -> str:
    if not sources:
        return "No internal knowledge sources were retrieved."
    sections = []
    for index, source in enumerate(sources, start=1):
        sections.append(
            f"[Source {index}] Title: {source.title}\n"
            f"Origin: {source.source}\n"
            f"Roles: {', '.join(source.roles) or 'General'}\n"
            f"Tags: {', '.join(source.tags) or 'None'}\n"
            f"Snippet: {source.snippet}"
        )
    return "\n\n".join(sections)


async def generate_skill_gap_analysis(user: dict[str, Any], payload: RecommendationRequest) -> SkillGapResponse:
    context = _build_context(user, payload)
    sources = await _retrieve_context_sources(
        user=user,
        role=context["role"],
        skills=context["skills"],
        goals=context["goals"],
        extra_query="skill expectations competency learning path",
    )
    client = _get_groq_client()
    if not client:
        fallback = _fallback_skill_gap(context["role"], context["skills"])
        fallback.sources = sources
        return fallback

    try:
        prompt = f"""
        You are an expert L&D strategist.
        Analyze the employee profile and return JSON with keys:
        overview (string), gaps (array of objects with skill, current_level, target_level, gap), priority_skills (array of strings).
        Employee profile: {json.dumps(context)}
        Retrieved internal learning context:
        {_sources_to_prompt_context(sources)}
        Return only valid JSON.
        """
        response = client.chat.completions.create(
            model=settings.groq_model,
            temperature=0.2,
            messages=[
                {"role": "system", "content": "Return only valid JSON."},
                {"role": "user", "content": prompt},
            ],
        )
        content = response.choices[0].message.content or "{}"
        parsed = SkillGapResponse(**_parse_json_response(content))
        parsed.sources = sources
        return parsed
    except (OpenAIError, ValueError, KeyError, json.JSONDecodeError) as exc:
        _log_ai_failure("skill gap analysis", exc)
        fallback = _fallback_skill_gap(context["role"], context["skills"])
        fallback.sources = sources
        return fallback


async def generate_learning_recommendations(
    user: dict[str, Any],
    payload: RecommendationRequest,
) -> RecommendationResponse:
    context = _build_context(user, payload)
    sources = await _retrieve_context_sources(
        user=user,
        role=context["role"],
        skills=context["skills"],
        goals=context["goals"],
        extra_query="courses learning materials roadmap project practice tasks",
    )
    client = _get_groq_client()
    if not client:
        fallback = _fallback_recommendations(context)
        fallback.sources = sources
        return fallback

    try:
        prompt = f"""
        You are a personalized AI upskilling coach.
        Based on this employee profile, return JSON with keys:
        roadmap_summary (string),
        skill_gaps (array of strings),
        recommendations (array of objects with title, source, difficulty, reason),
        real_world_tasks (array of strings).
        Profile: {json.dumps(context)}
        Retrieved internal learning context:
        {_sources_to_prompt_context(sources)}
        Prefer recommendations grounded in the retrieved sources.
        Return only valid JSON.
        """
        response = client.chat.completions.create(
            model=settings.groq_model,
            temperature=0.3,
            messages=[
                {"role": "system", "content": "Return only valid JSON."},
                {"role": "user", "content": prompt},
            ],
        )
        content = response.choices[0].message.content or "{}"
        parsed = RecommendationResponse(**_parse_json_response(content))
        parsed.sources = sources
        return parsed
    except (OpenAIError, ValueError, KeyError, json.JSONDecodeError) as exc:
        _log_ai_failure("learning recommendations", exc)
        fallback = _fallback_recommendations(context)
        fallback.sources = sources
        return fallback


async def generate_weekly_learning_plan(
    user: dict[str, Any],
    payload: WeeklyPlanRequest,
) -> WeeklyPlanResponse:
    context = _build_context(user, payload)
    context["available_hours"] = payload.available_hours
    sources = await _retrieve_context_sources(
        user=user,
        role=context["role"],
        skills=context["skills"],
        goals=context["goals"],
        extra_query="weekly plan practice roadmap exercises",
    )

    client = _get_groq_client()
    if not client:
        plan = _fallback_weekly_plan(context)
        plan.sources = sources
        await _store_learning_plan(user["id"], plan)
        return plan

    try:
        prompt = f"""
        You are an AI learning planner.
        Generate a weekly learning plan in JSON with keys:
        summary (string), weekly_plan (array of objects with day, focus, tasks), stretch_goal (string).
        Make it practical, realistic, and aligned with available_hours={payload.available_hours}.
        Employee context: {json.dumps(context)}
        Retrieved internal learning context:
        {_sources_to_prompt_context(sources)}
        Ground the plan in the retrieved sources when possible.
        Return only valid JSON.
        """
        response = client.chat.completions.create(
            model=settings.groq_model,
            temperature=0.3,
            messages=[
                {"role": "system", "content": "Return only valid JSON."},
                {"role": "user", "content": prompt},
            ],
        )
        content = response.choices[0].message.content or "{}"
        plan = WeeklyPlanResponse(**_parse_json_response(content))
        plan.sources = sources
    except (OpenAIError, ValueError, KeyError, json.JSONDecodeError) as exc:
        _log_ai_failure("weekly learning plan", exc)
        plan = _fallback_weekly_plan(context)
        plan.sources = sources

    await _store_learning_plan(user["id"], plan)
    return plan


async def generate_chat_response(user: dict[str, Any], payload: ChatRequest) -> ChatResponse:
    latest_question = payload.messages[-1].content if payload.messages else "What should I learn next?"
    sources = (
        await _retrieve_context_sources(
            user=user,
            role=user.get("role", "Software Engineer"),
            skills=user.get("skills", []),
            goals=user.get("goals", []),
            extra_query=latest_question,
            top_k=5,
        )
        if payload.use_rag
        else []
    )
    client = _get_groq_client()
    if not client:
        return ChatResponse(
            message=f"Based on your role as {user.get('role', 'a learner')}, focus next on your top skill gaps and apply them in a small workplace project. You asked: {latest_question}",
            suggestions=[
                "Create a 5-day practice sprint for me",
                "Give me a real-world task based on my goal",
                "Quiz me on one weak skill",
            ],
            sources=sources,
        )

    try:
        system_prompt = f"""
        You are a context-aware Smart Upskilling Assistant for employees.
        Personalize responses using the employee profile below.
        Keep responses actionable, concise, and encouraging.
        When internal knowledge sources are provided, prioritize and cite them implicitly in your answer.
        Employee profile: {json.dumps(user)}
        Retrieved internal learning context:
        {_sources_to_prompt_context(sources)}
        """
        conversation = [
            {"role": "system", "content": system_prompt},
            *[message.model_dump() for message in payload.messages],
        ]
        response = client.chat.completions.create(
            model=settings.groq_model,
            temperature=0.4,
            messages=conversation,
        )
        return ChatResponse(
            message=response.choices[0].message.content or "I can help you build your next learning step.",
            suggestions=[
                "What should I learn next?",
                "Give me a practice project",
                "Create a weekly plan",
            ],
            sources=sources,
        )
    except OpenAIError as exc:
        _log_ai_failure("chat response", exc)
        return ChatResponse(
            message=f"Your Groq key is configured, but the API request could not complete right now. I’ll keep helping with a local fallback plan. Based on your profile, focus on your top skill gaps next. You asked: {latest_question}",
            suggestions=[
                "Create a 5-day practice sprint for me",
                "Give me a real-world task based on my goal",
                "Quiz me on one weak skill",
            ],
            sources=sources,
        )
