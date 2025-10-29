from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from models import Chat, Message, User
from schemas import ChatCreate, ChatOut, MessageCreate, MessageOut
import db
from datetime import datetime
from fastapi import Query

router = APIRouter()

def get_db():
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

# Dummy dependency for user_id (replace with real auth later)
def get_current_user_id():
    return 1  # Replace with actual user ID from auth

@router.post("/chat/", response_model=ChatOut)
def create_chat(chat: ChatCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    new_chat = Chat(user_id=user_id, title=chat.title)
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    return new_chat

@router.get("/chat/", response_model=List[ChatOut])
def list_chats(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    chats = db.query(Chat).filter(Chat.user_id == user_id).order_by(Chat.created_at.desc()).all()
    return chats

@router.get("/chat/{chat_id}/messages", response_model=List[MessageOut])
def get_messages(chat_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == user_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.timestamp).all()

@router.post("/chat/{chat_id}/message", response_model=MessageOut)
def post_message(chat_id: int, message: MessageCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == user_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    new_message = Message(chat_id=chat_id, sender="user", content=message.content, timestamp=datetime.utcnow())
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message
