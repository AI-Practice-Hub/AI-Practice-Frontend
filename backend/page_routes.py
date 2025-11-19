from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from auth import get_current_user_id, get_db
from models import Project, Chat, Message
from chat_routes import TEST_CASES
from datetime import datetime

router = APIRouter()


class PageExploreRequest(BaseModel):
    url: str
    max_pages: int
    project_id: int
    chat_id: int
    suggestion: Optional[str] = None


@router.post('/discovery/explore')
def explore_page(payload: PageExploreRequest, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    # Verify project ownership
    project = db.query(Project).filter(Project.id == payload.project_id, Project.user_id == user_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or unauthorized")

    # Verify chat belongs to project
    chat = db.query(Chat).filter(Chat.id == payload.chat_id, Chat.project_id == payload.project_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found or mismatched with project")

    # Create a user message that contains exploration parameters
    user_msg = Message(chat_id=payload.chat_id, sender="user", content=f"Explore URL: {payload.url} (max_pages={payload.max_pages}) Suggestion: {payload.suggestion or ''}", timestamp=datetime.utcnow())
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # Create a bot message with a hint that test cases are available - frontend will detect this content
    bot_msg = Message(chat_id=payload.chat_id, sender="bot", content="Test cases available for selection", timestamp=datetime.utcnow())
    db.add(bot_msg)
    db.commit()
    db.refresh(bot_msg)

    # Return the test cases to the client as well (mock)
    return {
        "message": "Exploration completed",
        "test_cases": TEST_CASES,
    }
