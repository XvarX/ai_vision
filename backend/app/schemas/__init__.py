from app.schemas.user import User, UserCreate, UserLogin, Token
from app.schemas.novel import Novel, NovelCreate, NovelUpdate
from app.schemas.chapter import Chapter, ChapterCreate, ChapterUpdate, ChapterResponse
from app.schemas.merge_request import MergeRequest, MergeRequestCreate, MergeRequestUpdate

__all__ = [
    "User", "UserCreate", "UserLogin", "Token",
    "Novel", "NovelCreate", "NovelUpdate",
    "Chapter", "ChapterCreate", "ChapterUpdate", "ChapterResponse",
    "MergeRequest", "MergeRequestCreate", "MergeRequestUpdate",
]
