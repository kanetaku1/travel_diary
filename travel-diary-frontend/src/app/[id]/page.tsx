'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

interface DiaryEntry {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export default function DiaryDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/diary/${id}`);
        setEntry(response.data);
        setTitle(response.data.title);
        setContent(response.data.content);
      } catch (error) {
        console.error('データ取得失敗:', error);
      }
    };

    if (id) fetchEntry();
  }, [id]);

  // 編集処理
  const handleUpdate = async () => {
    try {
      const response = await axios.put(`http://127.0.0.1:8000/diary/${id}`, {
        title,
        content,
        created_at: new Date().toISOString(),
      });
      setStatus('更新成功！');
      setEntry(response.data);
      router.push('/'); // 更新後に一覧へ戻る
    } catch (error) {
      console.error('更新失敗:', error);
      setStatus('更新失敗...');
    }
  };

  if (!entry) return <div>読み込み中...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold text-blue-500 mb-6">
        {entry.title}
      </h1>
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 mt-4 border border-gray-300 rounded-lg"
        />
        <button
          onClick={handleUpdate}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 mt-4"
        >
          更新
        </button>
        {status && (
          <p className="mt-4 text-center text-green-500">{status}</p>
        )}
      </div>
    </div>
  );
}
