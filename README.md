# Travel Diary App

旅で撮影した写真や動画、移動ルートを日記として記録・共有できるアプリです。

## 🔧 使用技術
- フロントエンド: Next.js (TypeScript, App Router)
- バックエンド: FastAPI (Python)
- データベース: PostgreSQL
- AI機能: Google Cloud Vision API, OpenAI GPT
- 地図表示: Leaflet.js / Mapbox（予定）

## 📁 ディレクトリ構成
```bash
travel_diary/
├── travel_diary_frontend/       # Next.js アプリ
├── travel_diary_backend/        # FastAPI アプリ
├── docs/                        # 設計・仕様書
├── .gitignore
├── README.md
├── docker-compose.yml（将来的）
└── .env
```

## 🚀 ローカル開発手順

```bash
# フロントエンド
cd frontend
npm install
npm run dev

# バックエンド
cd backend
uvicorn main:app --reload
```

## 📌 主な機能（予定）
- タイトル・本文入力＋写真・動画のアップロード
- GPSによる旅ルート記録
- AIによるタグ生成 / タイトル提案 / 日記内容生成
- 日記の公開範囲設定（公開 / 限定公開 / 非公開）
- タグ・位置情報からの探索機能
- 他ユーザーの旅を閲覧、共感・交流