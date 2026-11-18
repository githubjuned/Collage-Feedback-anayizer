import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from app.database import get_db
from app.models import Feedback, User
from app.schemas import (
    FeedbackCreate, FeedbackOut, FeedbackAnalyzeRequest,
    AnalysisOut, StatusUpdateRequest, AssigneeUpdateRequest, AdminNotesRequest
)
from app.nlp_engine import analyze_feedback
from app.auth import get_current_user, require_admin_user
from app.seed_data import generate_seed_feedbacks

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.post("/analyze-live", response_model=AnalysisOut)
def analyze_live(req: FeedbackAnalyzeRequest):
    """Real-time live NLP analysis endpoint for student drafting in English, Hindi, and Marathi."""
    result = analyze_feedback(req.text, req.rating)
    return result

@router.post("", response_model=FeedbackOut)
def submit_feedback(
    fb_in: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Submit new student feedback with full automated AI triage, classification and routing."""
    if len(fb_in.text.strip()) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Feedback text must be at least 10 characters long"
        )
    
    # Run real NLP analysis
    analysis = analyze_feedback(fb_in.text, fb_in.rating)

    # Determine unique sequential ID (e.g. CP-1045)
    last_fb = db.query(Feedback).order_by(desc(Feedback.created_at)).first()
    max_num = 1000
    if last_fb and last_fb.id.startswith("CP-"):
        try:
            max_num = int(last_fb.id.replace("CP-", ""))
        except ValueError:
            max_num = 1000
    
    # Check max from count
    count = db.query(Feedback).count()
    next_id = f"CP-{max(max_num, 1000 + count) + 1}"

    student_name = "Anonymous" if fb_in.anonymous else (
        fb_in.student_name if fb_in.student_name and fb_in.student_name.strip()
        else (current_user.full_name if current_user else "Student")
    )
    email = None if fb_in.anonymous else (
        fb_in.email if fb_in.email
        else (current_user.email if current_user else None)
    )

    new_fb = Feedback(
        id=next_id,
        student_name=student_name,
        anonymous=fb_in.anonymous,
        email=email,
        department=fb_in.department,
        year=fb_in.year,
        rating=fb_in.rating,
        text=fb_in.text.strip(),
        language=analysis["language"],
        sentiment=analysis["sentiment"],
        score=analysis["score"],
        confidence=analysis["confidence"],
        category=analysis["category"],
        secondary_category=analysis["secondary_category"],
        priority=analysis["priority"],
        urgency=analysis["urgency"],
        emotion=analysis["emotion"],
        summary=analysis["summary"],
        suggested_action=analysis["suggested_action"],
        suggested_owner=analysis["suggested_owner"],
        sla=analysis["sla"],
        status="Open",
        assignee=analysis["suggested_owner"],
        is_demo=False,
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow()
    )
    new_fb.keywords = analysis["keywords"]
    new_fb.reasons = analysis["reasons"]

    db.add(new_fb)
    db.commit()
    db.refresh(new_fb)
    return new_fb

@router.get("", response_model=List[FeedbackOut])
def list_feedback(
    status_filter: Optional[str] = Query(None, alias="status"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    category_filter: Optional[str] = Query(None, alias="category"),
    department_filter: Optional[str] = Query(None, alias="department"),
    language_filter: Optional[str] = Query(None, alias="language"),
    is_demo: Optional[str] = Query("all"),  # "all", "true", "false"
    search: Optional[str] = Query(None),
    days: Optional[int] = Query(None),
    sort: Optional[str] = Query("priority"),
    db: Session = Depends(get_db)
):
    query = db.query(Feedback)

    # Date filter
    if days and days > 0:
        cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=days)
        query = query.filter(Feedback.created_at >= cutoff)

    # Demo separation filter
    if is_demo == "true":
        query = query.filter(Feedback.is_demo == True)
    elif is_demo == "false":
        query = query.filter(Feedback.is_demo == False)

    # Status filter
    if status_filter and status_filter != "All":
        query = query.filter(Feedback.status == status_filter)

    # Priority filter
    if priority_filter and priority_filter != "All":
        query = query.filter(Feedback.priority == priority_filter)

    # Category filter
    if category_filter and category_filter != "All":
        query = query.filter(Feedback.category == category_filter)

    # Department filter
    if department_filter and department_filter != "All":
        query = query.filter(Feedback.department == department_filter)

    # Language filter
    if language_filter and language_filter != "All":
        query = query.filter(Feedback.language == language_filter)

    # Search filter
    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                Feedback.id.ilike(term),
                Feedback.text.ilike(term),
                Feedback.summary.ilike(term),
                Feedback.student_name.ilike(term),
                Feedback.keywords_json.ilike(term),
                Feedback.suggested_owner.ilike(term)
            )
        )

    # Sort
    if sort == "newest":
        query = query.order_by(desc(Feedback.created_at))
    elif sort == "oldest":
        query = query.order_by(asc(Feedback.created_at))
    elif sort == "urgency":
        query = query.order_by(desc(Feedback.urgency))
    else:  # priority rank
        # Custom priority ranking: Critical > High > Medium > Low
        # We can fetch and sort or use a case statement
        results = query.all()
        rank_map = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
        results.sort(key=lambda f: (rank_map.get(f.priority, 4), -f.urgency, -(f.created_at.timestamp() if f.created_at else 0)))
        return results

    return query.all()

@router.get("/{feedback_id}", response_model=FeedbackOut)
def get_feedback_detail(feedback_id: str, db: Session = Depends(get_db)):
    fb = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return fb

@router.patch("/{feedback_id}/status", response_model=FeedbackOut)
def update_feedback_status(
    feedback_id: str,
    body: StatusUpdateRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_user)
):
    fb = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    if body.status not in ["Open", "In Progress", "Resolved"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    fb.status = body.status
    fb.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(fb)
    return fb

@router.patch("/{feedback_id}/assignee", response_model=FeedbackOut)
def update_feedback_assignee(
    feedback_id: str,
    body: AssigneeUpdateRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_user)
):
    fb = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    fb.assignee = body.assignee
    fb.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(fb)
    return fb

@router.post("/{feedback_id}/notes", response_model=FeedbackOut)
def add_admin_notes(
    feedback_id: str,
    body: AdminNotesRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_user)
):
    fb = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    fb.admin_notes = body.notes
    fb.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(fb)
    return fb

@router.post("/seed-demo")
def reseed_demo_data(db: Session = Depends(get_db)):
    """Reset and re-populate with multilingual demo seed data."""
    db.query(Feedback).filter(Feedback.is_demo == True).delete()
    seeds = generate_seed_feedbacks()
    db.add_all(seeds)
    db.commit()
    return {"message": "Demo data reseeded successfully", "count": len(seeds)}

@router.delete("/demo")
def clear_demo_data(db: Session = Depends(get_db), admin: User = Depends(require_admin_user)):
    """Remove demo seed items, leaving only real student submissions."""
    deleted_count = db.query(Feedback).filter(Feedback.is_demo == True).delete()
    db.commit()
    return {"message": "Demo data removed successfully", "deleted": deleted_count}
