---
name: FastAPI Route Generator
description: Create a Python FastAPI API endpoint with Pydantic models.
dependencies: "fastapi, pydantic"
---

## Guidelines
- Use Pydantic models for request/response schemas.
- Use dependency injection for DB sessions or services.
- Include proper status codes and error handling.

## Template
\`\`\`python
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

router = APIRouter()

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str | None = None
    age: int

class UserResponse(UserCreate):
    id: int

@router.post("/users/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate):
    # Simulate DB lookup
    if user.email == "exists@example.com":
        raise HTTPException(
            status_code=400, 
            detail="Email already registered"
        )
    
    # Simulate saving
    return {**user.dict(), "id": 123}
\`\`\`
