from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPAuthorizationCredentials
from models import User, UserCreate, UserLogin, AuthResponse, UserResponse, UserPreferences
from auth import get_password_hash, verify_password, create_access_token, get_current_user_id
from database import get_database
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=AuthResponse)
async def register(user_data: UserCreate):
    """Register a new user"""
    db = await get_database()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        return AuthResponse(
            success=False,
            message="Un compte avec cet email existe déjà"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        name=user_data.name,
        email=user_data.email,
        password=hashed_password,
        bio=f"Reprendre le contrôle de mon temps sur les réseaux sociaux 🎯"
    )
    
    # Insert user
    result = await db.users.insert_one(user.dict(by_alias=True))
    user_id = str(result.inserted_id)
    
    # Create default preferences
    preferences = UserPreferences(user_id=ObjectId(user_id))
    await db.user_preferences.insert_one(preferences.dict(by_alias=True))
    
    # Generate token
    token = create_access_token(data={"sub": user_id})
    
    # Return user response
    user_response = UserResponse(
        id=user_id,
        name=user.name,
        email=user.email,
        avatar=user.avatar,
        bio=user.bio,
        subscription=user.subscription,
        time_saved=user.time_saved,
        referral_code=user.referral_code,
        created_at=user.created_at
    )
    
    return AuthResponse(
        success=True,
        user=user_response,
        token=token
    )

@router.post("/login", response_model=AuthResponse)
async def login(login_data: UserLogin):
    """Login user"""
    db = await get_database()
    
    # Find user
    user_doc = await db.users.find_one({"email": login_data.email})
    if not user_doc or not verify_password(login_data.password, user_doc["password"]):
        return AuthResponse(
            success=False,
            message="Email ou mot de passe incorrect"
        )
    
    # Generate token
    token = create_access_token(data={"sub": str(user_doc["_id"])})
    
    # Return user response
    user_response = UserResponse(
        id=str(user_doc["_id"]),
        name=user_doc["name"],
        email=user_doc["email"],
        avatar=user_doc.get("avatar"),
        bio=user_doc.get("bio"),
        subscription=user_doc.get("subscription", "free"),
        time_saved=user_doc.get("time_saved", 0),
        referral_code=user_doc.get("referral_code", ""),
        created_at=user_doc.get("created_at", datetime.utcnow())
    )
    
    return AuthResponse(
        success=True,
        user=user_response,
        token=token
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user(current_user_id: str = Depends(get_current_user_id)):
    """Get current user info"""
    db = await get_database()
    
    user_doc = await db.users.find_one({"_id": ObjectId(current_user_id)})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    return UserResponse(
        id=str(user_doc["_id"]),
        name=user_doc["name"],
        email=user_doc["email"],
        avatar=user_doc.get("avatar"),
        bio=user_doc.get("bio"),
        subscription=user_doc.get("subscription", "free"),
        time_saved=user_doc.get("time_saved", 0),
        referral_code=user_doc.get("referral_code", ""),
        created_at=user_doc.get("created_at", datetime.utcnow())
    )