from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.novel import Novel, NovelCreate, NovelUpdate
from app.schemas.user import User
from app.crud.novel import get_novel, get_novels, create_novel, update_novel, delete_novel

router = APIRouter()


@router.get("", response_model=List[Novel])
def read_novels(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    novels = get_novels(db, skip=skip, limit=limit)
    return novels


@router.post("", response_model=Novel)
def create_novel_endpoint(
    novel: NovelCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_novel(db=db, novel=novel, author_id=current_user.id)


@router.get("/{novel_id}", response_model=Novel)
def read_novel(novel_id: int, db: Session = Depends(get_db)):
    novel = get_novel(db, novel_id=novel_id)
    if not novel:
        raise HTTPException(status_code=404, detail="Novel not found")
    return novel


@router.put("/{novel_id}", response_model=Novel)
def update_novel_endpoint(
    novel_id: int,
    novel: NovelUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_novel = get_novel(db, novel_id=novel_id)
    if not db_novel:
        raise HTTPException(status_code=404, detail="Novel not found")
    if db_novel.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this novel")
    return update_novel(db, novel_id, novel.model_dump(exclude_unset=True))


@router.delete("/{novel_id}")
def delete_novel_endpoint(
    novel_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_novel = get_novel(db, novel_id=novel_id)
    if not db_novel:
        raise HTTPException(status_code=404, detail="Novel not found")
    if db_novel.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this novel")
    delete_novel(db, novel_id)
    return {"message": "Novel deleted successfully"}
