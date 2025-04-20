import { useState } from 'react';
import {generateTagsFromImage} from '@/lib/api'

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
        try {
          const response = await generateTagsFromImage(fileArray[0]);
          if (!response.data || !response.data.tags) {
            console.error('タグ生成に失敗しました。');
            return;
          }
          // 生成されたタグをセットする
          setTags(response.data.tags);
        } catch (error) {
          console.error('タグ生成エラー:', error);
        }
      }
    }
  };

  return { files, setFiles, handleFileChange };
};
