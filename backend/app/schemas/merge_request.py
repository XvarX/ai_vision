from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from app.models.merge_request import MergeStatus


class MergeRequestBase(BaseModel):
    from_chapter_id: int
    review_comment: Optional[str] = None


class MergeRequestCreate(MergeRequestBase):
    pass


class MergeRequestUpdate(BaseModel):
    status: MergeStatus
    review_comment: Optional[str] = None


class MergeRequest(MergeRequestBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    to_novel_id: int
    status: MergeStatus
    requested_by: int
    created_at: datetime
    reviewed_at: Optional[datetime]
    from_chapter_title: Optional[str] = None
    requester_username: Optional[str] = None
