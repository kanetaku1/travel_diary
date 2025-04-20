from sqlalchemy import Column, String, Text, ForeignKey, DateTime, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from backend.database import Base
import enum
import uuid
from datetime import datetime

class VisibilityEnum(str, enum.Enum):
    public = "public"
    private = "private"
    friends = "friends"

class User(Base):
    __tablename__ = 'users'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    diaries = relationship("DiaryEntry", back_populates="user")

class DiaryEntry(Base):
    __tablename__ = 'diary_entries'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    visibility = Column(Enum(VisibilityEnum), default=VisibilityEnum.public)

    user = relationship("User", back_populates="diaries")
    photos = relationship("Photo", back_populates="diary", cascade="all, delete")
    tags = relationship("DiaryTag", back_populates="diary", cascade="all, delete")
    route = relationship("Route", uselist=False, back_populates="diary", cascade="all, delete")

class Photo(Base):
    __tablename__ = 'photos'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    diary_id = Column(UUID(as_uuid=True), ForeignKey('diary_entries.id'))
    file_path = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    diary = relationship("DiaryEntry", back_populates="photos")

class Tag(Base):
    __tablename__ = 'tags'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)

    diaries = relationship("DiaryTag", back_populates="tag")

class DiaryTag(Base):
    __tablename__ = 'diary_tags'

    diary_id = Column(UUID(as_uuid=True), ForeignKey('diary_entries.id'), primary_key=True)
    tag_id = Column(UUID(as_uuid=True), ForeignKey('tags.id'), primary_key=True)

    diary = relationship("DiaryEntry", back_populates="tags")
    tag = relationship("Tag", back_populates="diaries")

class Route(Base):
    __tablename__ = 'routes'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    diary_id = Column(UUID(as_uuid=True), ForeignKey('diary_entries.id'))
    geojson_data = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    diary = relationship("DiaryEntry", back_populates="route")
