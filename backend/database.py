from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import os

# MongoDB configuration
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'icare_db')

class Database:
    client: Optional[AsyncIOMotorClient] = None
    database = None

database = Database()

async def get_database():
    return database.database

async def connect_to_mongo():
    """Create database connection"""
    database.client = AsyncIOMotorClient(MONGO_URL)
    database.database = database.client[DB_NAME]
    
    # Create indexes
    await database.database.users.create_index("email", unique=True)
    await database.database.user_preferences.create_index("user_id", unique=True)
    await database.database.time_sessions.create_index([("user_id", 1), ("created_at", -1)])

async def close_mongo_connection():
    """Close database connection"""
    if database.client:
        database.client.close()