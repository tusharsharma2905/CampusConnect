import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.core.database import SessionLocal
from app.models.user import User, RoleEnum
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def seed():
    db = SessionLocal()
    try:
        # Create categories, venues, events, users
        admin = User(
            name="Admin User",
            email="admin@campusconnect.com",
            password_hash=pwd_context.hash("demo123"),
            role=RoleEnum.admin,
            is_verified=True
        )
        
        organizer = User(
            name="Demo Organizer",
            email="organizer@campusconnect.com",
            password_hash=pwd_context.hash("demo123"),
            role=RoleEnum.organizer,
            is_verified=True
        )

        student = User(
            name="Demo Student",
            email="student@campusconnect.com",
            password_hash=pwd_context.hash("demo123"),
            role=RoleEnum.student,
            is_verified=True,
            student_id="DEMO2026",
            department="Computer Science"
        )
        
        db.add_all([admin, organizer, student])
        db.commit()
        print("Seed complete. Demo users created.")
    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
