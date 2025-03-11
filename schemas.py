from pydantic import BaseModel
import datetime

class DiaryEntryCreate(BaseModel):
    title: str
    content: str
    created_at: datetime.datetime
