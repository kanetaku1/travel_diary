from pydantic import BaseModel
import datetime
from typing import Optional, List

class DiaryEntryCreate(BaseModel):
    title: str
    content: str
    created_at: datetime.datetime
    file_url: Optional[str] = None

class DiaryEntryUpdate(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime.datetime
    file_url: Optional[str] = None

    class Config:
        orm_mode = True

# Photo のスキーマ
class PhotoResponse(BaseModel):
    id: int
    file_url: str

    class Config:
        orm_mode = True

class DiaryEntryResponse(BaseModel):
    id: int
    title: str
    content: Optional[str]
    file_url: Optional[str]
    photos: List[PhotoResponse] = []

    class Config:
        orm_mode = True