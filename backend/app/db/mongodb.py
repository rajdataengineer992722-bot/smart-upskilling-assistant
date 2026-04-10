from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings

client: AsyncIOMotorClient | None = None
database: AsyncIOMotorDatabase | None = None


async def connect_to_mongo() -> None:
    global client, database

    client = AsyncIOMotorClient(settings.mongodb_uri)
    database = client[settings.database_name]
    await database.users.create_index("email", unique=True)
    await database.learning_plans.create_index("user_id", unique=True)


async def close_mongo_connection() -> None:
    global client

    if client:
        client.close()


def get_database() -> AsyncIOMotorDatabase:
    if database is None:
        raise RuntimeError("Database connection has not been initialized")
    return database
