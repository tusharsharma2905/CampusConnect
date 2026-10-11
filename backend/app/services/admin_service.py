from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.user import User, RoleEnum
from app.models.event import Event, EventStatusEnum
from app.models.registration import Registration
from app.schemas.admin import PlatformStatsResponse

class AdminService:
    @staticmethod
    def get_platform_stats(db: Session) -> PlatformStatsResponse:
        total_users = db.query(User).count()
        total_students = db.query(User).filter(User.role == RoleEnum.student).count()
        total_organizers = db.query(User).filter(User.role == RoleEnum.organizer).count()
        
        total_events = db.query(Event).count()
        pending_events = db.query(Event).filter(Event.status == EventStatusEnum.pending_approval).count()
        
        total_registrations = db.query(Registration).count()
        
        return PlatformStatsResponse(
            total_users=total_users,
            total_students=total_students,
            total_organizers=total_organizers,
            total_events=total_events,
            pending_events=pending_events,
            total_registrations=total_registrations
        )

    @staticmethod
    def manage_user(db: Session, user_id: str, action: str):
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        if action == "deactivate":
            user.is_active = False
        elif action == "activate":
            user.is_active = True
        elif action == "delete":
            db.delete(user)
        else:
            raise HTTPException(status_code=400, detail="Invalid action")
            
        db.commit()
        return {"message": f"User {action}d successfully"}

    @staticmethod
    def get_users(db: Session, skip: int = 0, limit: int = 100):
        return db.query(User).offset(skip).limit(limit).all()
