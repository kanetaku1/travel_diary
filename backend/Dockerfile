# FastAPI バックエンド用 Dockerfile (開発環境)
FROM python:3.11-slim

# 作業ディレクトリを設定
WORKDIR /usr/src/app

# 依存ファイルをコンテナにコピー
COPY requirements.txt .

# システムの依存関係をインストール
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Python の依存関係をインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションのソースコードをコピー
COPY . .


# FastAPI が使用するポート（8000番）を開放
EXPOSE 8000

# 開発サーバーを起動（ホットリロード有効）
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
# アプリケーションの起動コマンド