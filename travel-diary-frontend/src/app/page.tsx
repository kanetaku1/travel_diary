'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TagInputArea from '@/components/TagInputArea';
import FilePreview from '@/components/FilePreview';
import { useTagInput } from '@/hooks/useTagInput';
import { useFileUploader } from '@/hooks/useFileUploader';
import { DiaryEntry, Photo } from '@/types/diary';

export default function Home() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const { tags, setTags, addTag, removeTag } = useTagInput();
  const { files, setFiles, handleFileChange } = useFileUploader();
  const [status, setStatus] = useState('');
  
  useEffect(() => {
    fetchEntries(); // 初回ロード時に一覧を取得
  }, []);

  // 一覧取得処理
  const fetchEntries = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/diary/');
      setEntries(response.data);
    } catch (error) {
      console.error('API接続エラー:', error);
    }
  };

  // タグ検索
  const handleSearch = async () => {
    try {
      if (searchTags.length === 0) {
        fetchEntries(); // タグが空の場合、全件取得
        return;
      }
      const queryString = searchTags.map(tag => `tags=${encodeURIComponent(tag)}`).join('&');
      const response = await axios.get(`http://127.0.0.1:8000/diary/search/?${queryString}`);
      setEntries(response.data);
    } catch (error) {
      console.error('検索失敗:', error);
    }
  };

  // タグ入力処理
  const handleAddSearchTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value) {
      setSearchTags([...searchTags, e.currentTarget.value]);
      e.currentTarget.value = '';
    }
  };

  // タグ削除処理
  const handleDeleteSearchTag = (tag: string) => {
    setSearchTags(searchTags.filter((t) => t !== tag));
  };

  // 投稿処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('created_at', new Date().toISOString());
    tags.forEach((tag) => formData.append('tags', tag));
    files.forEach((file) => formData.append('files', file));

    try {
      await axios.post('http://127.0.0.1:8000/diary/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setStatus('投稿成功！');
      setTitle('');
      setContent('');
      setTags([]);
      setFiles([]);
      // 投稿成功後に一覧を再取得して更新
      router.refresh();
    } catch (error) {
      console.error('APIエラー:', error);
      setStatus('投稿失敗...');
    }
  };

  return (
    <div className="w-full mx-auto p-6 bg-white shadow rounded text-gray-800 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4 text-blue-500">Travel Diary</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-lg shadow-lg max-w-2xl">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タイトル"
          className="w-full border border-gray-300 rounded px-4 py-2"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="内容"
          className="w-full border border-gray-300 rounded px-4 py-2"
          required
        />

        <TagInputArea tags={tags} onAdd={addTag} onRemove={removeTag} />

        <div className="flex flex-wrap">
          {files.map((file, index) => (
            <FilePreview
              key={index}
              fileUrl={URL.createObjectURL(file)}
              onDelete={() => setFiles(files.filter((_, i) => i !== index))}
            />
          ))}
        </div>

        <input type="file" multiple onChange={(e) => handleFileChange(e, setTags)} className="mb-4 text-gray-300" />

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full my-4">
          投稿
        </button>
      </form>

      <h1 className="text-2xl font-bold mb-4 text-blue-500 mt-10">投稿検索</h1>
      {/* タグ検索UI */}
      <div className="flex gap-2 mb-4 bg-white p-4 rounded-lg shadow-lg mb-10">
        {searchTags.map((tag) => (
          <span
            key={tag}
            onClick={() => handleDeleteSearchTag(tag)}
            className="px-3 py-1 rounded cursor-pointer bg-gray-200 text-gray-600 mr-2"
          >
            {tag} ❌
          </span>
        ))}
        <input
          type="text"
          placeholder="タグを入力"
          onKeyDown={handleAddSearchTag}
          className="border px-2 py-1 rounded focus:outline-none mr-2 text-gray-600"
        />
        <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-1 rounded">
          検索
        </button>
      </div>
      
      {/* 投稿一覧 */}
      <div className="w-full max-w-md space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="p-4 border border-gray-300 rounded-lg shadow-md bg-white"
          >
            <h2 className="text-xl font-bold">{entry.title}</h2>
            <p className="text-gray-600 mt-2">{entry.content}</p>
            <div className="flex flex-wrap float-right mt-1">
              {entry.tags.map((tag) => (
                <span key={tag} className="tag text-sm bg-gray-200 text-gray-600 px-2 py-1 rounded-full mr-2">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {new Date(entry.created_at).toLocaleString()}
            </p>
            <Link href={`/${entry.id}`}>
              <p className="text-sm text-blue-500 mt-2 cursor-pointer">詳細を見る</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
