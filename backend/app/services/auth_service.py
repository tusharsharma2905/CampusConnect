from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, RoleEnum
from app.schemas.user import UserCreate
from app.core.security import get_password_hash, verify_password
from app.schemas.auth import LoginRequest

class AuthService:
    @staticmethod
    def register_user(db: Session, user_in: UserCreate) -> User:
        user = db.query(User).filter(User.email == user_in.email).first()
        if user:
            raise HTTPException(
                status_code=400,
                detail="The user with this email already exists in the system.",
            )
            
        if user_in.student_id:
            student = db.query(User).filter(User.student_id == user_in.student_id).first()
            if student:
                raise HTTPException(
                    status_code=400,
                    detail="The user with this student ID already exists.",
                )

        db_obj = User(
            name=user_in.name,
            email=user_in.email,
            password_hash=get_password_hash(user_in.password),
            role=user_in.role,
            student_id=user_in.student_id if user_in.student_id else None,
            department=user_in.department,
            year=user_in.year,
            phone=user_in.phone,
            profile_image=user_in.profile_image,
            bio=user_in.bio
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def authenticate(db: Session, login_data: LoginRequest) -> User:
        user = db.query(User).filter(User.email == login_data.email).first()
        if not user:
            return None
        if not verify_password(login_data.password, user.password_hash):
            return None
        return user
