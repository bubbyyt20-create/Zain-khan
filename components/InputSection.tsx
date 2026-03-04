import React, { useRef, useState, useCallback } from 'react';
import { InputMode } from '../types';

interface InputSectionProps {
  onStart: (mode: InputMode, value: string, mimeType?: string) => void;
  disabled: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onStart, disabled }) => {
  const [dragActive, setDragActive] = useState(false);
  const [textInput, setTextInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onStart('upload', result, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [onStart]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;
    onStart('text', textInput);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-fade-in-up">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 pb-2">
          Dropshipping Listing Generator
        </h1>
        <p className="text-lg text-slate-600">
          Upload an image, drop a link, or enter a product name to generate a full sales package instantly.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload Area */}
        <div 
          className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer
            ${dragActive ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50'}
            ${disabled ? 'opacity-50 pointer-events-none' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg, image/png, image/webp"
            onChange={handleChange}
          />
          <div className="bg-indigo-100 p-4 rounded-full mb-4 text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          </div>
          <p className="font-semibold text-slate-700">Click or Drag Image</p>
          <p className="text-sm text-slate-500 mt-2">Supports JPG, PNG, WEBP</p>
        </div>

        {/* Text Area */}
        <div className="flex flex-col justify-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
           <label className="block text-sm font-medium text-slate-700 mb-2">
             Product Name or Link
           </label>
           <div className="relative">
             <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
              placeholder="e.g. 'Wireless Earbuds' or paste URL"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all pr-12"
              disabled={disabled}
             />
             <button
              onClick={handleTextSubmit}
              disabled={disabled || !textInput.trim()}
              className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
             </button>
           </div>
           <p className="text-xs text-slate-400 mt-3">
             We'll analyze the text/link to generate the package.
           </p>
        </div>
      </div>
    </div>
  );
};