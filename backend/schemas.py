from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    username: Optional[str] = None


class UserCreate(UserBase):
    email: EmailStr
    password: str = Field(..., min_length=6)  # min length in characters

    @validator('password')
    def validate_password(cls, v):
        # Check the actual UTF-8 encoded byte length
        if len(v.encode('utf-8')) > 72:  # bcrypt has a 72-byte limit
            raise ValueError('password cannot be longer than 72 bytes when UTF-8 encoded')
        return v


class UserOut(BaseModel):
    id: int
    email: str
    username: Optional[str] = None
    created_at: datetime

    model_config = {
        # This is the new way in Pydantic V2 to enable ORM mode
        "from_attributes": True
    }


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ChatBase(BaseModel):
    title: Optional[str] = None


class ChatCreate(ChatBase):
    pass


class ChatOut(ChatBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True


class MessageBase(BaseModel):
    content: Optional[str] = None
    file_type: Optional[str] = None
    file_name: Optional[str] = None
    file_url: Optional[str] = None


class MessageCreate(MessageBase):
    pass


class MessageOut(MessageBase):
    id: int
    chat_id: int
    sender: str
    timestamp: datetime

    class Config:
        orm_mode = True
