from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
import db
from auth import get_current_user_id

router = APIRouter()

def get_db():
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

@router.post("/projects", response_model=schemas.ProjectOut)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    new_project = models.Project(
        name=project.name,
        description=project.description,
        status=project.status,
        user_id=user_id
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

@router.get("/projects", response_model=List[schemas.ProjectOut])
def list_projects(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    projects = db.query(models.Project).filter(models.Project.user_id == user_id).order_by(models.Project.created_at.desc()).all()
    return projects

@router.get("/projects/{project_id}", response_model=schemas.ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.user_id == user_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.put("/projects/{project_id}", response_model=schemas.ProjectOut)
def update_project(project_id: int, project_update: schemas.ProjectCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.user_id == user_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project.name = project_update.name
    project.description = project_update.description
    project.status = project_update.status
    db.commit()
    db.refresh(project)
    return project

@router.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.user_id == user_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Delete associated chats and messages
    for chat in project.chats:
        db.query(models.Message).filter(models.Message.chat_id == chat.id).delete()
    db.query(models.Chat).filter(models.Chat.project_id == project_id).delete()
    db.delete(project)
    db.commit()
    
    return {"message": "Project deleted successfully"}