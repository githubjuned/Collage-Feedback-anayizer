import io
import csv
import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Feedback

router = APIRouter(prefix="/export", tags=["Export"])

@router.get("/csv")
def export_feedback_csv(
    days: Optional[int] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    category_filter: Optional[str] = Query(None, alias="category"),
    department_filter: Optional[str] = Query(None, alias="department"),
    is_demo: Optional[str] = Query("all"),
    db: Session = Depends(get_db)
):
    query = db.query(Feedback)
    if days and days > 0:
        cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=days)
        query = query.filter(Feedback.created_at >= cutoff)
    
    if is_demo == "true":
        query = query.filter(Feedback.is_demo == True)
    elif is_demo == "false":
        query = query.filter(Feedback.is_demo == False)

    if status_filter and status_filter != "All":
        query = query.filter(Feedback.status == status_filter)
    if priority_filter and priority_filter != "All":
        query = query.filter(Feedback.priority == priority_filter)
    if category_filter and category_filter != "All":
        query = query.filter(Feedback.category == category_filter)
    if department_filter and department_filter != "All":
        query = query.filter(Feedback.department == department_filter)

    feedbacks = query.all()

    output = io.StringIO()
    # Write UTF-8 BOM so Excel opens Hindi, Marathi, and special characters cleanly without mojibake
    output.write('\ufeff')
    
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)
    writer.writerow([
        "ID", "Date", "Student Name", "Anonymous", "Email", "Department",
        "Year", "Rating (1-5)", "Feedback Text", "Language", "Sentiment",
        "Score (-1..1)", "Category", "Secondary Category", "Priority",
        "Urgency (0-100)", "Emotion", "Keywords", "Status", "Assignee",
        "SLA", "AI Summary", "Suggested Action", "Demo Data"
    ])

    for f in feedbacks:
        writer.writerow([
            f.id,
            f.created_at.strftime("%Y-%m-%d %H:%M") if f.created_at else "",
            f.student_name,
            "Yes" if f.anonymous else "No",
            f.email or "N/A",
            f.department,
            f.year,
            f.rating,
            f.text.replace("\n", " "),
            f.language.upper(),
            f.sentiment,
            f.score,
            f.category,
            f.secondary_category or "",
            f.priority,
            f.urgency,
            f.emotion,
            ", ".join(f.keywords),
            f.status,
            f.assignee or "Unassigned",
            f.sla,
            f.summary,
            f.suggested_action,
            "Yes" if f.is_demo else "No"
        ])

    csv_data = output.getvalue().encode("utf-8-sig")
    filename = f"campuspulse_feedback_{datetime.date.today().isoformat()}.csv"

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
