from sqlalchemy.orm import Session
from typing import List
from app.models.chapter import Chapter, BranchType
from app.schemas.chapter import ChapterCreate


def get_chapter(db: Session, chapter_id: int) -> Chapter:
    return db.query(Chapter).filter(Chapter.id == chapter_id).first()


def get_chapters_by_novel(db: Session, novel_id: int, skip: int = 0, limit: int = 100) -> List[Chapter]:
    return db.query(Chapter).filter(Chapter.novel_id == novel_id).offset(skip).limit(limit).all()


def get_main_chapters(db: Session, novel_id: int) -> List[Chapter]:
    return db.query(Chapter).filter(
        Chapter.novel_id == novel_id,
        Chapter.branch_type == BranchType.MAIN
    ).order_by(Chapter.chapter_number).all()


def create_chapter(db: Session, chapter: ChapterCreate, novel_id: int, author_id: int) -> Chapter:
    db_chapter = Chapter(**chapter.model_dump(), novel_id=novel_id, author_id=author_id)
    db.add(db_chapter)
    db.commit()
    db.refresh(db_chapter)
    return db_chapter


def update_chapter(db: Session, chapter_id: int, chapter_data: dict) -> Chapter:
    db_chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    for key, value in chapter_data.items():
        setattr(db_chapter, key, value)
    db.commit()
    db.refresh(db_chapter)
    return db_chapter


def delete_chapter(db: Session, chapter_id: int) -> bool:
    db_chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if db_chapter:
        db.delete(db_chapter)
        db.commit()
        return True
    return False


def fork_chapter(db: Session, chapter_id: int, author_id: int, title: str, content: str) -> Chapter:
    original_chapter = get_chapter(db, chapter_id)
    db_chapter = Chapter(
        novel_id=original_chapter.novel_id,
        title=title,
        content=content,
        chapter_number=original_chapter.chapter_number,
        parent_chapter_id=chapter_id,
        branch_type=BranchType.FORK,
        author_id=author_id
    )
    db.add(db_chapter)
    db.commit()
    db.refresh(db_chapter)
    return db_chapter


def get_fork_chapters(db: Session, parent_chapter_id: int) -> List[Chapter]:
    """Get all fork chapters of a parent chapter (excluding merged ones)"""
    return db.query(Chapter).filter(
        Chapter.parent_chapter_id == parent_chapter_id,
        Chapter.branch_type == BranchType.FORK
    ).all()


def get_merged_chapters(db: Session, novel_id: int) -> List[Chapter]:
    """Get all merged chapters for a novel"""
    return db.query(Chapter).filter(
        Chapter.novel_id == novel_id,
        Chapter.branch_type == BranchType.MERGED
    ).order_by(Chapter.chapter_number).all()


def get_merged_chapters_for_parent(db: Session, parent_chapter_id: int) -> List[Chapter]:
    """Get all merged chapters that were forked from a specific parent chapter"""
    return db.query(Chapter).filter(
        Chapter.parent_chapter_id == parent_chapter_id,
        Chapter.branch_type == BranchType.MERGED
    ).all()
