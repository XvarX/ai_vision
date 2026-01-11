from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(200), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    novels = relationship("Novel", back_populates="author", cascade="all, delete-orphan")
    chapters = relationship("Chapter", back_populates="author")
    merge_requests = relationship("MergeRequest", foreign_keys="MergeRequest.requested_by", back_populates="requester")
