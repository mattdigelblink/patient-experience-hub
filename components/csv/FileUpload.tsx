/**
 * CSV File Upload Component
 * Drag-and-drop or click-to-upload interface for CSV files
 */

'use client';

import { Upload } from 'lucide-react';
import { useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      onFileSelect(file);
    } else {
      alert('Please upload a CSV file');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.csv')) {
        onFileSelect(file);
      } else {
        alert('Please upload a CSV file');
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-12 transition-colors ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
      }`}
    >
      <input
        type="file"
        accept=".csv"
        onChange={handleFileInput}
        className="hidden"
        id="csv-upload"
      />
      <label htmlFor="csv-upload" className="flex flex-col items-center cursor-pointer">
        <Upload size={48} className={`mb-4 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
        <p className="text-slate-700 font-medium mb-2">
          {isDragging ? 'Drop CSV file here' : 'Upload CSV File'}
        </p>
        <p className="text-slate-500 text-sm">
          Drag and drop or click to browse
        </p>
      </label>
    </div>
  );
}
