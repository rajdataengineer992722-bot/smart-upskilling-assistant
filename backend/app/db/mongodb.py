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
    await database.knowledge_documents.create_index("created_at")
    await database.knowledge_documents.create_index("title")
    await database.knowledge_chunks.create_index("document_id")
    await database.knowledge_chunks.create_index("roles")
    await database.knowledge_chunks.create_index("tags")


async def close_mongo_connection() -> None:
    global client

    if client:
        client.close()


def get_database() -> AsyncIOMotorDatabase:
    if database is None:
        raise RuntimeError("Database connection has not been initialized")
    return database
