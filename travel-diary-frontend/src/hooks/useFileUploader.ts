import { useState } from 'react';
import axios from 'axios';

export const useFileUploader = () => {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setTags?: (tags: string[]) => void
  ) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setFiles(fileArray);

      if (setTags && fileArray.length > 0) {
        const formData = new FormData();
        formData.append('file', fileArray[0]);

        try {
          const response = await axios.post('http://127.0.0.1:8000/ai/generate_tags', formData);
          setTags(response.data.tags);
        } catch (error) {
          console.error('タグ生成エラー:', error);
        }
      }
    }
  };

  return { files, setFiles, handleFileChange };
};
