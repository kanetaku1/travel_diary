from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import DiaryEntry
from schemas import DiaryEntryCreate, DiaryEntryUpdate

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_diary_entry(entry: DiaryEntryCreate, db: Session = Depends(get_db)):
    db_entry = DiaryEntry(title=entry.title, content=entry.content, created_at=entry.created_at)
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@router.get("/")
def get_all_diary_entries(db: Session = Depends(get_db)):
    return db.query(DiaryEntry).all()

# 詳細取得エンドポイント
@router.get("/{id}")
def get_diary_entry(id: int, db: Session = Depends(get_db)):
    entry = db.query(DiaryEntry).filter(DiaryEntry.id == id).first()
    if entry is None:
        raise HTTPException(status_code=404, detail="Diary entry not found")
    return entry

# 更新エンドポイント
@router.put("/{id}")
def update_diary_entry(id: int, entry: DiaryEntryUpdate, db: Session = Depends(get_db)):
    db_entry = db.query(DiaryEntry).filter(DiaryEntry.id == id).first()
    if db_entry is None:
        raise HTTPException(status_code=404, detail="Diary entry not found")

    db_entry.title = entry.title
    db_entry.content = entry.content
    db.commit()
    db.refresh(db_entry)
    return db_entry