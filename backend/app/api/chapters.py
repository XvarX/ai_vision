from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.chapter import Chapter, ChapterCreate, ChapterUpdate, ChapterResponse
from app.schemas.user import User
from app.crud.chapter import (
    get_chapter, get_chapters_by_novel, get_main_chapters,
    create_chapter, update_chapter, delete_chapter, fork_chapter,
    get_fork_chapters, get_merged_chapters, get_merged_chapters_for_parent
)

router = APIRouter()


@router.get("/novels/{novel_id}/chapters", response_model=List[ChapterResponse])
def read_novel_chapters(novel_id: int, db: Session = Depends(get_db)):
    chapters = get_chapters_by_novel(db, novel_id=novel_id)
    # Add author username and parent chapter title
    result = []
    for chapter in chapters:
        chapter_dict = ChapterResponse.model_validate(chapter).model_dump()
        chapter_dict["author_username"] = chapter.author.username
        if chapter.parent_chapter:
            chapter_dict["parent_chapter_title"] = chapter.parent_chapter.title
        result.append(ChapterResponse(**chapter_dict))
    return result


@router.get("/novels/{novel_id}/chapters/main", response_model=List[ChapterResponse])
def read_main_chapters(novel_id: int, db: Session = Depends(get_db)):
    chapters = get_main_chapters(db, novel_id=novel_id)
    result = []
    for chapter in chapters:
        chapter_dict = ChapterResponse.model_validate(chapter).model_dump()
        chapter_dict["author_username"] = chapter.author.username
        result.append(ChapterResponse(**chapter_dict))
    return result


@router.post("/novels/{novel_id}/chapters", response_model=Chapter)
def create_chapter_endpoint(
    novel_id: int,
    chapter: ChapterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_chapter(db=db, chapter=chapter, novel_id=novel_id, author_id=current_user.id)


@router.get("/chapters/{chapter_id}", response_model=ChapterResponse)
def read_chapter(chapter_id: int, db: Session = Depends(get_db)):
    chapter = get_chapter(db, chapter_id=chapter_id)
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    chapter_dict = ChapterResponse.model_validate(chapter).model_dump()
    chapter_dict["author_username"] = chapter.author.username
    if chapter.parent_chapter:
        chapter_dict["parent_chapter_title"] = chapter.parent_chapter.title
    return ChapterResponse(**chapter_dict)


@router.put("/chapters/{chapter_id}", response_model=Chapter)
def update_chapter_endpoint(
    chapter_id: int,
    chapter: ChapterUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_chapter = get_chapter(db, chapter_id=chapter_id)
    if not db_chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    if db_chapter.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this chapter")
    return update_chapter(db, chapter_id, chapter.model_dump())


@router.delete("/chapters/{chapter_id}")
def delete_chapter_endpoint(
    chapter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_chapter = get_chapter(db, chapter_id=chapter_id)
    if not db_chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    if db_chapter.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this chapter")
    delete_chapter(db, chapter_id)
    return {"message": "Chapter deleted successfully"}


@router.post("/chapters/{chapter_id}/fork", response_model=Chapter)
def fork_chapter_endpoint(
    chapter_id: int,
    title: str,
    content: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_chapter = get_chapter(db, chapter_id=chapter_id)
    if not db_chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return fork_chapter(db, chapter_id, current_user.id, title, content)


@router.get("/chapters/{chapter_id}/forks", response_model=List[ChapterResponse])
def read_fork_chapters(chapter_id: int, db: Session = Depends(get_db)):
    """Get all fork chapters of a parent chapter (unmerged)"""
    parent_chapter = get_chapter(db, chapter_id=chapter_id)
    if not parent_chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    chapters = get_fork_chapters(db, parent_chapter_id=chapter_id)
    result = []
    for chapter in chapters:
        chapter_dict = ChapterResponse.model_validate(chapter).model_dump()
        chapter_dict["author_username"] = chapter.author.username
        chapter_dict["parent_chapter_title"] = parent_chapter.title
        result.append(ChapterResponse(**chapter_dict))
    return result


@router.get("/novels/{novel_id}/chapters/merged", response_model=List[ChapterResponse])
def read_merged_chapters(novel_id: int, db: Session = Depends(get_db)):
    """Get all merged chapters for a novel"""
    chapters = get_merged_chapters(db, novel_id=novel_id)
    result = []
    for chapter in chapters:
        chapter_dict = ChapterResponse.model_validate(chapter).model_dump()
        chapter_dict["author_username"] = chapter.author.username
        if chapter.parent_chapter:
            chapter_dict["parent_chapter_title"] = chapter.parent_chapter.title
        result.append(ChapterResponse(**chapter_dict))
    return result


@router.get("/chapters/{chapter_id}/merged", response_model=List[ChapterResponse])
def read_merged_chapters_for_parent(chapter_id: int, db: Session = Depends(get_db)):
    """Get all merged chapters that were forked from this parent chapter"""
    parent_chapter = get_chapter(db, chapter_id=chapter_id)
    if not parent_chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    chapters = get_merged_chapters_for_parent(db, parent_chapter_id=chapter_id)
    result = []
    for chapter in chapters:
        chapter_dict = ChapterResponse.model_validate(chapter).model_dump()
        chapter_dict["author_username"] = chapter.author.username
        chapter_dict["parent_chapter_title"] = parent_chapter.title
        result.append(ChapterResponse(**chapter_dict))
    return result
