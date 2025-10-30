from fastapi import WebSocket, WebSocketDisconnect, APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from models import Chat, Message, User
from schemas import MessageOut
import db
import auth
from datetime import datetime
import json

# LangChain Gemini integration
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
import os
router = APIRouter()

def get_db():
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

def get_gemini_response(user_query: str) -> str:
    # You must set your Gemini API key in the environment variable 'GOOGLE_API_KEY'
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return "Gemini API key not set."
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=api_key)
    try:
        response = llm.invoke([HumanMessage(content=user_query)])
        return response.content if hasattr(response, 'content') else str(response)
    except Exception as e:
        return f"Gemini error: {e}"

@router.websocket("/ws/chat/{chat_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    chat_id: int, 
    token: str = Query(None),
    db: Session = Depends(get_db)
):
    # Validate JWT token
    if not token:
        await websocket.close(code=1008, reason="Authentication required")
        return
    
    try:
        payload = auth.decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=1008, reason="Invalid token")
            return
        
        # Convert user_id to int
        user_id = int(user_id)
        
        # Verify user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            await websocket.close(code=1008, reason="User not found")
            return
        
        # Verify user owns the chat
        chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == user.id).first()
        if not chat:
            await websocket.close(code=1008, reason="Chat not found or unauthorized")
            return
            
    except Exception as e:
        await websocket.close(code=1008, reason=f"Authentication failed: {str(e)}")
        return
    
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg_data = json.loads(data)
            except Exception:
                await websocket.send_text(json.dumps({"error": "Invalid message format"}))
                continue
            # Store user message
            user_msg = Message(
                chat_id=chat_id,
                sender="user",
                content=msg_data.get("content"),
                file_type=msg_data.get("type"),
                file_name=msg_data.get("file_name"),
                file_url=msg_data.get("file_url"),
                timestamp=datetime.utcnow()
            )
            db.add(user_msg)
            db.commit()
            db.refresh(user_msg)
            # Get Gemini response for text queries
            bot_content = None
            if msg_data.get("content"):
                bot_content = get_gemini_response(msg_data["content"])
            else:
                bot_content = "This is a bot reply."
            bot_reply = Message(
                chat_id=chat_id,
                sender="bot",
                content=bot_content,
                timestamp=datetime.utcnow()
            )
            db.add(bot_reply)
            db.commit()
            db.refresh(bot_reply)
            await websocket.send_text(json.dumps({"message": bot_reply.content}))
    except WebSocketDisconnect:
        pass
