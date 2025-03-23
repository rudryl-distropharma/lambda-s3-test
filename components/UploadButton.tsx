'use client';

import { useState } from 'react';

interface UploadButtonProps {
  onUploadComplete: (file: { name: string; status: string; key?: string }) => void;
}

export function UploadButton({ onUploadComplete }: UploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      onUploadComplete({ 
        name: files[0].name, 
        status: 'uploaded',
        key: data.key 
      });
    } catch (error) {
      console.error('Upload failed:', error);
      onUploadComplete({ 
        name: files[0].name, 
        status: 'failed' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-6">
      <label className="block mb-2 text-sm font-medium text-gray-900">
        Upload Pharmacy Inventory File
      </label>
      <input
        type="file"
        accept=".csv,.xlsx,.xls,.pdf"
        onChange={handleFileUpload}
        disabled={isUploading}
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
      />
      {isUploading && (
        <p className="mt-2 text-sm text-gray-500">Uploading...</p>
      )}
    </div>
  );
} 