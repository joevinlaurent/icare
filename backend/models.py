from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
import uuid

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

# User Models
class User(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    email: str
    password: str
    avatar: Optional[str] = None
    bio: Optional[str] = None
    subscription: str = "free"  # free or premium
    time_saved: int = 0  # minutes
    referral_code: str = Field(default_factory=lambda: str(uuid.uuid4())[:8].upper())
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    avatar: Optional[str] = None
    bio: Optional[str] = None
    subscription: str
    time_saved: int
    referral_code: str
    created_at: datetime

# Preferences Models
class UserPreferences(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    hide_reels: bool = True
    hide_stories: bool = False
    hide_suggestions: bool = True
    lock_mode: bool = False
    lock_end_time: Optional[datetime] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class PreferencesUpdate(BaseModel):
    hide_reels: Optional[bool] = None
    hide_stories: Optional[bool] = None
    hide_suggestions: Optional[bool] = None
    lock_mode: Optional[bool] = None
    lock_end_time: Optional[datetime] = None

class PreferencesResponse(BaseModel):
    hide_reels: bool
    hide_stories: bool
    hide_suggestions: bool
    lock_mode: bool
    lock_end_time: Optional[datetime] = None

# Time Session Models
class TimeSession(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    platform: str  # instagram, tiktok, etc.
    time_spent: int  # seconds
    time_saved: int  # estimated minutes saved
    start_time: datetime
    end_time: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class TimeSavedCreate(BaseModel):
    minutes: int
    platform: str = "instagram"

# Response Models
class AuthResponse(BaseModel):
    success: bool
    user: Optional[UserResponse] = None
    token: Optional[str] = None
    message: Optional[str] = None

class StandardResponse(BaseModel):
    success: bool
    message: Optional[str] = None

class StatsResponse(BaseModel):
    time_saved: int
    sessions_count: int
    weekly_time_saved: int
    total_sessions: int

# Token Model
class TokenData(BaseModel):
    user_id: Optional[str] = None