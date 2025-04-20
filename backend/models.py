from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

# 中間テーブル (多対多)
diary_entry_tags = Table(
    "diary_entry_tags",
    Base.metadata,
    Column("diary_entry_id", Integer, ForeignKey("diary_entries.id")),
    Column("tag_id", Integer, ForeignKey("tags.id"))
)

class DiaryEntry(Base):
    __tablename__ = "diary_entries"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    photos = relationship("Photo", back_populates="diary_entry", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary=diary_entry_tags, back_populates="entries")

class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    diary_entry_id = Column(Integer, ForeignKey("diary_entries.id"))
    file_url = Column(String, nullable=False)

    diary_entry = relationship("DiaryEntry", back_populates="photos")

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    entries = relationship("DiaryEntry", secondary=diary_entry_tags, back_populates="tags")