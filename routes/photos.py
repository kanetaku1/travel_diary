from fastapi import APIRouter, UploadFile, HTTPException
import os
import uuid

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ファイルを保存する関数
async def save_file(file: UploadFile) -> str:
    try:
        # ファイル名にUUIDを付与して衝突を防止
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        # 非同期でファイル保存
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        return file_path
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ファイル保存に失敗しました: {str(e)}")
    
# すべてのファイルを一覧表示するAPI (デバッグ用)
@router.get("/files")
def list_files():
    files = os.listdir(UPLOAD_DIR)
    return {"files": files}

# ファイルをダウンロードするAPI
@router.get("/files/{filename}")
def get_file(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(file_path):
        return {"file_path": file_path}
    else:
        raise HTTPException(status_code=404, detail="ファイルが見つかりません")
