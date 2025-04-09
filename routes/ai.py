from google.cloud import vision
from fastapi import APIRouter, UploadFile, HTTPException

router = APIRouter()

@router.post("/generate_tags")
async def generate_tags(file: UploadFile):
  try:
    # 画像をバイトデータに変換し、Base64エンコード
    client = vision.ImageAnnotatorClient()
    image_data = await file.read()
    image = vision.Image(content=image_data)

    response = client.label_detection(image=image)
    labels = response.label_annotations
    print("labels:")

    for label in labels:
      print(label.description)
    
    if response.error.message:
      raise Exception(
        "{}\nFor more info on error messages, check: "
        "https://cloud.google.com/apis/design/errors".format(response.error.message)
      )
    # タグを取得
    tags = [label.description for label in labels]
    print("tags:")
    return {"tags": tags}

  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))