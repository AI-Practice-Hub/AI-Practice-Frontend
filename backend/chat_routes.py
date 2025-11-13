from fastapi import APIRouter, Depends, HTTPException, status, Form, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
from models import Chat, Message, User, Project
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

# Dummy test case data
TEST_CASES = [
    {
        "test_case_id": "TC-LOGIN-001",
        "title": "Verify user can log in with valid credentials",
        "module_feature": "Authentication",
        "priority": "High",
        "preconditions": "User is registered in the system; the system is online.",
        "test_steps": "1. Navigate to the login page.\n2. Enter a valid username in the 'Username' field.\n3. Enter a valid password in the 'Password' field.\n4. Click the 'Login' button.",
        "test_data": "Username: testuser@example.com, Password: SecureP@ss123.",
        "expected_result": "User is successfully redirected to the main dashboard/homepage.",
        "actual_result": "User is redirected to the main dashboard.",
        "status": "Pass"
    },
    {
        "test_case_id": "TC-PASSWORD-001",
        "title": "Test the complete password reset process via email",
        "module_feature": "Authentication",
        "priority": "High",
        "preconditions": "User has a registered email address; email service is operational.",
        "test_steps": "1. Navigate to the login page.\n2. Click 'Forgot Password' link.\n3. Enter registered email address.\n4. Check email for reset link.\n5. Click reset link and set new password.\n6. Attempt login with new password.",
        "test_data": "Email: testuser@example.com, New Password: NewSecureP@ss456.",
        "expected_result": "Password is successfully reset and user can login with new credentials.",
        "actual_result": "Password reset email sent successfully.",
        "status": "Pass"
    },
    {
        "test_case_id": "TC-SEARCH-001",
        "title": "Validate search results, filters, and sorting options",
        "module_feature": "Search",
        "priority": "Medium",
        "preconditions": "Products are available in the system; search functionality is enabled.",
        "test_steps": "1. Navigate to the search page.\n2. Enter search term 'laptop'.\n3. Apply price filter ($500-$1000).\n4. Sort by 'Price: Low to High'.\n5. Verify search results match criteria.",
        "test_data": "Search Term: laptop, Price Range: $500-$1000.",
        "expected_result": "Search results display only laptops within the specified price range, sorted correctly.",
        "actual_result": "Search results filtered and sorted as expected.",
        "status": "Pass"
    },
    {
        "test_case_id": "TC-CART-001",
        "title": "Test adding/removing items, quantity updates, and checkout",
        "module_feature": "Shopping Cart",
        "priority": "High",
        "preconditions": "User is logged in; products are available for purchase.",
        "test_steps": "1. Add 2 items to cart.\n2. Update quantity of first item to 3.\n3. Remove second item from cart.\n4. Proceed to checkout.\n5. Complete purchase.",
        "test_data": "Items: Laptop ($800), Mouse ($25); Payment: Credit Card.",
        "expected_result": "Cart updates correctly, checkout completes successfully.",
        "actual_result": "All cart operations work as expected.",
        "status": "Pass"
    },
    {
        "test_case_id": "TC-PAYMENT-001",
        "title": "Verify payment gateway integration and transaction handling",
        "module_feature": "Payment",
        "priority": "Critical",
        "preconditions": "Payment gateway is configured; user has valid payment method.",
        "test_steps": "1. Add items to cart and proceed to checkout.\n2. Enter payment information.\n3. Submit payment.\n4. Verify transaction completion.\n5. Check order confirmation.",
        "test_data": "Payment Method: Visa ****1234, Amount: $825.",
        "expected_result": "Payment processes successfully and order is confirmed.",
        "actual_result": "Payment gateway integration working correctly.",
        "status": "Pass"
    },
    {
        "test_case_id": "TC-PROFILE-001",
        "title": "Test profile updates, avatar upload, and settings changes",
        "module_feature": "User Profile",
        "priority": "Medium",
        "preconditions": "User is logged in; profile editing is enabled.",
        "test_steps": "1. Navigate to profile settings.\n2. Update name and contact information.\n3. Upload new avatar image.\n4. Change notification preferences.\n5. Save changes.",
        "test_data": "Name: John Doe, Email: john@example.com, Avatar: profile.jpg.",
        "expected_result": "Profile information updates successfully and displays correctly.",
        "actual_result": "Profile updated with new information and avatar.",
        "status": "Pass"
    }
]


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
    if files and len(files) > 0 and content and "automation" in content.lower():
        return "user_interrupt"  
    else:
        return "ai_response"

