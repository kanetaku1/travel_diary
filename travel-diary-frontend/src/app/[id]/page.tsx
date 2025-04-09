'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import TagInputArea from '@/components/TagInputArea';
import FilePreview from '@/components/FilePreview';
import { useTagInput } from '@/hooks/useTagInput';
import { useFileUploader } from '@/hooks/useFileUploader';
import { DiaryEntry, Photo } from '@/types/diary';

export default function DiaryDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [deleteFileIds, setDeleteFileIds] = useState<number[]>([]);
  const {tags, setTags, addTag, removeTag} = useTagInput();
  const {files, handleFileChange} = useFileUploader();
  const [status, setStatus] = useState('');

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
      <div className="max-w-2xl mx-auto p-4 text-gray-500 bg-white shadow-md rounded-lg">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border p-2 rounded mb-4" />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full border p-2 rounded mb-4" />

        <TagInputArea tags={tags} onAdd={addTag} onRemove={removeTag} />

        <div className="flex flex-wrap mb-4">
          {entry.photos.map((photo) => (
            <FilePreview key={photo.id} fileUrl={photo.file_url} onDelete={() => setDeleteFileIds([...deleteFileIds, photo.id])} />
          ))}
        </div>

        <input type="file" multiple onChange={(e) => handleFileChange(e, setTags)} className="mb-4" />

        <button onClick={handleUpdate} className="bg-blue-500 text-white px-4 py-2 rounded w-full my-4">
          更新
        </button>
      </div>
      {status && (
        <p className="mt-4 text-center text-green-500">{status}</p>
      )}
    </div>
  );
}
