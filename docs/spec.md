# 📘 Travel Diary App - 仕様書（spec.md）

## 🎯 アプリ概要
ユーザーが旅で撮影した写真・動画をアップロードし、位置情報やAIによるタグ・文章補助とともに日記として記録・共有できるアプリケーション。

---

## 🖼 想定画面一覧

| 画面名             | 機能概要                             |
|--------------------|--------------------------------------|
| トップページ        | 新着日記一覧・検索・タグ表示           |
| 日記投稿ページ      | 旅のタイトル・本文・ファイル投稿       |
| 日記詳細ページ      | 写真・動画・本文・タグ・ルートの表示   |
| マイページ          | 自分の投稿した旅日記一覧・編集         |
| ログイン/登録ページ | 認証機能（メール＋パスワード）        |
| ユーザー一覧        | 他のユーザーの投稿やプロフィール表示   |

---

## 🗂 データモデル（概要）

### User（ユーザー）
- id: UUID
- name: string
- email: string
- password_hash: string

### DiaryEntry（日記）
- id: UUID
- user_id: FK(User)
- title: string
- content: text
- created_at: datetime
- visibility: enum("public", "private", "friends")

### Photo / Video（メディア）
- id: UUID
- diary_id: FK(DiaryEntry)
- file_url: string
- created_at: datetime

### Tag（タグ）
- id: UUID
- name: string

### DiaryTag（中間テーブル）
- diary_id: FK(DiaryEntry)
- tag_id: FK(Tag)

### Route（ルート）
- id: UUID
- diary_id: FK(DiaryEntry)
- geojson_data: text

---

## 🔌 API設計（主要エンドポイント）

### 認証
- `POST /auth/register` : ユーザー登録
- `POST /auth/login` : ログイン（JWT発行）

### 日記操作
- `GET /diary/` : 全日記取得（公開のみ）
- `GET /diary/{id}` : 日記詳細取得
- `POST /diary/` : 日記作成（認証要）
- `PUT /diary/{id}` : 日記編集（本人のみ）
- `DELETE /diary/{id}` : 日記削除

### タグ・検索
- `GET /tags/` : タグ一覧
- `GET /search?tag=xx` : タグで検索

### メディア
- `POST /media/upload` : 画像/動画アップロード
- `DELETE /media/{id}` : メディア削除

### AI機能
- `POST /ai/generate_tags` : 画像からタグ生成
- `POST /ai/generate_title` : 画像群からタイトル生成
- `POST /ai/generate_summary` : 写真・動画から本文生成

### ルート情報
- `POST /route/upload` : GeoJSONアップロード
- `GET /route/{diary_id}` : 日記に紐づくルート取得

---

## 🗺 今後の拡張候補
- コメント機能
- いいね・保存・お気に入り
- SNS共有リンク（公開モード）
- カレンダー表示・地図表示（タイムライン）

