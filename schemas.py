from pydantic import BaseModel
import datetime
from typing import Optional

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