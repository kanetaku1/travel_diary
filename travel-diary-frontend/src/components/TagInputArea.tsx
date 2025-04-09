import React from 'react';

type TagInputProps = {
  tags: string[];
  onAdd: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onRemove: (tag: string) => void;
  placeholder?: string;
};

const TagInputArea: React.FC<TagInputProps> = ({ tags, onAdd, onRemove, placeholder = "タグを追加" }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 text-gray-700 mb-4">
      {tags.length > 0 && <span className="text-sm text-gray-500">Tags:</span>}
      {tags.map((tag) => (
        <span
          key={tag}
          onClick={() => onRemove(tag)}
          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full cursor-pointer hover:bg-blue-200"
        >
          {tag} ❌
        </span>
      ))}
      <input
        placeholder={placeholder}
        onKeyDown={onAdd}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
};

export default TagInputArea;
