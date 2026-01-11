from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.merge_request import MergeRequest, MergeRequestCreate, MergeRequestUpdate
from app.schemas.user import User
from app.crud.merge_request import (
    get_merge_request, get_merge_requests_by_novel,
    create_merge_request, approve_merge_request, reject_merge_request,
    get_pending_merge_request_for_chapter
)
from app.crud.novel import get_novel
from app.crud.chapter import get_chapter
from app.models.chapter import BranchType
from app.models.merge_request import MergeStatus

router = APIRouter()


class CheckSubmissionResponse(BaseModel):
    can_submit: bool
    reason: str | None = None


@router.get("/novels/{novel_id}/merge-requests", response_model=List[MergeRequest])
def read_merge_requests(novel_id: int, db: Session = Depends(get_db)):
    mrs = get_merge_requests_by_novel(db, novel_id=novel_id)
    # Add chapter title and requester username
    result = []
    for mr in mrs:
        mr_dict = MergeRequest.model_validate(mr).model_dump()
        from_chapter = get_chapter(db, mr.from_chapter_id)
        if from_chapter:
            mr_dict["from_chapter_title"] = from_chapter.title
        mr_dict["requester_username"] = mr.requester.username
        result.append(MergeRequest(**mr_dict))
    return result


@router.post("/novels/{novel_id}/merge-requests", response_model=MergeRequest)
def create_merge_request_endpoint(
    novel_id: int,
    mr: MergeRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    novel = get_novel(db, novel_id=novel_id)
    if not novel:
        raise HTTPException(status_code=404, detail="Novel not found")

    # Get the chapter to verify ownership
    from_chapter = get_chapter(db, chapter_id=mr.from_chapter_id)
    if not from_chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    # Only the fork chapter author can submit
    if from_chapter.author_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="只有分支作者才能提交分支"
        )

    # Check if there's already a pending or approved merge request for this chapter
    existing_mr = get_pending_merge_request_for_chapter(db, chapter_id=mr.from_chapter_id)
    if existing_mr:
        if existing_mr.status == MergeStatus.PENDING:
            raise HTTPException(
                status_code=400,
                detail="该分支已经提交，等待审核中"
            )
        elif existing_mr.status == MergeStatus.APPROVED:
            raise HTTPException(
                status_code=400,
                detail="该分支已被接纳"
            )

    return create_merge_request(db=db, mr=mr, novel_id=novel_id, requested_by=current_user.id)


@router.put("/merge-requests/{mr_id}/approve", response_model=MergeRequest)
def approve_merge_request_endpoint(
    mr_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    mr = get_merge_request(db, mr_id=mr_id)
    if not mr:
        raise HTTPException(status_code=404, detail="Merge request not found")

    novel = get_novel(db, novel_id=mr.to_novel_id)
    if novel.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only novel author can approve merge requests")

    approved_mr = approve_merge_request(db, mr_id)

    # Update the forked chapter to MERGED status
    from app.crud.chapter import get_chapter, update_chapter
    chapter = get_chapter(db, chapter_id=approved_mr.from_chapter_id)
    if chapter:
        update_chapter(db, chapter.id, {"branch_type": BranchType.MERGED})

    return approved_mr


@router.put("/merge-requests/{mr_id}/reject", response_model=MergeRequest)
def reject_merge_request_endpoint(
    mr_id: int,
    review_comment: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    mr = get_merge_request(db, mr_id=mr_id)
    if not mr:
        raise HTTPException(status_code=404, detail="Merge request not found")

    novel = get_novel(db, novel_id=mr.to_novel_id)
    if novel.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only novel author can reject merge requests")

    return reject_merge_request(db, mr_id, review_comment)


@router.get("/chapters/{chapter_id}/can-submit", response_model=CheckSubmissionResponse)
def check_can_submit(
    chapter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if the current user can submit this chapter for review"""
    chapter = get_chapter(db, chapter_id=chapter_id)
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    # Only fork chapters can be submitted
    if chapter.branch_type != BranchType.FORK:
        return CheckSubmissionResponse(
            can_submit=False,
            reason="只有分支章节才能提交"
        )

    # Only the author can submit
    if chapter.author_id != current_user.id:
        return CheckSubmissionResponse(
            can_submit=False,
            reason="只有分支作者才能提交分支"
        )

    # Check if there's already a pending or approved merge request
    existing_mr = get_pending_merge_request_for_chapter(db, chapter_id=chapter_id)
    if existing_mr:
        if existing_mr.status == MergeStatus.PENDING:
            return CheckSubmissionResponse(
                can_submit=False,
                reason="该分支已经提交，等待审核中"
            )
        elif existing_mr.status == MergeStatus.APPROVED:
            return CheckSubmissionResponse(
                can_submit=False,
                reason="该分支已被接纳"
            )

    return CheckSubmissionResponse(can_submit=True)
