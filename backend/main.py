# FastAPI backend entry point
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from user_routes import router as user_router
from chat_routes import router as chat_router
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

app.include_router(user_router, prefix="/api/auth", tags=["auth"])
app.include_router(chat_router, prefix="/api", tags=["chat"])
app.include_router(ws_router, tags=["ws"])

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
