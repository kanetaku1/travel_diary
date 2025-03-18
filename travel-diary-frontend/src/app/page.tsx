'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface DiaryEntry {
  id: number;
  title: string;
  content: string;
  created_at: string;
  file_url?:string;
}

export default function Home() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');

  // 一覧取得処理
  const fetchEntries = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/diary/');
      setEntries(response.data);
    } catch (error) {
      console.error('API接続エラー:', error);
    }
  };

  useEffect(() => {
    fetchEntries(); // 初回ロード時に一覧を取得
  }, []);

  // 投稿処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('created_at', new Date().toISOString());

    if (file) {
      formData.append('file', file);
    }

    try {
      await axios.post('http://127.0.0.1:8000/diary/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setStatus('投稿成功！');
      setTitle('');
      setContent('');
      setFile(null);

      // 投稿成功後に一覧を再取得して更新
      fetchEntries();
    } catch (error) {
      console.error('APIエラー:', error);
      setStatus('投稿失敗...');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      {/* 投稿フォーム */}
      <h1 className="text-3xl font-bold text-blue-500 mb-6">Travel Diary</h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg mb-10"
      >
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">タイトル</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">内容</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">写真・動画</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          投稿
        </button>
        {status && (
          <p className="mt-4 text-center text-green-500">{status}</p>
        )}
      </form>

      {/* 投稿一覧 */}
      <div className="w-full max-w-md space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="p-4 border border-gray-300 rounded-lg shadow-md bg-white"
          >
            <h2 className="text-xl font-bold">{entry.title}</h2>
            <p className="text-gray-600 mt-2">{entry.content}</p>
            <p className="text-sm text-gray-400 mt-2">
              {new Date(entry.created_at).toLocaleString()}
            </p>
            {entry.file_url && (
              <a
                href={`http://127.0.0.1:8000/${entry.file_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 mt-2 block"
              >
                添付ファイルを見る
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
