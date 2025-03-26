import os
from fastapi import APIRouter, UploadFile, HTTPException
from typing import List
from openai import OpenAI
import base64

router = APIRouter()

API_KEY = os.getenv("OPEN_API_KEY")

client = OpenAI(
  api_key = API_KEY
)

@router.post("/generate_tags/")
async def generate_tags(file: UploadFile):
  try:
    # 画像データをAPIに送信
    image_data = await file.read()
    encoded_image = base64.b64encode(image_data).decode("utf-8")
    response = client.chat.completions.create(
      model="gpt-4o-vision-preview",
      messages=[
        {"role": "system", "content": "あなたは画像からタグを生成するAIです。"},
        {"role": "user", 
         "content": [
           {"type": "text", "text": "この画像のタグを生成してください。"},
           {"type": "image_url", "image_url": f"data:image/jpeg;base64,{encoded_image}"}
         ]
        }
      ],
    )
    choices = response.choices
    if choices:
      content = choices[0].message.content
      print(content)
      tags = content.split(", ")
      return {"tags": tags}
    else:
      raise HTTPException(status_code=500, detail="No choices found in the response")
  except Exception as e:
    print(f"Error: {str(e)}")  # エラーメッセージをログに出力
    raise HTTPException(status_code=500, detail=str(e))