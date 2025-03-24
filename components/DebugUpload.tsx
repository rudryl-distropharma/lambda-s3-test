'use client';

import { useState } from 'react';

export function DebugUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<any | null>(null);
  const [fileDetails, setFileDetails] = useState<{ name: string; size: number; type: string } | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setError('No file selected');
      return;
    }

    const file = files[0];
    setFileDetails({
      name: file.name,
      size: file.size,
      type: file.type
    });
    setError(null);
    setResponse(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Starting upload...');
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      console.log('Upload response status:', uploadResponse.status);
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        setError(`Upload failed with status ${uploadResponse.status}: ${errorText}`);
        console.error('Response not OK:', uploadResponse.status, errorText);
        return;
      }
      
      try {
        const data = await uploadResponse.json();
        console.log('Upload succeeded with data:', data);
        setResponse(data);
      } catch (jsonError) {
        setError(`Failed to parse response JSON: ${jsonError}`);
        console.error('JSON parse error:', jsonError);
      }
    } catch (error) {
      console.error('Upload network error:', error);
      setError(`Network error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Debug Upload</h2>
      
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-900">
          Select File to Upload
        </label>
        <input
          type="file"
          accept=".csv,.xlsx,.xls,.pdf"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 p-2.5"
        />
      </div>
      
      {isUploading && (
        <div className="my-4 p-3 bg-blue-50 text-blue-700 rounded-md">
          Uploading file...
        </div>
      )}
      
      {fileDetails && (
        <div className="my-4 p-4 border border-gray-200 rounded-md">
          <h3 className="font-medium mb-2">File Details:</h3>
          <p><strong>Name:</strong> {fileDetails.name}</p>
          <p><strong>Size:</strong> {(fileDetails.size / 1024).toFixed(2)} KB</p>
          <p><strong>Type:</strong> {fileDetails.type || 'Unknown'}</p>
        </div>
      )}
      
      {error && (
        <div className="my-4 p-3 bg-red-50 text-red-700 rounded-md">
          <h3 className="font-medium mb-1">Error:</h3>
          <pre className="whitespace-pre-wrap text-sm">{error}</pre>
        </div>
      )}
      
      {response && (
        <div className="my-4 p-3 bg-green-50 text-green-700 rounded-md">
          <h3 className="font-medium mb-1">Response:</h3>
          <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
      
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <h3 className="font-medium mb-1">Environment Check:</h3>
        <p><strong>AWS Region:</strong> {process.env.NEXT_PUBLIC_AWS_REGION || 'Not set in public env'}</p>
        <p><strong>AWS Bucket:</strong> {process.env.NEXT_PUBLIC_AWS_BUCKET_NAME || 'Not set in public env'}</p>
      </div>
    </div>
  );
} 