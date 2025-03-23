'use client';

import { useEffect, useState } from 'react';

interface File {
  name: string;
  status: string;
  key?: string;
}

interface FileListProps {
  files: File[];
}

export function FileList({ files }: FileListProps) {
  const [fileStatuses, setFileStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    const checkFileStatus = async () => {
      for (const file of files) {
        if (file.key) {
          try {
            const response = await fetch(`/api/status?key=${encodeURIComponent(file.key)}`);
            const data = await response.json();
            setFileStatuses(prev => ({
              ...prev,
              [file.key!]: data.status
            }));
          } catch (error) {
            console.error('Error checking file status:', error);
          }
        }
      }
    };

    checkFileStatus();
    const interval = setInterval(checkFileStatus, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [files]);

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-4">Uploaded Files</h2>
      <div className="space-y-2">
        {files.map((file, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex flex-col">
              <span className="text-sm text-gray-900">{file.name}</span>
              {file.key && (
                <span className="text-xs text-gray-500">
                  Status: {fileStatuses[file.key] || file.status}
                </span>
              )}
            </div>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                fileStatuses[file.key] === 'processed'
                  ? 'bg-green-100 text-green-800'
                  : fileStatuses[file.key] === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {fileStatuses[file.key] || file.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 