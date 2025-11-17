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
            "test_case_id": "TC-SEARCH-001",
            "title": "Verify Search Bar Visibility on Homepage and Subsequent Pages (Accessibility Requirement)",
            "module_feature": "Search Bar Visibility",
            "priority": "High",
            "preconditions": "User is on the Myntra website (anonymous session).",
            "test_steps": [
                "Navigate to the base URL: https://www.myntra.com (Homepage).",
                "Verify the presence and location of the Search bar (element with placeholder 'Search for products, brands and more').",
                "Click on a main navigation link (e.g., 'Women' or 'Kids') to navigate to a secondary page.",
                "Verify the Search bar remains visible and functional on the secondary page."
            ],
            "test_data": "Search Bar Reference: textbox \"Search for products, brands and more\" [ref=e41].",
            "expected_result": "The search bar must be consistently visible and accessible in the header section across the homepage and all subsequent category/secondary pages.",
            "actual_result": "",
            "status": "Pending"
        },
        {
            "test_case_id": "TC-SEARCH-002",
            "title": "Validate Auto-Suggestions Content and meet the 200ms Performance Constraint (FR 7.1)",
            "module_feature": "Auto-Suggestions Performance and Content",
            "priority": "Critical",
            "preconditions": "The search bar is visible on the page.",
            "test_steps": [
                "Focus on the search bar.",
                "Start typing a partial, common product keyword (e.g., 'red dr') and initiate a timer immediately.",
                "Stop the timer when the suggestion box completely renders.",
                "Verify the measured time is less than or equal to 200 milliseconds (FR 7.1).",
                "Verify the suggestion box includes various types of suggestions: Brands, Categories, and Trending keywords."
            ],
            "test_data": "Partial Keyword: 'red dr'. Expected Suggestion Categories: Brands (e.g., 'DressBerry'), Categories (e.g., 'Red Dresses'), Trending.",
            "expected_result": "A complete list of auto-suggestions must appear within 200ms of typing. The list must contain a mix of relevant Brands, Categories, and Trending keywords.",
            "actual_result": "",
            "status": "Pending"
        },
        {
            "test_case_id": "TC-SEARCH-003",
            "title": "Verify Core Keyword Search and SRP Product Grid Display (Flow A, FR 7.2)",
            "module_feature": "Keyword Search Functionality",
            "priority": "High",
            "preconditions": "The search bar is functional.",
            "test_steps": [
                "Type a specific, multi-word keyword into the search bar.",
                "Submit the search query (e.g., by pressing Enter).",
                "Verify the Search Results Page (SRP) loads completely.",
                "Verify the Search Results Page displays the 'Result Count' (e.g., 'X items found').",
                "Validate the product grid to ensure each item shows mandatory details: Image, Title, Brand, Price, and Discount (FR 7.2)."
            ],
            "test_data": "Keyword: 'men shoes'",
            "expected_result": "The SRP loads with relevant results (based on keyword, category, or brand match). The page displays the total result count and a grid where all product listings show the required metadata (Image, Title, Brand, Price, Discount).",
            "actual_result": "",
            "status": "Pending"
        },
        {
            "test_case_id": "TC-SEARCH-004",
            "title": "Validate 'No Results Found' Scenario with Recommendation Display (Edge Case 9)",
            "module_feature": "Empty Search Results Handling",
            "priority": "Medium",
            "preconditions": "The search bar is functional.",
            "test_steps": [
                "Type a keyword that is highly unlikely to match any product.",
                "Submit the search query.",
                "Verify the SRP URL includes the non-matching keyword.",
                "Verify a clear message like 'No results found' is displayed.",
                "Verify that the system still shows a selection of recommended products (fallback list) on the page."
            ],
            "test_data": "Keyword: 'xyzasdfghjkl'",
            "expected_result": "The system should explicitly notify the user that no results were found for the query and display alternative product recommendations or a fallback list to keep the user engaged.",
            "actual_result": "",
            "status": "Pending"
        },
        {
            "test_case_id": "TC-SEARCH-005",
            "title": "Verify Keyword Search Loading Time meets the 2-second constraint (NFR 8)",
            "module_feature": "Search Results Page Performance",
            "priority": "High",
            "preconditions": "The search bar is functional and connected to the backend search service.",
            "test_steps": [
                "Type a broad, high-volume keyword (e.g., 'red dress') into the search bar.",
                "Initiate a timer immediately upon submitting the query (Enter/Click).",
                "Stop the timer when the entire Search Results Page has rendered.",
                "Verify the total loading time is less than or equal to 2 seconds (NFR 8)."
            ],
            "test_data": "Keyword: 'red dress'",
            "expected_result": "The Search Results Page (SRP) must load and render completely within 2 seconds, meeting the non-functional requirement (NFR 8).",
            "actual_result": "",
            "status": "Pending"
        },
        {
            "test_case_id": "TC-SEARCH-006",
            "title": "Verify Input Sanitization for Special Characters (Edge Case 9)",
            "module_feature": "Input Handling",
            "priority": "Medium",
            "preconditions": "The search bar accepts user input.",
            "test_steps": [
                "Enter a keyword combined with special characters or a simulated XSS payload.",
                "Submit the search query.",
                "Verify that the search results are based only on the valid, recognizable keywords.",
                "Check browser console messages and page display for any signs of script execution or malformed page content."
            ],
            "test_data": "Keyword: 'nike sneakers <script>evil_code()</script>'",
            "expected_result": "The input should be sanitized (Edge Case 9). The system should ignore or strip the invalid characters/code and return a valid SRP for 'nike sneakers'. No client-side script execution should occur, and no blank pages should appear (AC 10).",
            "actual_result": "",
            "status": "Pending"
        }
    ]
