import { useState } from 'react';

export const useTagInput = () => {
  const [tags, setTags] = useState<string[]>([]);

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value) {
      setTags((prev) => [...prev, e.currentTarget.value]);
      e.currentTarget.value = '';
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  return { tags, setTags, addTag, removeTag };
};