import React from 'react';

interface LoadingOracleProps {
  message?: string;
}

const LoadingOracle: React.FC<LoadingOracleProps> = ({ message = "Consulting the spirits..." }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-6 relative overflow-hidden rounded-xl p-8">
      
      {/* Mystical Vapor Background Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/20 rounded-full blur-[60px] animate-vapor"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-400/10 rounded-full blur-[40px] animate-vapor" style={{ animationDelay: '-4s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Crystal Ball Outer Glow */}
        <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
        
        {/* Crystal Ball */}
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-indigo-900 to-black border border-purple-400/50 shadow-[0_0_30px_rgba(168,85,247,0.4)] overflow-hidden">
          {/* Inner swirling mist effect */}
          <div className="absolute inset-0 bg-[url('https://picsum.photos/200/200?blur=10')] opacity-40 animate-spin-slow mix-blend-screen filter hue-rotate-[260deg]"></div>
          <div className="absolute top-2 left-4 w-6 h-3 bg-white opacity-40 rounded-full blur-sm transform -rotate-12"></div>
        </div>

        {/* Floating Runes */}
        <div className="absolute -top-6 -right-6 text-amber-200 text-sm animate-bounce delay-75 shadow-glow">✦</div>
        <div className="absolute -bottom-4 -left-6 text-purple-200 text-sm animate-bounce delay-150 shadow-glow">✧</div>
        <div className="absolute top-1/2 -right-8 text-indigo-200 text-xs animate-pulse delay-300">⋆</div>
      </div>
      
      <p className="text-purple-100 font-serif tracking-widest text-sm uppercase animate-pulse relative z-10 text-center drop-shadow-lg">
        {message}
      </p>
    </div>
  );
};

export default LoadingOracle;