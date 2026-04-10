from app.db.mongodb import get_database
from app.schemas.gamification import Badge, BadgeListResponse, LeaderboardEntry, LeaderboardResponse


def assign_badges(progress: int) -> list[str]:
    badge_map = {
        "Getting Started": progress >= 10,
        "Momentum Builder": progress >= 40,
        "Skill Sprinter": progress >= 70,
        "Career Accelerator": progress >= 90,
    }
    return [badge for badge, unlocked in badge_map.items() if unlocked]


async def get_badges_for_user(email: str) -> BadgeListResponse:
    database = get_database()
    user = await database.users.find_one({"email": email}, {"password": 0})
    user_badges = set(user.get("badges", []) if user else [])

    catalog = [
        Badge(name="Getting Started", description="Complete your profile and first learning step.", unlocked="Getting Started" in user_badges),
        Badge(name="Momentum Builder", description="Cross 40% progress in your roadmap.", unlocked="Momentum Builder" in user_badges),
        Badge(name="Skill Sprinter", description="Reach 70% progress and maintain consistency.", unlocked="Skill Sprinter" in user_badges),
        Badge(name="Career Accelerator", description="Finish 90% or more of your current plan.", unlocked="Career Accelerator" in user_badges),
    ]
    return BadgeListResponse(badges=catalog)


async def get_leaderboard() -> LeaderboardResponse:
    database = get_database()
    users = await database.users.find({}, {"password": 0}).sort("progress", -1).to_list(length=10)

    leaderboard = [
        LeaderboardEntry(
            name=user["name"],
            role=user.get("role", "Learner"),
            progress=user.get("progress", 0),
            points=user.get("progress", 0) * 10 + len(user.get("badges", [])) * 100,
        )
        for user in users
    ]

    return LeaderboardResponse(leaderboard=leaderboard)
