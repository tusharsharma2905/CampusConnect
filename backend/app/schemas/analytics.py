from pydantic import BaseModel
from typing import List, Dict, Any

class DataPoint(BaseModel):
    label: str
    value: float

class EventAnalyticsResponse(BaseModel):
    registrations: int
    attendance: int
    attendance_rate: float
    capacity: int | None
    registration_growth: List[DataPoint]
    department_distribution: List[DataPoint]
    year_distribution: List[DataPoint]

class DashboardAnalyticsResponse(BaseModel):
    total_users: int
    total_events: int
    total_registrations: int
    total_attendance: int
    certificates_issued: int
    events_by_category: List[DataPoint]
    registrations_over_time: List[DataPoint]
