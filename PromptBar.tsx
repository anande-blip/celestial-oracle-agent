import React, { KeyboardEvent, useRef } from 'react';
import { AppMode, UploadedImage } from '../types';

interface PromptBarProps {
  prompt: string;
  setPrompt: (value: string) => void;
  onAction: () => void;
  isLoading: boolean;
  mode: AppMode;
  uploadedImage: UploadedImage | null;
  onUpload: (file: File) => void;
  onClearUpload: () => void;
}

const PromptBar: React.FC<PromptBarProps> = ({ 
  prompt, 
  setPrompt, 
  onAction, 
  isLoading, 
  mode,
  uploadedImage,
  onUpload,
  onClearUpload
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading && prompt.trim()) {
      onAction();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-6 relative z-20">
      
      {/* Upload Preview */}
      {uploadedImage && (
        <div className="absolute -top-24 left-4 z-0 animate-fade-in-up">
          <div className="relative group">
            <div className="w-20 h-20 rounded-lg border-2 border-purple-500/50 overflow-hidden shadow-[0_0_15px_rgba(168,85,247,0.3)] bg-black">
              <img 
                src={`data:${uploadedImage.mimeType};base64,${uploadedImage.base64}`} 
                alt="Offering" 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
            </div>
            <button
              onClick={onClearUpload}
              className="absolute -top-2 -right-2 bg-red-900 text-red-200 rounded-full p-1 border border-red-500 hover:bg-red-700 transition-colors shadow-lg"
              title="Remove Offering"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="absolute -bottom-6 left-0 right-0 text-center">
              <span className="text-[10px] text-purple-300 uppercase tracking-widest bg-black/50 px-2 py-0.5 rounded">Offering</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-purple-900/50 shadow-2xl backdrop-blur-sm relative z-10">
        <div className="flex flex-col sm:flex-row gap-3">
          
          <div className="relative flex-1 group">
            {/* Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400/50 hover:text-purple-300 transition-colors p-1 rounded-md hover:bg-white/5 disabled:opacity-30"
              title="Upload Reference Image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder={uploadedImage 
                ? "Describe how to transform this image..." 
                : mode === AppMode.CREATE 
                  ? "Describe a mystical scene to conjure..." 
                  : "Tell the spirits how to change this image..."
              }
              className="w-full bg-slate-800/50 border border-purple-800/30 text-purple-100 placeholder-purple-400/30 text-sm sm:text-base rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>

          <button
            onClick={onAction}
            disabled={isLoading || !prompt.trim()}
            className={`
              px-6 py-3 rounded-lg font-semibold tracking-wide text-sm sm:text-base transition-all transform active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed
              ${(mode === AppMode.CREATE && !uploadedImage)
                ? 'bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                : 'bg-gradient-to-r from-amber-700 to-orange-800 hover:from-amber-600 hover:to-orange-700 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              }
            `}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Weaving...
              </span>
            ) : (
              (mode === AppMode.CREATE && !uploadedImage) ? "Conjure" : "Transmute"
            )}
          </button>
        </div>
        
        <div className="mt-2 flex justify-between items-center text-xs text-purple-400/40 font-mono">
          <span>
            {uploadedImage 
              ? "Ritual source: Uploaded Artifact" 
              : mode === AppMode.CREATE 
                ? "Ritual source: Void (Text to Image)" 
                : "Ritual source: Existing Vision"
            }
          </span>
          <span>Gemini 2.5 Flash Image</span>
        </div>
      </div>
    </div>
  );
};

export default PromptBar;