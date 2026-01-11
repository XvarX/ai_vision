from datetime import datetime
import enum
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class BranchType(str, enum.Enum):
    MAIN = "main"
    FORK = "fork"
    MERGED = "merged"


class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(Integer, primary_key=True, index=True)
    novel_id = Column(Integer, ForeignKey("novels.id"), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    chapter_number = Column(Integer, nullable=False)
    parent_chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=True)
    branch_type = Column(Enum(BranchType), default=BranchType.MAIN, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    novel = relationship("Novel", back_populates="chapters")
    author = relationship("User", back_populates="chapters")
    parent_chapter = relationship("Chapter", remote_side=[id], backref="forked_chapters")
