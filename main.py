from fastapi import FastAPI
from routes import photos, diary

app = FastAPI()

app.include_router(photos.router, prefix="/photos", tags=["photos"])
app.include_router(diary.router, prefix="/diary", tags=["diary"])

@app.get("/")
def root():
    return {"message": "Welcome to Travel Diary API"}
