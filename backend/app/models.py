import datetime
import json
from sqlalchemy import Column, Integer, String, Boolean, Float, Text, DateTime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="student", nullable=False)  # "admin" or "student"
    department = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(String(50), primary_key=True, index=True)
    student_name = Column(String(255), nullable=False)
    anonymous = Column(Boolean, default=False)
    email = Column(String(255), nullable=True)
    department = Column(String(100), nullable=False)
    year = Column(Integer, default=1)
    rating = Column(Integer, default=3)
    text = Column(Text, nullable=False)
    
    # AI / NLP extracted fields
    language = Column(String(20), default="en")
    sentiment = Column(String(50), nullable=False)  # Positive, Neutral, Negative
    score = Column(Float, nullable=False)           # -1.0 .. 1.0
    confidence = Column(Float, nullable=False)      # 0.0 .. 1.0
    category = Column(String(100), nullable=False)
    secondary_category = Column(String(100), nullable=True)
    priority = Column(String(50), nullable=False)   # Critical, High, Medium, Low
    urgency = Column(Integer, nullable=False)       # 0 .. 100
    emotion = Column(String(100), nullable=False)
    keywords_json = Column(Text, default="[]")      # JSON serialized list
    summary = Column(Text, nullable=False)
    reasons_json = Column(Text, default="[]")       # JSON serialized list
    suggested_action = Column(Text, nullable=False)
    suggested_owner = Column(String(255), nullable=False)
    sla = Column(String(100), nullable=False)
    
    # Workflow fields
    status = Column(String(50), default="Open")     # Open, In Progress, Resolved
    assignee = Column(String(255), nullable=True)
    admin_notes = Column(Text, nullable=True)
    is_demo = Column(Boolean, default=False)        # Separate demo seed from real submissions
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    @property
    def keywords(self):
        try:
            return json.loads(self.keywords_json) if self.keywords_json else []
        except Exception:
            return []

    @keywords.setter
    def keywords(self, val):
        self.keywords_json = json.dumps(val or [])

    @property
    def reasons(self):
        try:
            return json.loads(self.reasons_json) if self.reasons_json else []
        except Exception:
            return []

    @reasons.setter
    def reasons(self, val):
        self.reasons_json = json.dumps(val or [])
