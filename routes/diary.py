from fastapi import APIRouter, Depends, HTTPException, UploadFile, Form, Query
from sqlalchemy.orm import Session
from database import SessionLocal
from models import DiaryEntry, Photo, Tag
from routes.photos import save_file
from typing import List
import os

UPLOAD_DIR = "uploads"

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
    file: UploadFile = None,
    db: Session = Depends(get_db)
):
    # 日記エントリを作成
    db_entry = DiaryEntry(title=title, content=content, created_at=created_at)
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)

    # タグを登録
    for tag_name in tags:
        tag = db.query(Tag).filter(Tag.name == tag_name).first()
        if not tag:
            tag = Tag(name=tag_name)
            db.add(tag)
        db_entry.tags.append(tag)
    db.commit()
    db.refresh(db_entry)
    # ファイルがある場合は保存
    if file:
        file_path = await save_file(file)  # routes/photos.py の関数を呼び出す
        if file_path:
            # DiaryEntry の file_url に保存
            db_entry.file_url = file_path
            # Photo モデルにも保存
            photo = Photo(diary_id=db_entry.id, file_path=file_path)
            db.add(photo)
            db.commit()
            db.refresh(photo)
            db.refresh(db_entry)
    return db_entry

@router.get("/")
def get_all_diary_entries(db: Session = Depends(get_db)):
    entries = db.query(DiaryEntry).all()
    return [{
        "id": entry.id,
        "title": entry.title,
        "content": entry.content,
        "created_at": entry.created_at,
        "tags": [tag.name for tag in entry.tags],
        "file_url": entry.file_url
    } for entry in entries
]


# 詳細取得エンドポイント
@router.get("/{id}")
def get_diary_entry(id: int, db: Session = Depends(get_db)):
    entry = db.query(DiaryEntry).filter(DiaryEntry.id == id).first()
    if entry is None:
        raise HTTPException(status_code=404, detail="Diary entry not found")
    
    base_url = "http://127.0.0.1:8000/"
    file_url = f"{base_url}{entry.file_url}" if entry.file_url else None

    # 関連付けられた写真・動画も取得
    photos = db.query(Photo).filter(Photo.diary_id == id).all()
    return {"entry": {
        "id": entry.id,
        "title": entry.title,
        "content": entry.content,
        "created_at": entry.created_at,
        "tags": [tag.name for tag in entry.tags],
        "file_url": file_url,
        },
        "photos": photos
    }

@router.put("/{id}")
async def update_diary_entry(
    id: int,
    title: str = Form(...),
    content: str = Form(...),
    created_at: str = Form(...),
    tags: List[str] = Form([]),
    file: UploadFile = None,
    delete_file: bool = Form(False),
    db: Session = Depends(get_db)
):
    entry = db.query(DiaryEntry).filter(DiaryEntry.id == id).first()
    if entry is None:
        raise HTTPException(status_code=404, detail="Diary entry not found")

    # ファイル削除フラグが立っている場合、関連する写真も削除
    if delete_file and entry.file_url:
        existing_file_path = os.path.join(UPLOAD_DIR, os.path.basename(entry.file_url))
        if os.path.exists(existing_file_path):
            os.remove(existing_file_path)
        entry.file_url = None

        # Photoモデルからも削除
        db.query(Photo).filter(Photo.diary_id == id).delete()

    # ファイルがある場合は保存
    if file:
        if entry.file_url:  # 既存のファイルを削除
            existing_file_path = os.path.join(UPLOAD_DIR, os.path.basename(entry.file_url))
            if os.path.exists(existing_file_path):
                os.remove(existing_file_path)
        file_path = await save_file(file)
        entry.file_url = file_path

        existing_photo = db.query(Photo).filter(Photo.diary_id == id).first()
        if existing_photo:
            existing_photo.file_path = file_path
        else:
            photo = Photo(diary_id=id, file_path=file_path)
            db.add(photo)
            db.commit()
            db.refresh(photo)

    # 既存のタグを解除
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

    return [{
        "id": entry.id,
        "title": entry.title,
        "content": entry.content,
        "created_at": entry.created_at,
        "tags": [tag.name for tag in entry.tags],
        "file_url": entry.file_url
    } for entry in matched_entries]