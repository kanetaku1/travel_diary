from fastapi import APIRouter, Depends, HTTPException, UploadFile, Form, Query
from sqlalchemy.orm import Session
from database import SessionLocal
from models import DiaryEntry, Photo, Tag
from routes.photos import save_file
from typing import List
import os

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
async def create_diary_entry(
    title: str = Form(...),
    content: str = Form(...),
    created_at: str = Form(...),
    tags: List[str] = Form([]),
    files: List[UploadFile] = Form([]),
    db: Session = Depends(get_db)
):
    # 日記エントリを作成
    entry = DiaryEntry(title=title, content=content, created_at=created_at)
    db.add(entry)
    db.commit()
    db.refresh(entry)

    # タグを登録
    for tag_name in tags:
        tag = db.query(Tag).filter(Tag.name == tag_name).first()
        if not tag:
            tag = Tag(name=tag_name)
            db.add(tag)
        entry.tags.append(tag)

    # ファイルがある場合は保存
    if files:
        for file in files:
            file_path = await save_file(file)
            new_photo = Photo(diary_entry_id=entry.id, file_url=file_path)
            db.add(new_photo)
    db.commit()
    db.refresh(entry)
    return entry

@router.get("/")
def get_all_diary_entries(db: Session = Depends(get_db)):
    entries = db.query(DiaryEntry).all()
    return [{
        "id": entry.id,
        "title": entry.title,
        "content": entry.content,
        "created_at": entry.created_at,
        "photos": [{"id": photo.id, "file_url": photo.file_url} for photo in entry.photos],
        "tags": [tag.name for tag in entry.tags],
    } for entry in entries
]

# 詳細取得エンドポイント
@router.get("/{id}")
def get_diary_entry(id: int, db: Session = Depends(get_db)):
    entry = db.query(DiaryEntry).filter(DiaryEntry.id == id).first()
    if entry is None:
        raise HTTPException(status_code=404, detail="Diary entry not found")

    return {
        "id": entry.id,
        "title": entry.title,
        "content": entry.content,
        "created_at": entry.created_at,
        "photos": [{"id": photo.id, "file_url": photo.file_url} for photo in entry.photos],
        "tags": [tag.name for tag in entry.tags]
    }

@router.put("/{id}")
async def update_diary_entry(
    id: int,
    title: str = Form(...),
    content: str = Form(...),
    created_at: str = Form(...),
    tags: List[str] = Form([]),
    files: List[UploadFile] = Form([]),
    delete_files: List[int] = Form([]),
    db: Session = Depends(get_db)
):
    entry = db.query(DiaryEntry).filter(DiaryEntry.id == id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Diary entry not found")

    # ファイル削除フラグが立っている場合、関連する写真も削除
    for file_id in delete_files:
        file = db.query(Photo).filter(Photo.id == file_id).first()
        if os.path.exists(file.file_url):
            os.remove(file.file_url)
        db.delete(file)

    # ファイルのアップロード
    if files:
        for file in files:
            file_path = await save_file(file)
            new_photo = Photo(diary_entry_id=id, file_url=file_path)
            db.add(new_photo)

    entry.tags = []
    db.commit()

    # 新しいタグを設定
    for tag_name in tags:
        tag = db.query(Tag).filter(Tag.name == tag_name).first()
        if not tag:
            tag = Tag(name=tag_name)
            db.add(tag)
        entry.tags.append(tag)
    
    entry.title = title
    entry.content = content
    entry.created_at = created_at

    db.commit()
    db.refresh(entry)
    return entry

@router.get("/tags/")
def get_tags(db: Session = Depends(get_db)):
    tags = db.query(Tag).all()
    return [tag.name for tag in tags]

@router.get("/search/")
def search_diary_by_tags(
    tags: List[str] = Query(...),
    db: Session = Depends(get_db)
):
    matched_entries = (
        db.query(DiaryEntry)
        .join(DiaryEntry.tags)
        .filter(Tag.name.in_(tags))
        .all()
    )

    return [
        {
            "id": entry.id,
            "title": entry.title,
            "content": entry.content,
            "created_at": entry.created_at,
            "tags": [tag.name for tag in entry.tags],
        } for entry in matched_entries
    ]