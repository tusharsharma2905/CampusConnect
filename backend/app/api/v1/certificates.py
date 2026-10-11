from typing import Any, List, Optional
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import get_db, get_current_user
from app.models.certificate import Certificate, CertificateTypeEnum
from app.models.event import Event
from app.models.user import User

router = APIRouter()

class CertificateEventResponse(BaseModel):
    id: UUID
    title: str
    start_datetime: datetime

    class Config:
        from_attributes = True

class CertificateResponse(BaseModel):
    id: UUID
    certificate_id: str
    certificate_type: CertificateTypeEnum
    recipient_name: str
    issued_at: datetime
    verification_code: str
    certificate_url: Optional[str] = None
    event: Optional[CertificateEventResponse] = None

    class Config:
        from_attributes = True

@router.get("/me", response_model=List[CertificateResponse])
def get_my_certificates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get all certificates issued to the current user.
    """
    return db.query(Certificate).options(
        joinedload(Certificate.event)
    ).filter(
        Certificate.user_id == current_user.id
    ).order_by(Certificate.issued_at.desc()).all()

@router.get("/verify/{code}", response_model=CertificateResponse)
def verify_certificate(
    code: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Publicly verify a certificate by verification code or certificate_id.
    """
    cert = db.query(Certificate).options(
        joinedload(Certificate.event)
    ).filter(
        (Certificate.verification_code == code) | (Certificate.certificate_id == code)
    ).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found or invalid verification code.")
    return cert


