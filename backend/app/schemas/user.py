from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    role: str = Field(default="Software Engineer")
    skills: list[str] = Field(default_factory=list)
    goals: list[str] = Field(default_factory=list)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class ProfileUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    role: str | None = None
    skills: list[str] | None = None
    goals: list[str] | None = None
    progress: int | None = Field(default=None, ge=0, le=100)


class UserProfile(UserBase):
    id: str
    progress: int = 0
    badges: list[str] = Field(default_factory=list)
