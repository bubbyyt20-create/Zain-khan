import React, { useState } from 'react';
import { ProductData, GeneratedImage } from '../types';

interface ResultsSectionProps {
  data: ProductData;
  onReset: () => void;
  onRegenerate: () => void;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({ data, onReset, onRegenerate }) => {
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);

  const copyToClipboard = async (text: string, isTitle: boolean) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isTitle) {
        setCopiedTitle(true);
        setTimeout(() => setCopiedTitle(false), 2000);
      } else {
        setCopiedDesc(true);
        setTimeout(() => setCopiedDesc(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-4 z-20">
        <h2 className="text-xl font-bold text-slate-800">Generated Listing Package</h2>
        <div className="flex gap-3">
          <button 
            onClick={onRegenerate}
            className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"/></svg>
            Regenerate
          </button>
          <button 
            onClick={onReset}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            New Product
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Text Content */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Title Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-semibold text-slate-700">SEO Title</h3>
              <button 
                onClick={() => copyToClipboard(data.title, true)}
                className={`text-xs px-2 py-1 rounded transition-all ${copiedTitle ? 'bg-green-100 text-green-700' : 'bg-white border hover:bg-slate-50 text-slate-600'}`}
              >
                {copiedTitle ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-slate-800 font-medium leading-relaxed">{data.title}</p>
            </div>
          </div>

          {/* Description Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[600px]">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-semibold text-slate-700">SEO Description</h3>
              <button 
                onClick={() => copyToClipboard(data.description, false)}
                className={`text-xs px-2 py-1 rounded transition-all ${copiedDesc ? 'bg-green-100 text-green-700' : 'bg-white border hover:bg-slate-50 text-slate-600'}`}
              >
                {copiedDesc ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
              <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                {data.description}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Images Grid */}
        <div className="lg:col-span-2">
          <div className="grid sm:grid-cols-2 gap-4">
            
            {/* Main Image (Featured) */}
            <div className="sm:col-span-2 relative group">
               <ImageCard image={data.images[0]} isMain={true} onDownload={() => downloadImage(data.images[0].url, `main-product.png`)} />
            </div>

            {/* Other Images */}
            {data.images.slice(1).map((img, idx) => (
              <ImageCard key={idx} image={img} onDownload={() => downloadImage(img.url, `${img.type.replace(/\s+/g, '-').toLowerCase()}.png`)} />
            ))}
            
          </div>
          
          <div className="mt-6 flex justify-end">
             <button 
               onClick={() => data.images.forEach(img => downloadImage(img.url, `dropgen-${img.type.replace(/\s+/g, '-').toLowerCase()}.png`))}
               className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
             >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download All Images
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};

const ImageCard: React.FC<{ image: GeneratedImage, isMain?: boolean, onDownload: () => void }> = ({ image, isMain, onDownload }) => (
  <div className={`relative bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group ${isMain ? 'aspect-video sm:aspect-[2/1]' : 'aspect-square'}`}>
    <div className="absolute top-2 left-2 z-10">
        <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-md">
            {image.label}
        </span>
    </div>
    
    <img 
      src={image.url} 
      alt={image.label} 
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
    />

    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
        <button 
            onClick={onDownload}
            className="bg-white text-slate-800 p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
            title="Download Image"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
    </div>
  </div>
);
