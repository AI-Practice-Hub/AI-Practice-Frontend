from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models
import schemas
import db
import auth

router = APIRouter()

def get_db():
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

@router.post("/signup", response_model=schemas.UserOut)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # Use user_id as the subject for consistency
    access_token = auth.create_access_token({"sub": str(db_user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/user/me", response_model=schemas.UserOut)
def get_current_user(db: Session = Depends(get_db), user_id: int = Depends(auth.get_current_user_id)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/user/me", response_model=schemas.UserOut)
def update_current_user(user_update: schemas.UserUpdate, db: Session = Depends(get_db), user_id: int = Depends(auth.get_current_user_id)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_update.name is not None:
        user.name = user_update.name
    if user_update.jira_email is not None:
        user.jira_email = user_update.jira_email
    if user_update.jira_api_token is not None:
        user.jira_api_token = user_update.jira_api_token
    if user_update.jira_api_url is not None:
        user.jira_api_url = user_update.jira_api_url
    
    db.commit()
    db.refresh(user)
    return user
