from fastapi import APIRouter, Depends, HTTPException, UploadFile, Form 
from sqlalchemy.orm import Session
from database import SessionLocal
from models import DiaryEntry, Photo
from schemas import DiaryEntryCreate, DiaryEntryUpdate
from routes.photos import save_file

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
    file: UploadFile = None,
    db: Session = Depends(get_db)
):
    # 日記エントリを作成
    db_entry = DiaryEntry(title=title, content=content, created_at=created_at)
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)

    # ファイルがある場合は保存
    if file:
        file_path = await save_file(file)  # routes/photos.py の関数を呼び出す
        if file_path:
            # Photoモデルに保存
            photo = Photo(diary_id=db_entry.id, file_path=file_path)
            db.add(photo)
            db.commit()

    return db_entry

@router.get("/")
def get_all_diary_entries(db: Session = Depends(get_db)):
    return db.query(DiaryEntry).all()

# 詳細取得エンドポイント
@router.get("/{diary_id}")
def get_diary_entry(diary_id: int, db: Session = Depends(get_db)):
    entry = db.query(DiaryEntry).filter(DiaryEntry.id == diary_id).first()
    if entry is None:
        raise HTTPException(status_code=404, detail="Diary entry not found")

    # 関連付けられた写真・動画も取得
    photos = db.query(Photo).filter(Photo.diary_id == diary_id).all()
    return {"entry": entry, "photos": photos}

@router.put("/{diary_id}")
async def update_diary_entry(
    diary_id: int,
    title: str = Form(...),
    content: str = Form(...),
    file: UploadFile = None,
    db: Session = Depends(get_db)
):
    entry = db.query(DiaryEntry).filter(DiaryEntry.id == diary_id).first()
    if entry is None:
        raise HTTPException(status_code=404, detail="Diary entry not found")

    entry.title = title
    entry.content = content

    # 新しいファイルをアップロードした場合、保存
    if file:
        file_path = await save_file(file)
        if file_path:
            # 既存のファイル削除 (必要なら)
            db.query(Photo).filter(Photo.diary_id == diary_id).delete()
            photo = Photo(diary_id=entry.id, file_path=file_path)
            db.add(photo)

    db.commit()
    return entry