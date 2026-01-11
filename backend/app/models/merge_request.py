from datetime import datetime
import enum
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class MergeStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class MergeRequest(Base):
    __tablename__ = "merge_requests"

    id = Column(Integer, primary_key=True, index=True)
    from_chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=False)
    to_novel_id = Column(Integer, ForeignKey("novels.id"), nullable=False)
    status = Column(Enum(MergeStatus), default=MergeStatus.PENDING, nullable=False)
    requested_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    review_comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)

    # Relationships
    novel = relationship("Novel", back_populates="merge_requests")
    requester = relationship("User", foreign_keys=[requested_by], back_populates="merge_requests")
    from_chapter = relationship("Chapter", foreign_keys=[from_chapter_id])
