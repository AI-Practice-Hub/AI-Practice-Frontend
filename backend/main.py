# FastAPI backend entry point
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from user_routes import router as user_router

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

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
