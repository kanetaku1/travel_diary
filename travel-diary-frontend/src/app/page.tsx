'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

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

export default function Home() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>([]);
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

  // ファイル追加処理
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      setFiles(Array.from(e.target.files)||[]);
      try {
        const response = await axios.post("http://127.0.0.1:8000/ai/generate_tags", formData);
        setTags(response.data.tags);
        console.log("タグ生成成功:", response.data.tags);
      } catch (error) {
        console.error("タグ生成エラー:", error);
      }
    }
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
        <div className="mb-4 flex flex-wrap">
          {tags.map((tag) => (
            <span 
              key={tag} 
              onClick={() => handleDeleteTag(tag)}
              className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full mr-2 cursor-pointer">
              {tag} ❌
            </span>
          ))}
          <input
            placeholder="タグを追加"
            onKeyDown={handleAddTag}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none w-24"
          />
        </div>
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
            multiple onChange={handleFileChange} 
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

      <h1 className="text-2xl font-bold mb-4 text-blue-500">投稿検索</h1>
      {/* タグ検索UI */}
      <div className="flex gap-2 mb-4 bg-white p-4 rounded-lg shadow-lg">
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
