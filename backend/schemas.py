from pydantic import BaseModel, EmailStr, Field, validator


class UserCreate(BaseModel):
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
    email: EmailStr

    model_config = {
        # This is the new way in Pydantic V2 to enable ORM mode
        "from_attributes": True
    }


class UserLogin(BaseModel):
    email: EmailStr
    password: str
