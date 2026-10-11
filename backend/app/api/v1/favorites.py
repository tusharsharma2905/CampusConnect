from typing import Any, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import get_db, get_current_user
from app.models.favorite import Favorite
from app.models.event import Event
from app.models.user import User
from app.schemas.event import EventResponse

router = APIRouter()

@router.get("/me", response_model=List[EventResponse])
def get_my_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get all events bookmarked by the current user.
    """
    favs = db.query(Favorite).options(
        joinedload(Favorite.event)
    ).filter(
        Favorite.user_id == current_user.id
    ).order_by(Favorite.created_at.desc()).all()
    
    return [fav.event for fav in favs if fav.event is not None]

@router.post("/{event_id}", status_code=status.HTTP_201_CREATED)
def add_favorite(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Add an event to user favorites.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.event_id == event_id,
    ).first()
    if existing:
        return {"message": "Event is already in favorites"}
        
    fav = Favorite(user_id=current_user.id, event_id=event_id)
    db.add(fav)
    db.commit()
    return {"message": "Added to favorites"}

@router.delete("/{event_id}")
def remove_favorite(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Remove an event from user favorites.
    """
    fav = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.event_id == event_id,
    ).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Favorite not found")
    db.delete(fav)
    db.commit()
    return {"message": "Removed from favorites"}


