import datetime
from typing import List, Optional
from pydantic import BaseModel

# Auth Schemas
class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    role: Optional[str] = "student"
    department: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    department: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Feedback Schemas
class FeedbackCreate(BaseModel):
    student_name: Optional[str] = "Student"
    anonymous: bool = False
    email: Optional[str] = None
    department: str
    year: int = 1
    rating: int = 3
    text: str

class FeedbackAnalyzeRequest(BaseModel):
    text: str
    rating: Optional[int] = None

class AnalysisOut(BaseModel):
    language: str
    sentiment: str
    score: float
    confidence: float
    category: str
    secondary_category: Optional[str] = None
    priority: str
    urgency: int
    emotion: str
    keywords: List[str]
    summary: str
    reasons: List[str]
    suggested_action: str
    suggested_owner: str
    sla: str

class FeedbackOut(AnalysisOut):
    id: str
    student_name: str
    anonymous: bool
    email: Optional[str] = None
    department: str
    year: int
    rating: int
    text: str
    status: str
    assignee: Optional[str] = None
    admin_notes: Optional[str] = None
    is_demo: bool
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class StatusUpdateRequest(BaseModel):
    status: str

class AssigneeUpdateRequest(BaseModel):
    assignee: str

class AdminNotesRequest(BaseModel):
    notes: str
