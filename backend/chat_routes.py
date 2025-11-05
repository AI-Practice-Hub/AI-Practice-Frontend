from fastapi import APIRouter, Depends, HTTPException, status, Form, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
from models import Chat, Message, User
from schemas import ChatCreate, ChatOut, MessageCreate, MessageOut, ChatBotResponse
import db
from datetime import datetime
from fastapi import Query
from auth import get_current_user_id, get_db
import random
import os

# LangChain Gemini integration
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

router = APIRouter()


def get_gemini_response(user_query: str) -> str:
    """Generate response using Gemini AI"""
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return "Gemini API key not set."
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=api_key)
    try:
        response = llm.invoke([HumanMessage(content=user_query)])
        return response.content if hasattr(response, 'content') else str(response)
    except Exception as e:
        return f"Gemini error: {e}"


def determine_response_type(content: str, website_url: str, files: List[UploadFile]) -> str:
    """Determine the type of response based on content and inputs"""
    if website_url and content and ("test" in content.lower() or "automate" in content.lower()):
        return "user_interrupt"
    elif files and len(files) > 0 and content and "automation" in content.lower():
        return "user_interrupt"  
    else:
        return "ai_response"

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


@router.post("/chat/{chat_id}/send-message", response_model=ChatBotResponse)
async def send_chat_message(
    chat_id: int,
    message_type: str = Form(...),
    content: str = Form(None),
    website_url: str = Form(None),
    upload_files: List[UploadFile] = File(None),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Send a message to chat and get bot response
    Replaces WebSocket functionality with REST API
    """
    # Verify user owns the chat
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == user_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found or unauthorized")
    
    # Handle file uploads
    file_names = []
    if upload_files:
        upload_files = [f for f in upload_files if f.filename]  # Filter out empty files
        file_names = [f.filename for f in upload_files]
    
    # Store user message in database
    user_msg = Message(
        chat_id=chat_id,
        sender="user",
        content=content,
        file_type=message_type if message_type != "text" else None,
        file_name=", ".join(file_names) if file_names else None,
        file_url=f"/files/{', '.join(file_names)}" if file_names else None,
        timestamp=datetime.utcnow()
    )
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)
    
    # Determine response type based on inputs
    response_type = determine_response_type(content or "", website_url or "", upload_files or [])
    
    # Generate appropriate response
    if response_type == "user_interrupt":
        if website_url:
            bot_content = f"Do you want me to test the website: {website_url}?"
        elif file_names:
            bot_content = f"Do you want me to process these files: {', '.join(file_names)}?"
        else:
            bot_content = "Do you want to proceed with this automation task?"
    else:
        # Generate AI response using Gemini
        if content:
            bot_content = get_gemini_response(content)
        else:
            bot_content = "I received your files. How can I help you with them?"
    
    # Store bot response in database
    bot_msg = Message(
        chat_id=chat_id,
        sender="bot",
        content=bot_content,
        timestamp=datetime.utcnow()
    )
    db.add(bot_msg)
    db.commit()
    db.refresh(bot_msg)
    
    # Return response in the required format
    return ChatBotResponse(
        type=response_type,
        response=bot_content
    )
