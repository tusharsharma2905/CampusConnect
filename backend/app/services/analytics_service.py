from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.event import Event
from app.models.registration import Registration, RegistrationStatusEnum
from app.models.user import User
from app.schemas.analytics import EventAnalyticsResponse, DashboardAnalyticsResponse, DataPoint

class AnalyticsService:
    @staticmethod
    def get_event_analytics(db: Session, event_id: str) -> EventAnalyticsResponse:
        event = db.query(Event).filter(Event.id == event_id).first()
        
        registrations = db.query(Registration).filter(Registration.event_id == event_id).count()
        attendance = db.query(Registration).filter(
            Registration.event_id == event_id,
            Registration.status == RegistrationStatusEnum.attended
        ).count()
        
        attendance_rate = (attendance / registrations * 100) if registrations > 0 else 0
        
        # Mocking distributions for simplicity in this demo implementation
        dept_dist = [
            DataPoint(label="Computer Science", value=registrations * 0.6),
            DataPoint(label="Engineering", value=registrations * 0.2),
            DataPoint(label="Business", value=registrations * 0.2)
        ]
        
        year_dist = [
            DataPoint(label="Year 1", value=registrations * 0.1),
            DataPoint(label="Year 2", value=registrations * 0.3),
            DataPoint(label="Year 3", value=registrations * 0.4),
            DataPoint(label="Year 4", value=registrations * 0.2)
        ]
        
        return EventAnalyticsResponse(
            registrations=registrations,
            attendance=attendance,
            attendance_rate=attendance_rate,
            capacity=event.capacity if event else None,
            registration_growth=[],  # Time series data would go here
            department_distribution=dept_dist,
            year_distribution=year_dist
        )
