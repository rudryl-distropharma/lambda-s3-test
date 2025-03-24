'use client';

import { DebugUpload } from '@/components/DebugUpload';

export default function DebugPage() {
  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Upload Debugging</h1>
      
      <DebugUpload />
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Instructions</h2>
        <p className="mb-2">
          This page provides detailed debugging information for file uploads.
          Use it to troubleshoot upload issues with the following steps:
        </p>
        <ol className="list-decimal list-inside space-y-1 ml-4">
          <li>Select a file to upload using the file input above</li>
          <li>Check the file details to ensure it&apos;s the correct file</li>
          <li>After upload completes, check the response or error details</li>
          <li>Look at browser console for additional information</li>
        </ol>
      </div>
    </main>
  );
} 