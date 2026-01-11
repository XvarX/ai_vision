from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.models.merge_request import MergeRequest, MergeStatus
from app.schemas.merge_request import MergeRequestCreate


def get_merge_request(db: Session, mr_id: int) -> MergeRequest:
    return db.query(MergeRequest).filter(MergeRequest.id == mr_id).first()


def get_merge_requests_by_novel(db: Session, novel_id: int, skip: int = 0, limit: int = 100) -> List[MergeRequest]:
    return db.query(MergeRequest).filter(
        MergeRequest.to_novel_id == novel_id
    ).offset(skip).limit(limit).all()


def get_pending_merge_request_for_chapter(db: Session, chapter_id: int) -> MergeRequest:
    """Get any merge request (pending or approved) for a specific chapter"""
    return db.query(MergeRequest).filter(
        MergeRequest.from_chapter_id == chapter_id,
        MergeRequest.status.in_([MergeStatus.PENDING, MergeStatus.APPROVED])
    ).first()


def create_merge_request(db: Session, mr: MergeRequestCreate, novel_id: int, requested_by: int) -> MergeRequest:
    db_mr = MergeRequest(**mr.model_dump(), to_novel_id=novel_id, requested_by=requested_by)
    db.add(db_mr)
    db.commit()
    db.refresh(db_mr)
    return db_mr


def approve_merge_request(db: Session, mr_id: int) -> MergeRequest:
    db_mr = db.query(MergeRequest).filter(MergeRequest.id == mr_id).first()
    db_mr.status = MergeStatus.APPROVED
    db_mr.reviewed_at = datetime.utcnow()
    db.commit()
    db.refresh(db_mr)
    return db_mr


def reject_merge_request(db: Session, mr_id: int, review_comment: str = None) -> MergeRequest:
    db_mr = db.query(MergeRequest).filter(MergeRequest.id == mr_id).first()
    db_mr.status = MergeStatus.REJECTED
    db_mr.reviewed_at = datetime.utcnow()
    if review_comment:
        db_mr.review_comment = review_comment
    db.commit()
    db.refresh(db_mr)
    return db_mr
