# FastAPI backend entry point
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from user_routes import router as user_router
from chat_routes import router as chat_router
from project_routes import router as project_router
from page_routes import router as page_router
from websocket import router as ws_router

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["health"])
async def root():
    return {"status": "healthy", "service": "Spec2Test API"}

subapi = FastAPI(title="Test Request Test API", version="0.1")
subapi.include_router(user_router, tags=["Auth"])
subapi.include_router(chat_router, tags=["Chat"])
subapi.include_router(project_router, tags=["Projects"])
subapi.include_router(page_router, tags=["Page"])
app.mount("/Chat2Test/v1", subapi)
# app.include_router(ws_router, tags=["ws"])  # Commented out - replaced with REST API

