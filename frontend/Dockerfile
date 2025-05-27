
# Next.js フロントエンド用 Dockerfile (開発環境)
FROM node:18-alpine

# 作業ディレクトリを設定
WORKDIR /usr/src/app

# package.json と package-lock.json をコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci

# アプリケーションのソースコードをコピー
COPY . .

# Next.jsが使用するポート（3000番）を開放
EXPOSE 3000

# 開発サーバーを起動
CMD ["npm", "run", "dev"]