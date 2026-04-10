from pydantic import BaseModel


class Badge(BaseModel):
    name: str
    description: str
    unlocked: bool


class BadgeListResponse(BaseModel):
    badges: list[Badge]


class LeaderboardEntry(BaseModel):
    name: str
    role: str
    points: int
    progress: int


class LeaderboardResponse(BaseModel):
    leaderboard: list[LeaderboardEntry]
