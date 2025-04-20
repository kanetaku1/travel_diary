import React from 'react';

interface FilePreviewProps {
  fileUrl: string;
  onDelete: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ fileUrl, onDelete }) => {
  const isImage = fileUrl.match(/\.(jpeg|jpg|gif|png)$/);
  const baseUrl = "http://127.0.0.1:8000/";

  return (
    <div className="relative inline-block mr-4 mb-4">
      {isImage ? (
        <img src={`${baseUrl}${fileUrl}`} alt="preview" className="w-32 h-32 object-cover rounded" />
      ) : (
        <video src={`${baseUrl}${fileUrl}`} controls className="w-32 h-32 object-cover rounded" />
      )}
      <button
        onClick={onDelete}
        className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-2 py-1"
      >
        ✕
      </button>
    </div>
  );
};

export default FilePreview;
