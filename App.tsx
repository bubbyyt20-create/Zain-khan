import React, { useState, useCallback } from 'react';
import { InputSection } from './components/InputSection';
import { LoadingSection } from './components/LoadingSection';
import { ResultsSection } from './components/ResultsSection';
import { AppState, InputMode } from './types';
import { analyzeProduct, generateProductImages, generateSeoTitle, generateSeoDescription } from './services/geminiService';

const initialState: AppState = {
  step: 'input',
  loading: false,
  statusMessage: '',
  error: null,
  inputData: null,
  result: null,
};

function App() {
  const [state, setState] = useState<AppState>(initialState);

  const handleError = (msg: string) => {
    setState(prev => ({ 
        ...prev, 
        loading: false, 
        step: prev.result ? 'results' : 'input', // Go back to results if we have them, else input
        error: msg 
    }));
  };

  const processGeneration = async (mode: InputMode, value: string, mimeType?: string) => {
    setState(prev => ({
      ...prev,
      step: 'processing',
      loading: true,
      error: null,
      inputData: { mode, value, mimeType },
      statusMessage: "Step 2/6: Analyzing product details..."
    }));

    try {
      // Step 2: Analyze
      const productContext = await analyzeProduct(mode, value, mimeType);
      
      // Step 3: Generate Images
      setState(prev => ({ ...prev, statusMessage: "Step 3/6: Generating 5 professional AI images..." }));
      // Pass the image value if mode is upload so we can use it as a reference
      const images = await generateProductImages(
        productContext, 
        mode === 'upload' ? value : undefined,
        mimeType
      );

      // Step 4: Title
      setState(prev => ({ ...prev, statusMessage: "Step 4/6: Drafting high-converting SEO title..." }));
      const title = await generateSeoTitle(productContext);

      // Step 5: Description
      setState(prev => ({ ...prev, statusMessage: "Step 5/6: Writing persuasive sales copy..." }));
      const description = await generateSeoDescription(productContext);

      // Step 6: Finalize
      setState(prev => ({
        ...prev,
        step: 'results',
        loading: false,
        statusMessage: "Complete!",
        result: {
          title,
          description,
          images,
          productContext
        }
      }));

    } catch (error: any) {
      handleError(error.message || "An unexpected error occurred.");
    }
  };

  const handleStart = useCallback((mode: InputMode, value: string, mimeType?: string) => {
    processGeneration(mode, value, mimeType);
  }, []);

  const handleRegenerate = useCallback(() => {
    if (state.inputData) {
        processGeneration(state.inputData.mode, state.inputData.value, state.inputData.mimeType);
    }
  }, [state.inputData]);

  const handleReset = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 rounded-lg p-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">DropGen AI</span>
          </div>
          <span className="text-xs font-mono text-slate-400 hidden sm:block">Powered by Gemini 2.5 Flash</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        
        {state.error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2 animate-fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {state.error}
                <button onClick={() => setState(prev => ({ ...prev, error: null }))} className="ml-auto text-sm underline">Dismiss</button>
            </div>
        )}

        {state.step === 'input' && (
          <InputSection onStart={handleStart} disabled={state.loading} />
        )}

        {state.step === 'processing' && (
          <LoadingSection status={state.statusMessage} />
        )}

        {state.step === 'results' && state.result && (
          <ResultsSection 
            data={state.result} 
            onReset={handleReset} 
            onRegenerate={handleRegenerate} 
          />
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
           &copy; {new Date().getFullYear()} DropGen AI. Generated with Gemini 2.5 Flash.
        </div>
      </footer>
    </div>
  );
}

export default App;