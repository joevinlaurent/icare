from fastapi import APIRouter, HTTPException, status, Depends
from models import PreferencesUpdate, PreferencesResponse, TimeSavedCreate, StatsResponse, StandardResponse
from auth import get_current_user_id
from database import get_database
from bson import ObjectId
from datetime import datetime, timedelta

router = APIRouter(prefix="/user", tags=["user"])

@router.get("/preferences", response_model=PreferencesResponse)
async def get_preferences(current_user_id: str = Depends(get_current_user_id)):
    """Get user preferences"""
    db = await get_database()
    
    prefs = await db.user_preferences.find_one({"user_id": ObjectId(current_user_id)})
    if not prefs:
        # Create default preferences if not exist
        default_prefs = {
            "user_id": ObjectId(current_user_id),
            "hide_reels": True,
            "hide_stories": False,
            "hide_suggestions": True,
            "lock_mode": False,
            "lock_end_time": None,
            "updated_at": datetime.utcnow()
        }
        await db.user_preferences.insert_one(default_prefs)
        prefs = default_prefs
    
    return PreferencesResponse(
        hide_reels=prefs.get("hide_reels", True),
        hide_stories=prefs.get("hide_stories", False),
        hide_suggestions=prefs.get("hide_suggestions", True),
        lock_mode=prefs.get("lock_mode", False),
        lock_end_time=prefs.get("lock_end_time")
    )

@router.put("/preferences", response_model=PreferencesResponse)
async def update_preferences(
    preferences: PreferencesUpdate,
    current_user_id: str = Depends(get_current_user_id)
):
    """Update user preferences"""
    db = await get_database()
    
    # Check if lock mode is active
    current_prefs = await db.user_preferences.find_one({"user_id": ObjectId(current_user_id)})
    if current_prefs and current_prefs.get("lock_mode") and current_prefs.get("lock_end_time"):
        if datetime.utcnow() < current_prefs["lock_end_time"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Mode verrou actif - impossible de modifier les réglages"
            )
    
    # Prepare update data
    update_data = {"updated_at": datetime.utcnow()}
    if preferences.hide_reels is not None:
        update_data["hide_reels"] = preferences.hide_reels
    if preferences.hide_stories is not None:
        update_data["hide_stories"] = preferences.hide_stories
    if preferences.hide_suggestions is not None:
        update_data["hide_suggestions"] = preferences.hide_suggestions
    if preferences.lock_mode is not None:
        update_data["lock_mode"] = preferences.lock_mode
    if preferences.lock_end_time is not None:
        update_data["lock_end_time"] = preferences.lock_end_time
    
    # Update preferences
    await db.user_preferences.update_one(
        {"user_id": ObjectId(current_user_id)},
        {"$set": update_data},
        upsert=True
    )
    
    # Return updated preferences
    updated_prefs = await db.user_preferences.find_one({"user_id": ObjectId(current_user_id)})
    return PreferencesResponse(
        hide_reels=updated_prefs.get("hide_reels", True),
        hide_stories=updated_prefs.get("hide_stories", False),
        hide_suggestions=updated_prefs.get("hide_suggestions", True),
        lock_mode=updated_prefs.get("lock_mode", False),
        lock_end_time=updated_prefs.get("lock_end_time")
    )

@router.post("/time-saved", response_model=dict)
async def add_time_saved(
    time_data: TimeSavedCreate,
    current_user_id: str = Depends(get_current_user_id)
):
    """Add time saved for user"""
    db = await get_database()
    
    # Update user's total time saved
    result = await db.users.update_one(
        {"_id": ObjectId(current_user_id)},
        {"$inc": {"time_saved": time_data.minutes}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    # Create time session record
    session_data = {
        "user_id": ObjectId(current_user_id),
        "platform": time_data.platform,
        "time_spent": 0,  # Will be updated later
        "time_saved": time_data.minutes,
        "start_time": datetime.utcnow(),
        "end_time": datetime.utcnow(),
        "created_at": datetime.utcnow()
    }
    await db.time_sessions.insert_one(session_data)
    
    # Get updated total
    user = await db.users.find_one({"_id": ObjectId(current_user_id)})
    
    return {
        "success": True,
        "total_time_saved": user.get("time_saved", 0)
    }

@router.get("/stats", response_model=StatsResponse)
async def get_user_stats(current_user_id: str = Depends(get_current_user_id)):
    """Get user statistics"""
    db = await get_database()
    
    # Get user
    user = await db.users.find_one({"_id": ObjectId(current_user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    # Get total sessions count
    total_sessions = await db.time_sessions.count_documents({"user_id": ObjectId(current_user_id)})
    
    # Get weekly stats (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    weekly_sessions = await db.time_sessions.find({
        "user_id": ObjectId(current_user_id),
        "created_at": {"$gte": week_ago}
    }).to_list(None)
    
    weekly_time_saved = sum(session.get("time_saved", 0) for session in weekly_sessions)
    
    return StatsResponse(
        time_saved=user.get("time_saved", 0),
        sessions_count=len(weekly_sessions),
        weekly_time_saved=weekly_time_saved,
        total_sessions=total_sessions
    )