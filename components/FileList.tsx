'use client';

interface File {
  name: string;
  status: string;
}

interface FileListProps {
  files: File[];
}

export function FileList({ files }: FileListProps) {
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
            <span className="text-sm text-gray-900">{file.name}</span>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                file.status === 'success'
                  ? 'bg-green-100 text-green-800'
                  : file.status === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {file.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
