'use client';

import { useState } from 'react';
import { UploadButton } from '@/components/UploadButton';
import { FileList } from '@/components/FileList';
import { DrugInventory } from '@/components/DrugInventory';

interface File {
  name: string;
  status: string;
  key?: string;
}

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'inventory'>('upload');

  const handleUploadComplete = (file: File) => {
    setFiles(prev => [...prev, file]);
  };

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Pharmacy Inventory Management</h1>
      
      <div className="flex justify-center mb-8">
        <div className="tabs tabs-boxed">
          <button 
            className={`tab ${activeTab === 'upload' ? 'bg-blue-500 text-white' : 'bg-gray-100'} px-4 py-2 rounded-l-lg`}
            onClick={() => setActiveTab('upload')}
          >
            Upload Files
          </button>
          <button 
            className={`tab ${activeTab === 'inventory' ? 'bg-blue-500 text-white' : 'bg-gray-100'} px-4 py-2 rounded-r-lg`}
            onClick={() => setActiveTab('inventory')}
          >
            View Inventory
          </button>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6">
        {activeTab === 'upload' ? (
          <div>
            <UploadButton onUploadComplete={handleUploadComplete} />
            <FileList files={files} />
          </div>
        ) : (
          <DrugInventory />
        )}
      </div>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Pharmacy Inventory Management System</p>
      </footer>
    </main>
  );
}
