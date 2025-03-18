'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

interface DiaryEntry {
  id: number;
  title: string;
  content: string;
  created_at: string;
  file_url?: string;
  tags: string[];
}

export default function DiaryDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/diary/${id}`);
        setEntry(response.data.entry);
        setTitle(response.data.entry.title);
        setContent(response.data.entry.content);
        setFileUrl(response.data.entry.file_url || '');
        setTags(response.data.tags || []);
      } catch (error) {
        console.error('データ取得失敗:', error);
      }
    };

    if (id) fetchEntry();
  }, [id]);

  // タグ追加
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value) {
      setTags([...tags, e.currentTarget.value]);
      e.currentTarget.value = '';
    }
  };

  // タグ削除
  const handleDeleteTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // 編集処理
  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('created_at', new Date().toISOString());
    tags.forEach((tag) => formData.append('tags', tag));
    formData.append('delete_file', String(!file && !fileUrl));

    if (file) {
      formData.append('file', file);
    }
    try {
      const response = await axios.put(`http://127.0.0.1:8000/diary/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
        },
      });
      setStatus('更新成功！');
      setEntry(response.data);
      setFileUrl(response.data.file_url || '');
      setFile(null);
      router.push('/'); // 更新後に一覧へ戻る
    } catch (error) {
      console.error('更新失敗:', error);
      setStatus('更新失敗...');
    }
  };

  // **削除処理**
  const handleFileDelete = async () => {
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('created_at', new Date().toISOString());
      tags.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag);
      });
      formData.append('delete_file', 'true');

      const response = await axios.put(`http://127.0.0.1:8000/diary/${id}`, formData);
      setFileUrl(''); // ファイル削除後に表示をクリア
      setStatus('ファイルを削除しました');
    } catch (error) {
      console.error('削除失敗:', error);
    }
  };

  if (!entry) return <div>読み込み中...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold text-blue-500 mb-6">
        {entry.title}
      </h1>
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        {/* タグ表示 */}
        <div className="flex flex-wrap mb-4">
          {tags.map((tag) => (
            <span 
              key={tag} 
              onClick={() => handleDeleteTag(tag)}
              className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full mr-2 cursor-pointer">
              {tag} ❌
            </span>
          ))}
          <input
            placeholder="タグを追加"
            onKeyDown={handleAddTag}
            className="w-24 px-2 py-1 border border-gray-300 rounded-lg"
          />
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タイトル"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="内容"
          className="w-full px-3 py-2 mt-4 border border-gray-300 rounded-lg"
        />
        {fileUrl && (
          <div className="mt-4">
            <img
              src={fileUrl}
              alt="Preview"
              className="w-full h-auto rounded"
            />
            <button
              onClick={handleFileDelete}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 mt-2"
            >
              ファイルを削除
            </button>
          </div>
        )}
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
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
