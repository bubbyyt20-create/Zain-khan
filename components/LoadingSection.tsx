import React from 'react';

interface LoadingSectionProps {
  status: string;
}

export const LoadingSection: React.FC<LoadingSectionProps> = ({ status }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in text-center">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-indigo-600 animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
        </div>
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">Generating Assets</h3>
      <p className="text-slate-500 max-w-sm mx-auto animate-pulse">{status}</p>
      
      <div className="mt-8 flex gap-2 justify-center">
         <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-0"></span>
         <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
         <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-300"></span>
      </div>
    </div>
  );
};