@router.post("/chat/", response_model=ChatOut)
def create_chat(chat: ChatCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    # Verify user owns the project
    project = db.query(Project).filter(Project.id == chat.project_id, Project.user_id == user_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or unauthorized")
    
    new_chat = Chat(user_id=user_id, project_id=chat.project_id, title=chat.title)
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    return new_chat

@router.get("/chat/", response_model=List[ChatOut])
def list_chats(project_id: Optional[int] = Query(None), db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    query = db.query(Chat).filter(Chat.user_id == user_id)
    if project_id:
        # Verify user owns the project
        project = db.query(Project).filter(Project.id == project_id, Project.user_id == user_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found or unauthorized")
        query = query.filter(Chat.project_id == project_id)
    chats = query.order_by(Chat.created_at.desc()).all()
    return chats

@router.put("/chat/{chat_id}", response_model=ChatOut)
def update_chat(chat_id: int, chat_update: ChatCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    chat = db.query(Chat).join(Chat.project).filter(Chat.id == chat_id, Project.user_id == user_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found or unauthorized")
    
    chat.title = chat_update.title
    chat.project_id = chat_update.project_id  # Allow changing project, but verify ownership
    # Verify new project ownership
    if chat_update.project_id != chat.project_id:
        new_project = db.query(Project).filter(Project.id == chat_update.project_id, Project.user_id == user_id).first()
        if not new_project:
            raise HTTPException(status_code=404, detail="New project not found or unauthorized")
    
    db.commit()
    db.refresh(chat)
    return chat

@router.delete("/chat/{chat_id}")
def delete_chat(chat_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    chat = db.query(Chat).join(Chat.project).filter(Chat.id == chat_id, Project.user_id == user_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found or unauthorized")
    
    # Delete all messages in the chat first
    db.query(Message).filter(Message.chat_id == chat_id).delete()
    # Delete the chat
    db.delete(chat)
    db.commit()
    
    return {"message": "Chat deleted successfully"}

@router.get("/chat/{chat_id}/messages", response_model=List[MessageOut])
def get_messages(chat_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    chat = db.query(Chat).join(Chat.project).filter(Chat.id == chat_id, Project.user_id == user_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    messages = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.timestamp).all()
    
    # Convert to MessageOut with invoke_type (null for existing messages)
    return [
        MessageOut(
            id=msg.id,
            chat_id=msg.chat_id,
            sender=msg.sender,
            content=msg.content,
            file_type=msg.file_type,
            file_name=msg.file_name,
            file_url=msg.file_url,
            invoke_type=None,  # Existing messages don't have invoke_type
            timestamp=msg.timestamp
        )
        for msg in messages
    ]

@router.post("/chat/{chat_id}/message", response_model=MessageOut)
def post_message(chat_id: int, message: MessageCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    chat = db.query(Chat).join(Chat.project).filter(Chat.id == chat_id, Project.user_id == user_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    new_message = Message(chat_id=chat_id, sender="user", content=message.content, timestamp=datetime.utcnow())
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message


@router.post("/chat/{chat_id}/send-message", response_model=MessageOut)
async def send_message(
    chat_id: int,
    invoke_type: str = Query(..., description="Type of message: new, resume"),
    content: str = Form(None, description="Text content of the message"),
    files: List[UploadFile] = File(None, description="Optional file upload"),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Send a message to chat and get bot response
    Replaces WebSocket functionality with REST API
    """
    # Verify user owns the chat (via project)
    chat = db.query(Chat).join(Chat.project).filter(Chat.id == chat_id, Project.user_id == user_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found or unauthorized")
    
    # Handle file uploads
    file_names = []
    if files:
        files = [f for f in files if f.filename]  # Filter out empty files
        file_names = [f.filename for f in files]
    
    # Determine message type based on content and files
    if files and len(files) > 0:
        # Determine file type from first file extension
        first_file = files[0].filename.lower()
        if first_file.endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
            message_type = "image"
        elif first_file.endswith('.pdf'):
            message_type = "pdf"
        elif first_file.endswith(('.webm', '.mp3', '.wav', '.m4a')):
            message_type = "audio"
        else:
            message_type = "file"  # Generic file type
    else:
        message_type = "text"
    
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
    
    # Determine response type based on inputs (simplified since no website_url)
    response_type = determine_response_type(content or "", "", files or [])
    
    # Check if user is requesting test cases
    if content and "show test" in content.lower():
        response_type = "test-case-approval"
    
    # Generate appropriate response
    if response_type == "test-case-approval":
        # Return test case data instead of regular message
        bot_content = TEST_CASES  # This will be handled specially by frontend
    elif response_type == "user_interrupt":
        if file_names:
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
    if response_type == "test-case-approval":
        # For test case approval, store a placeholder message
        bot_content = "Test cases available for selection"
    else:
        bot_content = bot_content
    
    bot_msg = Message(
        chat_id=chat_id,
        sender="bot",
        content=bot_content,
        timestamp=datetime.utcnow()
    )
    db.add(bot_msg)
    db.commit()
    db.refresh(bot_msg)
    
    # Return bot message with invoke_type
    return MessageOut(
        id=bot_msg.id,
        chat_id=bot_msg.chat_id,
        sender=bot_msg.sender,
        content=bot_content,
        invoke_type=response_type,
        test_case=TEST_CASES if response_type == "test-case-approval" else None,
        timestamp=bot_msg.timestamp
    )
