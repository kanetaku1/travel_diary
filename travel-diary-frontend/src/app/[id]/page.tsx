'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

interface Photo {
  id: number;
  file_url: string;
}

interface DiaryEntry {
  id: number;
  title: string;
  content: string;
  created_at: string;
  photos: Photo[];
  tags: string[];
}

export default function DiaryDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [deleteFileIds, setDeleteFileIds] = useState<number[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const base_url = "http://127.0.0.1:8000/";

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/diary/${id}`);
        setEntry(response.data);
        setTitle(response.data.title);
        setContent(response.data.content);
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
  
  // ファイル削除処理
  const toggleDeleteFileFlag = (fileId: number) => {
    console.log(fileId);
    setDeleteFileIds(deleteFileIds.includes(fileId)
      ? deleteFileIds.filter((id) => id !== fileId)
      : [...deleteFileIds, fileId]
    );
  };

    // ファイル追加処理
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        setFiles(Array.from(e.target.files)||[]);
      }
    };  

  // 編集処理
  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('created_at', new Date().toISOString());
    tags.forEach((tag) => formData.append('tags', tag));
    files.forEach((file) => formData.append('files', file));
    deleteFileIds.forEach((id) => formData.append('delete_files', String(id)));

    try {
      await axios.put(`http://127.0.0.1:8000/diary/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setStatus('更新成功！');
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
        {title}
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
        {entry?.photos.map((photo) => (
          <div key={photo.id} className="mt-4">
            <img
              src={`${base_url}${photo.file_url}`}
              alt="Uploaded"
              className="w-full h-auto rounded"
            />
            <button
              onClick={() => toggleDeleteFileFlag(photo.id)}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 mt-2"
            >
              {deleteFileIds.includes(photo.id) ? '削除取り消し' : '削除'}
            </button>
          </div>
        ))}
        <input 
          type="file" 
          multiple onChange={handleFileChange} 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
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
