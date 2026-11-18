import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Feedback

router = APIRouter(prefix="/analytics", tags=["Analytics"])

def sentiment_index(avg_score: float) -> int:
    return int(round(((avg_score + 1) / 2) * 100))

@router.get("/overview")
def get_analytics_overview(
    days: Optional[int] = Query(None),
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

    feedbacks = query.all()
    total = len(feedbacks)
    
    if not total:
        return {
            "total": 0,
            "avgScore": 0,
            "sentimentIndex": 50,
            "avgRating": 0.0,
            "openCritical": 0,
            "open": 0,
            "inProgress": 0,
            "resolved": 0,
            "resolutionRate": 100,
            "sentimentSplit": [
                {"name": "Positive", "value": 0, "color": "#10b981"},
                {"name": "Neutral", "value": 0, "color": "#94a3b8"},
                {"name": "Negative", "value": 0, "color": "#f43f5e"}
            ],
            "languageSplit": {"en": 0, "hi": 0, "mr": 0}
        }

    positive_count = sum(1 for f in feedbacks if f.sentiment == "Positive")
    neutral_count = sum(1 for f in feedbacks if f.sentiment == "Neutral")
    negative_count = sum(1 for f in feedbacks if f.sentiment == "Negative")
    
    avg_score = sum(f.score for f in feedbacks) / total
    avg_rating = sum(f.rating for f in feedbacks) / total
    
    actionable = [f for f in feedbacks if f.sentiment != "Positive"]
    resolved_count = sum(1 for f in actionable if f.status == "Resolved")
    open_count = sum(1 for f in feedbacks if f.status == "Open")
    in_prog_count = sum(1 for f in feedbacks if f.status == "In Progress")
    open_critical = sum(1 for f in feedbacks if f.priority == "Critical" and f.status != "Resolved")
    
    res_rate = int(round((resolved_count / max(1, len(actionable))) * 100)) if actionable else 100

    lang_counts = {"en": 0, "hi": 0, "mr": 0}
    for f in feedbacks:
        l = f.language if f.language in lang_counts else "en"
        lang_counts[l] += 1

    return {
        "total": total,
        "avgScore": round(avg_score, 2),
        "sentimentIndex": sentiment_index(avg_score),
        "avgRating": round(avg_rating, 1),
        "openCritical": open_critical,
        "open": open_count,
        "inProgress": in_prog_count,
        "resolved": resolved_count,
        "resolutionRate": res_rate,
        "sentimentSplit": [
            {"name": "Positive", "value": positive_count, "color": "#10b981"},
            {"name": "Neutral", "value": neutral_count, "color": "#94a3b8"},
            {"name": "Negative", "value": negative_count, "color": "#f43f5e"}
        ],
        "languageSplit": lang_counts
    }

@router.get("/weekly-trend")
def get_weekly_trend(
    weeks: int = Query(12),
    is_demo: Optional[str] = Query("all"),
    db: Session = Depends(get_db)
):
    query = db.query(Feedback)
    if is_demo == "true":
        query = query.filter(Feedback.is_demo == True)
    elif is_demo == "false":
        query = query.filter(Feedback.is_demo == False)

    feedbacks = query.all()
    now = datetime.datetime.utcnow()
    one_week = datetime.timedelta(days=7)

    buckets = []
    for i in range(weeks):
        start = now - ((weeks - i) * one_week)
        end = start + one_week
        buckets.append({
            "label": start.strftime("%b %d"),
            "start": start,
            "end": end,
            "Positive": 0,
            "Neutral": 0,
            "Negative": 0,
            "total": 0,
            "sumScore": 0.0
        })

    for f in feedbacks:
        if not f.created_at:
            continue
        for b in buckets:
            if b["start"] <= f.created_at < b["end"]:
                b[f.sentiment] += 1
                b["total"] += 1
                b["sumScore"] += f.score
                break

    results = []
    for b in buckets:
        avg = b["sumScore"] / b["total"] if b["total"] > 0 else 0
        results.append({
            "label": b["label"],
            "Positive": b["Positive"],
            "Neutral": b["Neutral"],
            "Negative": b["Negative"],
            "total": b["total"],
            "index": sentiment_index(avg) if b["total"] > 0 else None
        })
    return results

@router.get("/departments")
def get_department_scorecard(
    days: Optional[int] = Query(None),
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

    feedbacks = query.all()
    from app.seed_data import DEPARTMENTS

    results = []
    for dept in DEPARTMENTS:
        items = [f for f in feedbacks if f.department == dept]
        total = len(items)
        if not total:
            results.append({
                "department": dept,
                "total": 0,
                "index": 50,
                "positive": 0,
                "neutral": 0,
                "negative": 0,
                "critical": 0,
                "resolutionRate": 100,
                "topIssue": "None reported"
            })
            continue

        pos = sum(1 for f in items if f.sentiment == "Positive")
        neu = sum(1 for f in items if f.sentiment == "Neutral")
        neg = sum(1 for f in items if f.sentiment == "Negative")
        crit = sum(1 for f in items if f.priority == "Critical" and f.status != "Resolved")
        
        actionable = [f for f in items if f.sentiment != "Positive"]
        res = sum(1 for f in actionable if f.status == "Resolved")
        res_rate = int(round((res / max(1, len(actionable))) * 100)) if actionable else 100

        avg = sum(f.score for f in items) / total
        
        # Most frequent category among negatives
        neg_items = [f for f in items if f.sentiment == "Negative"]
        top_issue = neg_items[0].category if neg_items else "General"

        results.append({
            "department": dept,
            "total": total,
            "index": sentiment_index(avg),
            "positive": pos,
            "neutral": neu,
            "negative": neg,
            "critical": crit,
            "resolutionRate": res_rate,
            "topIssue": top_issue
        })

    results.sort(key=lambda x: x["index"], reverse=True)
    return results
