import requests

# APIの起動確認
response = requests.get("http://127.0.0.1:8000/")
print(response.json())

# 日記投稿テスト
diary_entry = {
    "title": "Pythonテスト",
    "content": "PythonからAPIをテスト中",
    "created_at": "2025-03-09T12:00:00"
}

response = requests.post("http://127.0.0.1:8000/diary/", json=diary_entry)
print(response.json())