#  [
#     {
#         "test_case_id": "TC-LOGIN-001",
#         "title": "Verify user can log in with valid credentials",
#         "module_feature": "Authentication",
#         "priority": "High",
#         "preconditions": "User is registered in the system; the system is online.",
#         "test_steps": [
#             "Navigate to the login page.",
#             "Enter a valid username in the 'Username' field.",
#             "Enter a valid password in the 'Password' field.",
#             "Click the 'Login' button."
#         ],
#         "test_data": "Username: testuser@example.com, Password: SecureP@ss123.",
#         "expected_result": "User is successfully redirected to the main dashboard/homepage.",
#         "actual_result": "User is redirected to the main dashboard.",
#         "status": "Pass"
#     },
#     {
#         "test_case_id": "TC-PASSWORD-001",
#         "title": "Test the complete password reset process via email",
#         "module_feature": "Authentication",
#         "priority": "High",
#         "preconditions": "User has a registered email address; email service is operational.",
#         "test_steps": [
#             "Navigate to the login page.",
#             "Click 'Forgot Password' link.",
#             "Enter registered email address.",
#             "Check email for reset link.",
#             "Click reset link and set new password.",
#             "Attempt login with new password."
#         ],
#         "test_data": "Email: testuser@example.com, New Password: NewSecureP@ss456.",
#         "expected_result": "Password is successfully reset and user can login with new credentials.",
#         "actual_result": "Password reset email sent successfully.",
#         "status": "Pass"
#     },
#     {
#         "test_case_id": "TC-SEARCH-001",
#         "title": "Validate search results, filters, and sorting options",
#         "module_feature": "Search",
#         "priority": "Medium",
#         "preconditions": "Products are available in the system; search functionality is enabled.",
#         "test_steps": [
#             "Navigate to the search page.",
#             "Enter search term 'laptop'.",
#             "Apply price filter ($500-$1000).",
#             "Sort by 'Price: Low to High'.",
#             "Verify search results match criteria."
#         ],
#         "test_data": "Search Term: laptop, Price Range: $500-$1000.",
#         "expected_result": "Search results display only laptops within the specified price range, sorted correctly.",
#         "actual_result": "Search results filtered and sorted as expected.",
#         "status": "Pass"
#     },
#     {
#         "test_case_id": "TC-CART-001",
#         "title": "Test adding/removing items, quantity updates, and checkout",
#         "module_feature": "Shopping Cart",
#         "priority": "High",
#         "preconditions": "User is logged in; products are available for purchase.",
#         "test_steps": [
#             "Add 2 items to cart.",
#             "Update quantity of first item to 3.",
#             "Remove second item from cart.",
#             "Proceed to checkout.",
#             "Complete purchase."
#         ],
#         "test_data": "Items: Laptop ($800), Mouse ($25); Payment: Credit Card.",
#         "expected_result": "Cart updates correctly, checkout completes successfully.",
#         "actual_result": "All cart operations work as expected.",
#         "status": "Pass"
#     },
#     {
#         "test_case_id": "TC-PAYMENT-001",
#         "title": "Verify payment gateway integration and transaction handling",
#         "module_feature": "Payment",
#         "priority": "Critical",
#         "preconditions": "Payment gateway is configured; user has valid payment method.",
#         "test_steps": [
#             "Add items to cart and proceed to checkout.",
#             "Enter payment information.",
#             "Submit payment.",
#             "Verify transaction completion.",
#             "Check order confirmation."
#         ],
#         "test_data": "Payment Method: Visa ****1234, Amount: $825.",
#         "expected_result": "Payment processes successfully and order is confirmed.",
#         "actual_result": "Payment gateway integration working correctly.",
#         "status": "Pass"
#     },
#     {
#         "test_case_id": "TC-PROFILE-001",
#         "title": "Test profile updates, avatar upload, and settings changes",
#         "module_feature": "User Profile",
#         "priority": "Medium",
#         "preconditions": "User is logged in; profile editing is enabled.",
#         "test_steps": [
#             "Navigate to profile settings.",
#             "Update name and contact information.",
#             "Upload new avatar image.",
#             "Change notification preferences.",
#             "Save changes."
#         ],
#         "test_data": "Name: John Doe, Email: john@example.com, Avatar: profile.jpg.",
#         "expected_result": "Profile information updates successfully and displays correctly.",
#         "actual_result": "Profile updated with new information and avatar.",
#         "status": "Pass"
#     }
# ]


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

@router.get("/chat/{chat_id}/test-cases", response_model=List[dict])
def get_test_cases(chat_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    """
    Get test cases for a specific chat session
    For now returns dummy test cases, later can be enhanced to generate based on chat history
    """
    # Verify user owns the chat (via project)
    chat = db.query(Chat).join(Chat.project).filter(Chat.id == chat_id, Project.user_id == user_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found or unauthorized")
    
    # For now, return dummy test cases
    # TODO: Later, analyze chat history to generate relevant test cases
    return TEST_CASES
