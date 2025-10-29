from fastapi import WebSocket, WebSocketDisconnect, APIRouter, Depends
from sqlalchemy.orm import Session
from models import Chat, Message
from schemas import MessageOut
import db
from datetime import datetime
import json

router = APIRouter()

def get_db():
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

@router.websocket("/ws/chat/{chat_id}")
async def websocket_endpoint(websocket: WebSocket, chat_id: int, db: Session = Depends(get_db)):
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
            # Dummy bot reply
            bot_reply = Message(
                chat_id=chat_id,
                sender="bot",
                content="This is a bot reply.",
                timestamp=datetime.utcnow()
            )
            db.add(bot_reply)
            db.commit()
            db.refresh(bot_reply)
            await websocket.send_text(json.dumps({"message": bot_reply.content}))
    except WebSocketDisconnect:
        pass
