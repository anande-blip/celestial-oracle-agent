import React from 'react';
import { GeneratedImage } from '../types';

interface ImageDisplayProps {
  image: GeneratedImage | null;
  onDownload: () => void;
  onReset: () => void;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ image, onDownload, onReset }) => {
  if (!image) return null;

  return (
    <div className="relative group w-full max-w-2xl mx-auto aspect-square bg-black rounded-lg overflow-hidden shadow-2xl border-4 border-double border-purple-500/50">
      
      {/* The Image */}
      <img
        src={`data:${image.mimeType};base64,${image.base64}`}
        alt="Mystical Generation"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Overlay controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-between items-end">
        <button
          onClick={onReset}
          className="text-xs text-red-300 hover:text-red-100 bg-red-900/30 hover:bg-red-900/50 px-3 py-1.5 rounded border border-red-800/50 transition-colors"
        >
          Discard Vision
        </button>
        <button
          onClick={onDownload}
          className="flex items-center gap-2 text-sm text-purple-100 hover:text-white font-semibold bg-purple-900/50 hover:bg-purple-800/70 px-4 py-2 rounded-lg border border-purple-500/30 backdrop-blur-sm transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Save Artifact
        </button>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-purple-500/40 rounded-tl-lg pointer-events-none"></div>
      <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-purple-500/40 rounded-tr-lg pointer-events-none"></div>
      <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-purple-500/40 rounded-bl-lg pointer-events-none"></div>
      <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-purple-500/40 rounded-br-lg pointer-events-none"></div>
    </div>
  );
};

export default ImageDisplay;