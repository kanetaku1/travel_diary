from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class DiaryEntry(Base):
    __tablename__ = "diary_entries"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    photos = relationship("Photo", back_populates="diary")
    file_url = Column(String, nullable=True)

class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    diary_id = Column(Integer, ForeignKey("diary_entries.id"))
    file_path = Column(String)

    diary = relationship("DiaryEntry", back_populates="photos")