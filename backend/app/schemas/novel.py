from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class NovelBase(BaseModel):
    title: str
    description: Optional[str] = None


class NovelCreate(NovelBase):
    pass


class NovelUpdate(NovelBase):
    pass


class Novel(NovelBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    author_id: int
    created_at: datetime
    updated_at: datetime
