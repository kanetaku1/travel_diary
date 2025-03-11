from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import DiaryEntry
from schemas import DiaryEntryCreate

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

def get_all_diary_entries(db: Session = Depends(get_db)):
    return db.query(DiaryEntry).all()
