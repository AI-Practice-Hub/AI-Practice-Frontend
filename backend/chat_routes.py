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
from pydantic import BaseModel

# LangChain Gemini integration
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

router = APIRouter()

# Dummy test case data
TEST_CASES = [
        {
            "test_case_id": "TC-SEARCH-001",
            "test_case_unique_id": "tc-unique-001",
            "title": "Verify Search Bar Visibility and Accessibility on Homepage",
            "module_feature": "Search Bar - Visibility",
            "priority": "High",
            "preconditions": "User is on the Myntra homepage (anonymous user).",
            "test_steps": [
                "Navigate to the Myntra homepage (https://www.myntra.com).",
                "Verify the presence and visual prominence of the main Search Bar."
            ],
            "test_data": None,
            "expected_result": "The Search Bar with placeholder text ('Search for products, brands and more') must be visible and enabled for input at the top of the page.",
            "actual_result": "",
            "status": "new"
        },
        {
            "test_case_id": "TC-SEARCH-002",
            "test_case_unique_id": "tc-unique-002",
            "title": "Validate Auto-Suggestion Functionality (Positive Keyword & Performance NFR)",
            "module_feature": "Search Bar - Auto-Suggestions & Performance",
            "priority": "High",
            "preconditions": "Search Bar is visible.",
            "test_steps": [
                "Click into the Search Bar.",
                "Type the first three characters of a common keyword (e.g., 'red').",
                "Measure the time taken between the third character input and the display of the suggestion list.",
                "Verify that the suggestion dropdown appears."
            ],
            "test_data": "Keyword: 'red'",
            "expected_result": "1. The auto-suggestion list must appear within 200ms.\n2. The suggestion list must contain relevant suggestions (e.g., Categories, Brands, or Trending terms) related to 'red'.",
            "actual_result": "",
            "status": "new"
        },
        {
            "test_case_id": "TC-SEARCH-003",
            "test_case_unique_id": "tc-unique-003",
            "title": "Verify Search Functionality using Complex Keyword and Enter Key Submission",
            "module_feature": "Search Functionality",
            "priority": "High",
            "preconditions": "Search Bar is visible.",
            "test_steps": [
                "Type a multi-word search query into the Search Bar.",
                "Submit the search query by pressing the 'Enter' key.",
                "Verify that the page navigates to the Search Results Page (SRP)."
            ],
            "test_data": "Search Query: 'men shoes'",
            "expected_result": "The Search Results Page (SRP) for 'men shoes' should load successfully, displaying a list of relevant products.",
            "actual_result": "",
            "status": "new"
        },
        {
            "test_case_id": "TC-SRP-004",
            "test_case_unique_id": "tc-unique-004",
            "title": "Validate Core Visual Components of the Search Results Page (SRP)",
            "module_feature": "SRP - Visual Structure",
            "priority": "High",
            "preconditions": "User is on a non-empty SRP (e.g., after searching for 'red dress').",
            "test_steps": [
                "Search for a keyword that yields a high number of results (e.g., 'red dress').",
                "Verify the presence of the navigation breadcrumbs.",
                "Verify the display of the total number of results found (e.g., 'X items found' format).",
                "Verify the presence of the product grid area."
            ],
            "test_data": "Search Query: 'red dress'",
            "expected_result": "1. Breadcrumbs should be visible.\n2. The total result count in the format 'X items found' (where X > 0) must be displayed.\n3. A product grid displaying multiple products must be visible.",
            "actual_result": "",
            "status": "new"
        },
        {
            "test_case_id": "TC-SRP-005",
            "test_case_unique_id": "tc-unique-005",
            "title": "Validate Product Card Structure on the SRP",
            "module_feature": "SRP - Product Grid Details",
            "priority": "High",
            "preconditions": "User is on a non-empty SRP.",
            "test_steps": [
                "Identify the first product card in the search results grid.",
                "Verify that all required elements are present on that product card."
            ],
            "test_data": "Search Query: 'nike sneakers'",
            "expected_result": "Each product card must display:\n1. Product Image.\n2. Product Title/Name.\n3. Product Brand.\n4. Current Price.\n5. Discount percentage (if applicable).",
            "actual_result": "",
            "status": "new"
        },
        {
            "test_case_id": "TC-SRP-006",
            "test_case_unique_id": "tc-unique-006",
            "title": "Verify Anonymous User Navigation from SRP to Product Detail Page (PDP)",
            "module_feature": "SRP - Navigation",
            "priority": "High",
            "preconditions": "User is on a non-empty SRP and is not logged in.",
            "test_steps": [
                "Search for a relevant keyword.",
                "Click on the image or title of the first product in the grid.",
                "Verify that the browser navigates to the Product Detail Page (PDP).",
                "Verify that the PDP loads without forcing a login or showing a block message."
            ],
            "test_data": "Search Query: 'jeans'",
            "expected_result": "The Product Detail Page (PDP) loads successfully, displaying product details (description, sizes, reviews) and allowing the anonymous user to view the page content freely.",
            "actual_result": "",
            "status": "new"
        },
        {
            "test_case_id": "TC-SEARCH-007",
            "test_case_unique_id": "tc-unique-007",
            "title": "Validate SRP Relevance: Keyword Match (Brand and Title)",
            "module_feature": "SRP - Relevance",
            "priority": "Medium",
            "preconditions": "User is on a non-empty SRP.",
            "test_steps": [
                "Perform a search using a specific Brand name.",
                "Verify the titles and brands of the first 5-10 products displayed on the SRP."
            ],
            "test_data": "Search Query: 'nike'",
            "expected_result": "The majority of the results, specifically the top results, should either have the word 'Nike' in the product title or display 'Nike' as the product brand.",
            "actual_result": "",
            "status": "new"
        },
        {
            "test_case_id": "TC-SEARCH-008",
            "test_case_unique_id": "tc-unique-008",
            "title": "Validate Edge Case: Search using Special Characters/Invalid Input (Sanitization)",
            "module_feature": "Search Functionality - Input Validation/Sanitization",
            "priority": "Medium",
            "preconditions": "Search Bar is visible.",
            "test_steps": [
                "Type a search query containing common special characters that might be used for injection or manipulation into the Search Bar.",
                "Submit the search query.",
                "Verify the behavior of the SRP."
            ],
            "test_data": "Search Query: 'shoes <script>alert('XSS')</script>'",
            "expected_result": "1. The system must sanitize the input, preventing the execution of code (no alert box should appear).\n2. The SRP should either treat the input as literal text and show zero/irrelevant results, or successfully remove the characters and search for 'shoes'. The page should load securely and not crash.",
            "actual_result": "",
            "status": "Pass"
        },
        {
            "test_case_id": "TC-SRP-009",
            "test_case_unique_id": "tc-unique-009",
            "title": "Validate Performance NFR: SRP Load Time",
            "module_feature": "SRP - Performance NFR",
            "priority": "High",
            "preconditions": "Search Bar is visible and connection speed is adequate.",
            "test_steps": [
                "Clear browser cache and perform a hard reload to ensure a clean load.",
                "Type a popular keyword into the search bar.",
                "Measure the total time taken for the Search Results Page (SRP) to fully load and display the product grid."
            ],
            "test_data": "Search Query: 'tshirts'",
            "expected_result": "The Search Results Page (SRP) must load and display results within the specified 2 seconds performance constraint.",
            "actual_result": "",
            "status": "Fail"
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

@router.get("/chat/{chat_id}/details")
def get_chat_details(chat_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    """Get chat title and project name based on chat_id"""
    chat = db.query(Chat).join(Chat.project).filter(Chat.id == chat_id, Project.user_id == user_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found or unauthorized")
    
    return {
        "chat_id": chat.id,
        "chat_title": chat.title,
        "project_id": chat.project_id,
        "project_name": chat.project.name
    }

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
    
    # Convert to MessageOut with invoke_type (mark test-case-approval when special bot message created by explorer)
    return [
        MessageOut(
            id=msg.id,
            chat_id=msg.chat_id,
            sender=msg.sender,
            content=msg.content,
            file_type=msg.file_type,
            file_name=msg.file_name,
            file_url=msg.file_url,
            invoke_type="test-case-approval" if msg.sender == "bot" and msg.content == "Test cases available for selection" else None,
            test_case=TEST_CASES if msg.sender == "bot" and msg.content == "Test cases available for selection" else None,
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


@router.get('/chat/{chat_id}/test-cases/{test_case_id}', response_model=dict)
def get_test_case(chat_id: int, test_case_id: str, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    # Verify user owns the chat (via project)
    chat = db.query(Chat).join(Chat.project).filter(Chat.id == chat_id, Project.user_id == user_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail='Chat not found or unauthorized')

    for tc in TEST_CASES:
        if tc.get('test_case_id') == test_case_id:
            return tc

    raise HTTPException(status_code=404, detail='Test case not found')


@router.post('/chat/{chat_id}/test-cases/{test_case_id}/comment', response_model=dict)
def comment_test_case(chat_id: int, test_case_id: str, payload: dict, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    # Verify ownership
    chat = db.query(Chat).join(Chat.project).filter(Chat.id == chat_id, Project.user_id == user_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail='Chat not found or unauthorized')

    # Deprecated endpoint: comments will not be stored.
    raise HTTPException(status_code=410, detail='This endpoint is deprecated. Use /update instead.')


class UpdateTestCaseRequest(BaseModel):
    chat_id: str
    project_id: str
    test_case_id: str
    test_case_unique_id: str
    comments: str


@router.post('/chat/update_test_case', response_model=dict)
def update_test_case(payload: UpdateTestCaseRequest, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    """
    Update the test case details based on user-provided text. This is a mock endpoint — it updates the expected_result.
    """
    chat_id = int(payload.chat_id)
    project_id = int(payload.project_id)
    
    # Verify ownership
    chat = db.query(Chat).join(Chat.project).filter(Chat.id == chat_id, Project.id == project_id, Project.user_id == user_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail='Chat not found or unauthorized')

    content = payload.comments
    if not content:
        raise HTTPException(status_code=400, detail='Comments are required')

    # Find by unique ID first, then fallback to ID
    target_tc = None
    for tc in TEST_CASES:
        if tc.get('test_case_unique_id') == payload.test_case_unique_id:
            target_tc = tc
            break
        # Fallback check if unique_id matches test_case_id (for legacy data)
        if tc.get('test_case_id') == payload.test_case_id:
            target_tc = tc
            break
            
    if target_tc:
        # Mock update: replace expected_result with comments
        target_tc['expected_result'] = content
        
        # Inject missing fields for the mock response to match real API structure
        response_tc = target_tc.copy()
        response_tc['project_id'] = str(project_id)
        response_tc['chat_id'] = str(chat_id)
        response_tc['created_at'] = datetime.utcnow().isoformat()
        response_tc['updated_at'] = datetime.utcnow().isoformat()
        response_tc['error_log'] = None
        
        # Update the main TEST_CASES list so it persists in memory
        target_tc.update(response_tc)
        
        return response_tc

    raise HTTPException(status_code=404, detail='Test case not found')


@router.post('/chat/{chat_id}/test-cases/{test_case_id}/execute', response_model=dict)
def execute_test_case(chat_id: int, test_case_id: str, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    # Verify ownership
    chat = db.query(Chat).join(Chat.project).filter(Chat.id == chat_id, Project.user_id == user_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail='Chat not found or unauthorized')

    for tc in TEST_CASES:
        if tc.get('test_case_id') == test_case_id:
            if tc.get('status', '').lower() != 'new':
                raise HTTPException(status_code=400, detail='Test case already executed')

            # Mock execution result
            # Randomly choose pass or fail
            import random
            tc['status'] = 'Pass' if random.random() > 0.3 else 'Fail'
            tc['actual_result'] = f"Executed by mock runner on {datetime.utcnow().isoformat()}"
            return tc

    raise HTTPException(status_code=404, detail='Test case not found')


@router.post('/chat/{chat_id}/test-cases/execute', response_model=dict)
def bulk_execute_test_cases(chat_id: int, payload: dict, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    # Expected payload: { test_case_ids: ["TC-...", ...] }
    chat = db.query(Chat).join(Chat.project).filter(Chat.id == chat_id, Project.user_id == user_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail='Chat not found or unauthorized')

    test_case_ids = payload.get('test_case_ids') or []
    if not isinstance(test_case_ids, list) or len(test_case_ids) == 0:
        raise HTTPException(status_code=400, detail='test_case_ids is required')

    executed = []
    for tc_id in test_case_ids:
        for tc in TEST_CASES:
            if tc.get('test_case_id') == tc_id:
                if tc.get('status', '').lower() != 'new':
                    continue
                import random
                tc['status'] = 'Pass' if random.random() > 0.3 else 'Fail'
                tc['actual_result'] = f"Executed by mock runner on {datetime.utcnow().isoformat()}"
                executed.append(tc)
    return { 'executed': executed }


@router.delete('/chat/{chat_id}/test-cases/{test_case_id}')
def delete_test_case(chat_id: int, test_case_id: str, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    chat = db.query(Chat).join(Chat.project).filter(Chat.id == chat_id, Project.user_id == user_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail='Chat not found or unauthorized')

    for i, tc in enumerate(TEST_CASES):
        if tc.get('test_case_id') == test_case_id:
            TEST_CASES.pop(i)
            return { 'message': 'Test case deleted' }

    raise HTTPException(status_code=404, detail='Test case not found')


@router.post('/automation/execute-from-mongo', response_model=dict)
def execute_from_mongo(payload: dict, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    """
    Mock automation endpoint that finds test cases by test_case_unique_id,
    executes them (mock), and returns updated results.
    """
    project_id = payload.get('project_id')
    chat_id = payload.get('chat_id')
    test_case_ids = payload.get('test_case_ids')  # array of test_case_unique_id

    if not project_id or not chat_id or not isinstance(test_case_ids, list) or len(test_case_ids) == 0:
        raise HTTPException(status_code=400, detail='project_id, chat_id and test_case_ids are required')

    # Verify project ownership
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == user_id).first()
    if not project:
        raise HTTPException(status_code=404, detail='Project not found or unauthorized')

    # Verify chat ownership
    chat = db.query(Chat).join(Chat.project).filter(Chat.id == chat_id, Project.user_id == user_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail='Chat not found or unauthorized')

    # Find and execute test cases by test_case_unique_id
    test_results = []
    for unique_id in test_case_ids:
        for tc in TEST_CASES:
            if tc.get('test_case_unique_id') == unique_id:
                if tc.get('status', '').lower() == 'new':
                    # Mock execution
                    import random
                    tc['status'] = 'Pass' if random.random() > 0.3 else 'Fail'
                    tc['actual_result'] = f"Mock execution completed on {datetime.utcnow().isoformat()}"
                test_results.append(tc)
                break

    return {
        'message': f'Executed {len(test_results)} test case(s) successfully',
        'test_results': test_results
    }


@router.post('/jira_integration')
def jira_integration(payload: dict, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    """
    Send a test case to Jira.
    Expects: { "test_case_unique_id": "<id>", "project_id": <id> }
    """
    test_case_unique_id = payload.get('test_case_unique_id')
    project_id = payload.get('project_id')
    
    if not test_case_unique_id:
        raise HTTPException(status_code=400, detail='test_case_unique_id is required')
    
    if not project_id:
        raise HTTPException(status_code=400, detail='project_id is required')
    
    # Get user's Jira credentials
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    
    if not user.jira_email or not user.jira_api_token:
        raise HTTPException(
            status_code=400, 
            detail='Jira credentials not configured. Please add your Jira email and API token in Settings.'
        )
    
    if not user.jira_api_url:
        raise HTTPException(
            status_code=400, 
            detail='Jira API URL not configured. Please add your Jira API URL in Settings.'
        )
    
    # Find the test case
    test_case = None
    for tc in TEST_CASES:
        if tc.get('test_case_unique_id') == test_case_unique_id:
            test_case = tc
            break
    
    if not test_case:
        raise HTTPException(status_code=404, detail='Test case not found')
    
    # Get project's jira_project_id from the database
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == user_id).first()
    if not project:
        raise HTTPException(status_code=404, detail='Project not found')
    
    if not project.jira_project_id:
        raise HTTPException(
            status_code=400, 
            detail='Project not linked to Jira. Please configure Jira Project ID in project settings.'
        )
    
    # Mock Jira integration - in production, this would make actual API calls to Jira
    # For now, we'll just simulate success
    try:
        # Here you would typically:
        # 1. Format the test case data for Jira API
        # 2. Make POST request to Jira API to create issue/test case using user.jira_api_url
        # 3. Handle Jira API response
        
        # Mock response
        jira_issue_key = f"PROJ-{random.randint(1000, 9999)}"
        
        return {
            'success': True,
            'message': f'Test case successfully sent to Jira',
            'jira_issue_key': jira_issue_key,
            'test_case_id': test_case.get('test_case_id'),
            'test_case_unique_id': test_case_unique_id
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f'Failed to send test case to Jira: {str(e)}'
        )
