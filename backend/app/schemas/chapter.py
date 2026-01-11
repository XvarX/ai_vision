from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from app.models.chapter import BranchType


class ChapterBase(BaseModel):
    title: str
    content: str


class ChapterCreate(ChapterBase):
    chapter_number: int
    parent_chapter_id: Optional[int] = None
    branch_type: BranchType = BranchType.MAIN


class ChapterUpdate(ChapterBase):
    pass


class Chapter(ChapterBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    novel_id: int
    chapter_number: int
    parent_chapter_id: Optional[int]
    branch_type: BranchType
    author_id: int
    created_at: datetime
    updated_at: datetime


class ChapterResponse(Chapter):
    author_username: Optional[str] = None
    parent_chapter_title: Optional[str] = None
