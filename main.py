from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import photos, diary

app = FastAPI()

# CORS設定（Next.jsとの通信を許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(photos.router, prefix="/photos", tags=["photos"])
app.include_router(diary.router, prefix="/diary", tags=["diary"])

@app.get("/")
def root():
    return {"message": "Welcome to Travel Diary API"}
