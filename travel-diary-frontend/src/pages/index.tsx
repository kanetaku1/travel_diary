'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000');
        setMessage(response.data.message);
      } catch (error) {
        console.error('API接続エラー:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <h1 className="text-3xl font-bold text-blue-500">
        {message || 'Loading...'}
      </h1>
    </div>
  );
}
