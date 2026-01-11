from sqlalchemy.orm import Session
from typing import List
from app.models.novel import Novel
from app.schemas.novel import NovelCreate


def get_novel(db: Session, novel_id: int) -> Novel:
    return db.query(Novel).filter(Novel.id == novel_id).first()


def get_novels(db: Session, skip: int = 0, limit: int = 100) -> List[Novel]:
    return db.query(Novel).offset(skip).limit(limit).all()


def create_novel(db: Session, novel: NovelCreate, author_id: int) -> Novel:
    db_novel = Novel(**novel.model_dump(), author_id=author_id)
    db.add(db_novel)
    db.commit()
    db.refresh(db_novel)
    return db_novel


def update_novel(db: Session, novel_id: int, novel_data: dict) -> Novel:
    db_novel = db.query(Novel).filter(Novel.id == novel_id).first()
    for key, value in novel_data.items():
        setattr(db_novel, key, value)
    db.commit()
    db.refresh(db_novel)
    return db_novel


def delete_novel(db: Session, novel_id: int) -> bool:
    db_novel = db.query(Novel).filter(Novel.id == novel_id).first()
    if db_novel:
        db.delete(db_novel)
        db.commit()
        return True
    return False
