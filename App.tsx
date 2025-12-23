
import React, { useState, useCallback, useRef } from 'react';
import { GenerationState, AppMode, UploadedImage, TarotReading, TarotCard, DeckType } from './types';
import { generateTarotReading, generateInitialImage, editImage, generateSoulmateProfile, generateCardArt } from './services/geminiService';
import PromptBar from './components/PromptBar';
import LoadingOracle from './components/LoadingOracle';
import ImageDisplay from './components/ImageDisplay';
import LiveOracleSession from './components/LiveOracleSession';

const SECTIONS = {
  SPREADS: 'tarot-spreads',
  ORACLES: 'live-portals',
  SOULMATE: 'star-soulmates',
  VOID: 'the-void'
};

const SPREADS_DEFAULTS = [
  { id: 1, title: 'The Daily Spark', type: 'One Card', count: 1, desc: 'A single point of focus for your day ahead.', defaultImg: 'https://images.unsplash.com/photo-1590487988256-9ed24133863e?auto=format&fit=crop&q=80&w=400' },
  { id: 2, title: 'Fate’s Choice', type: 'Yes or No', count: 1, desc: 'Clarity for a burning question in your heart.', defaultImg: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=400' },
  { id: 3, title: 'The Ancient Path', type: 'Celtic Tarot', count: 10, desc: 'A deep, ten-card journey into your soul’s blueprint.', defaultImg: 'https://images.unsplash.com/photo-1635505408453-6d042217c91a?auto=format&fit=crop&q=80&w=400' },
  { id: 4, title: 'Heart’s Mirror', type: 'Love Tarot', count: 6, desc: 'Understand the threads connecting two souls.', defaultImg: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=400' },
  { id: 5, title: 'Cardinal Flux', type: '4 Cards', count: 4, desc: 'Navigate the four elements of your current situation.', defaultImg: 'https://images.unsplash.com/photo-1549465220-1d8c9d9c6703?auto=format&fit=crop&q=80&w=400' },
  { id: 6, title: 'Chronos Gaze', type: '3 Cards', count: 3, desc: 'Past, Present, and Future alignment.', defaultImg: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=400' }
];

const ORACLE_DEFAULTS = [
  { name: 'Michael', title: 'The Forest Seeker', desc: 'Deep connection to the ancient woods and hidden paths.', defaultImg: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600' },
  { name: 'Elara', title: 'The Lake Whisperer', desc: 'Reading the ripples of time through sacred waters.', defaultImg: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600' },
  { name: 'Josephine', title: 'The Greenhouse Sage', desc: 'Growth, patience, and the wisdom of blooming life.', defaultImg: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=600' }
];

const DECKS: Record<DeckType, { accent: string, desc: string, cardColor: string, backClass: string }> = {
  'Rider-Waite': { 
    backClass: "card-back-lux",
    accent: "from-blue-900 to-indigo-950",
    cardColor: "bg-[#fefce8]", 
    desc: "The world's most famous deck, featuring the iconic art of Pamela Colman Smith."
  },
  'Tarot de Marseille': { 
    backClass: "card-back-lux",
    accent: "from-red-900 to-yellow-900",
    cardColor: "bg-[#fff7ed]", 
    desc: "A beautiful ancient tradition with bold primary colors and powerful medieval woodcuts."
  },
  'Thoth': { 
    backClass: "card-back-lux",
    accent: "from-purple-950 to-black",
    cardColor: "bg-[#0f172a]",
    desc: "Aleister Crowley's esoteric masterpiece, painted with intense geometric precision."
  }
};

const LuxuryCardBack: React.FC<{ deckType: DeckType }> = ({ deckType }) => {
  return (
    <div className="absolute inset-0 card-back-lux rounded-[inherit] overflow-hidden shadow-inner border-2 border-[#d4af37]/30">
      <div className="absolute inset-1 border border-[#d4af37]/50 rounded-[inherit] pointer-events-none opacity-40"></div>
      
      {/* Intricate Gold Filigree SVG Overlay - LUXURY REDESIGN */}
      <svg className="absolute inset-0 w-full h-full p-4" viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="gold-glow-back" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Frame Lines */}
        <rect x="5" y="5" width="90" height="140" rx="4" stroke="#d4af37" strokeWidth="0.5" opacity="0.6" />
        <rect x="7" y="7" width="86" height="136" rx="3" stroke="#d4af37" strokeWidth="0.2" opacity="0.3" />

        {/* Corner Fleur-de-lis decorations */}
        <g transform="translate(10,10) scale(0.12)" fill="#d4af37" filter="url(#gold-glow-back)">
           <path d="M20,0 C22,10 32,10 32,18 C32,24 25,24 25,32 L15,32 C15,24 8,24 8,18 C8,10 18,10 20,0 Z" />
           <path d="M20,32 C24,32 30,32 30,35 C30,38 24,42 20,48 C16,42 10,38 10,35 C10,32 16,32 20,32 Z" opacity="0.8" />
        </g>
        <g transform="translate(90,10) scale(0.12) rotate(90)" fill="#d4af37" filter="url(#gold-glow-back)">
           <path d="M20,0 C22,10 32,10 32,18 C32,24 25,24 25,32 L15,32 C15,24 8,24 8,18 C8,10 18,10 20,0 Z" />
           <path d="M20,32 C24,32 30,32 30,35 C30,38 24,42 20,48 C16,42 10,38 10,35 C10,32 16,32 20,32 Z" opacity="0.8" />
        </g>
        <g transform="translate(10,140) scale(0.12) rotate(-90)" fill="#d4af37" filter="url(#gold-glow-back)">
           <path d="M20,0 C22,10 32,10 32,18 C32,24 25,24 25,32 L15,32 C15,24 8,24 8,18 C8,10 18,10 20,0 Z" />
           <path d="M20,32 C24,32 30,32 30,35 C30,38 24,42 20,48 C16,42 10,38 10,35 C10,32 16,32 20,32 Z" opacity="0.8" />
        </g>
        <g transform="translate(90,140) scale(0.12) rotate(180)" fill="#d4af37" filter="url(#gold-glow-back)">
           <path d="M20,0 C22,10 32,10 32,18 C32,24 25,24 25,32 L15,32 C15,24 8,24 8,18 C8,10 18,10 20,0 Z" />
           <path d="M20,32 C24,32 30,32 30,35 C30,38 24,42 20,48 C16,42 10,38 10,35 C10,32 16,32 20,32 Z" opacity="0.8" />
        </g>

        {/* Central Medallion Group */}
        <g transform="translate(50,75)">
          {/* Compass/Sun Background Circles */}
          <circle r="34" stroke="#d4af37" strokeWidth="0.1" opacity="0.2" />
          <circle r="30" stroke="#d4af37" strokeWidth="0.8" opacity="0.5" />
          
          {/* Circular Knot Inner Border (Celtic style) */}
          <circle r="26" stroke="#d4af37" strokeWidth="1.2" strokeDasharray="3,1" opacity="0.4" />

          {/* Main Sunburst Rays (Compass points) */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
            <path 
              key={`ray-${deg}`} 
              d="M0,-24 L3,-14 L0,-10 L-3,-14 Z" 
              fill="#d4af37" 
              transform={`rotate(${deg})`} 
              filter="url(#gold-glow-back)"
            />
          ))}
          {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map(deg => (
            <path 
              key={`minor-ray-${deg}`} 
              d="M0,-20 L2,-12 L0,-8 L-2,-12 Z" 
              fill="#d4af37" 
              opacity="0.6"
              transform={`rotate(${deg})`} 
            />
          ))}

          {/* Central Motif: Circle with Fleur-de-lis */}
          <circle r="8" fill="#1a2a4a" stroke="#d4af37" strokeWidth="0.5" />
          <g transform="scale(0.2) translate(-20,-28)" fill="#d4af37">
            <path d="M20,0 C22,15 35,15 35,25 C35,35 25,35 25,45 L15,45 C15,35 5,35 5,25 C5,15 18,15 20,0 Z" />
            <path d="M20,45 C25,45 35,45 35,50 C35,55 25,60 20,70 C15,60 5,55 5,50 C5,45 15,45 20,45 Z" opacity="0.8" />
          </g>
        </g>

        {/* Decorative Top/Bottom Medallion Flourishes */}
        <g transform="translate(50,32)">
           <path d="M-20,0 C-10,-8 10,-8 20,0" stroke="#d4af37" strokeWidth="0.4" fill="none" opacity="0.5" />
           <g transform="translate(0,-6) scale(0.1)" fill="#d4af37">
              <path d="M20,0 C25,10 40,10 40,20 Q40,30 20,40 Q0,30 0,20 C0,10 15,10 20,0Z" />
           </g>
        </g>
        <g transform="translate(50,118)">
           <path d="M-20,0 C-10,8 10,8 20,0" stroke="#d4af37" strokeWidth="0.4" fill="none" opacity="0.5" />
           <g transform="translate(0,2) scale(0.1) rotate(180)" fill="#d4af37">
              <path d="M20,0 C25,10 40,10 40,20 Q40,30 20,40 Q0,30 0,20 C0,10 15,10 20,0Z" />
           </g>
        </g>
      </svg>
      
      {/* Subtle Texture Over Navy Base */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] pointer-events-none mix-blend-overlay"></div>
    </div>
  );
};

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [isSoulmateWizardOpen, setIsSoulmateWizardOpen] = useState(false);
  const [activeOracleConsultation, setActiveOracleConsultation] = useState<string | null>(null);
  const [soulmateFormData, setSoulmateFormData] = useState({ dob: '', pob: '', tob: '', preference: 'woman' });
  
  const [activeRitual, setActiveRitual] = useState<typeof SPREADS_DEFAULTS[0] | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<DeckType | null>(null);
  const [selectedCardIndices, setSelectedCardIndices] = useState<number[]>([]);
  const [isRitualLoading, setIsRitualLoading] = useState(false);
  const [reading, setReading] = useState<TarotReading | null>(null);
  const [showInterpretation, setShowInterpretation] = useState(false);

  const [oracleImages, setOracleImages] = useState<Record<string, string>>({
    'Michael': ORACLE_DEFAULTS[0].defaultImg,
    'Elara': ORACLE_DEFAULTS[1].defaultImg,
    'Josephine': ORACLE_DEFAULTS[2].defaultImg
  });

  const [spreadImages, setSpreadImages] = useState<Record<number, string>>({
    1: SPREADS_DEFAULTS[0].defaultImg,
    2: SPREADS_DEFAULTS[1].defaultImg,
    3: SPREADS_DEFAULTS[2].defaultImg,
    4: SPREADS_DEFAULTS[3].defaultImg,
    5: SPREADS_DEFAULTS[4].defaultImg,
    6: SPREADS_DEFAULTS[5].defaultImg
  });

  const [state, setState] = useState<GenerationState>({
    isLoading: false,
    error: null,
    currentImage: null,
    soulmateProfile: null,
  });

  const oracleInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const spreadInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const handleAction = useCallback(async () => {
    if (!prompt.trim()) return;
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      let result = uploadedImage 
        ? await editImage(uploadedImage.base64, uploadedImage.mimeType, prompt)
        : state.currentImage 
          ? await editImage(state.currentImage.base64, state.currentImage.mimeType, prompt)
          : await generateInitialImage(prompt);
      setState(prev => ({ ...prev, isLoading: false, error: null, currentImage: result }));
      setPrompt("");
      setUploadedImage(null);
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false, error: err.message }));
    }
  }, [prompt, uploadedImage, state.currentImage]);

  const handleSoulmateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    setIsSoulmateWizardOpen(false);
    try {
      const profile = await generateSoulmateProfile(soulmateFormData);
      setState(prev => ({ ...prev, isLoading: false, soulmateProfile: profile }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false, error: err.message }));
    }
  };

  const startRitual = (spread: typeof SPREADS_DEFAULTS[0]) => {
    setActiveRitual(spread);
    setSelectedDeck(null);
    setSelectedCardIndices([]);
    setReading(null);
    setShowInterpretation(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectDeck = (deck: DeckType) => {
    setSelectedDeck(deck);
  };

  const selectCard = (index: number) => {
    if (!activeRitual || !selectedDeck || isRitualLoading || reading) return;
    if (selectedCardIndices.includes(index)) return;
    
    const nextSelected = [...selectedCardIndices, index];
    setSelectedCardIndices(nextSelected);

    if (nextSelected.length === activeRitual.count) {
      initiateInterpretation();
    }
  };

  const initiateInterpretation = async () => {
    if (!activeRitual || !selectedDeck) return;
    setIsRitualLoading(true);
    try {
      const result = await generateTarotReading(activeRitual.type, activeRitual.count, selectedDeck);
      setReading(result);
      setIsRitualLoading(false);
    } catch (err: any) {
      setIsRitualLoading(false);
      setState(prev => ({ ...prev, error: err.message }));
    }
  };

  const revealCard = async (index: number) => {
    if (!reading || reading.cards[index].isRevealed || reading.cards[index].isGeneratingImage) return;
    
    const updatingReading = { ...reading };
    updatingReading.cards = [...updatingReading.cards];
    updatingReading.cards[index] = { ...updatingReading.cards[index], isGeneratingImage: true };
    setReading(updatingReading);

    try {
      const base64Art = await generateCardArt(reading.cards[index].name, reading.deckType);
      
      const finalReading = { ...reading };
      finalReading.cards = [...finalReading.cards];
      finalReading.cards[index] = {
        ...finalReading.cards[index],
        base64Image: base64Art,
        isRevealed: true,
        isGeneratingImage: false
      };
      setReading(finalReading);

      if (finalReading.cards.every(c => c.isRevealed)) {
        setTimeout(() => {
          setShowInterpretation(true);
        }, 1500);
      }
    } catch (err: any) {
      const failedReading = { ...reading };
      failedReading.cards = [...failedReading.cards];
      failedReading.cards[index] = { ...failedReading.cards[index], isGeneratingImage: false };
      setReading(failedReading);
      setState(prev => ({ ...prev, error: "The spirits failed to paint the arcane. Try again." }));
    }
  };

  const handleOracleImageUpload = (name: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setOracleImages(prev => ({ ...prev, [name]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSpreadImageUpload = (id: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setSpreadImages(prev => ({ ...prev, [id]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative z-10 min-h-screen">
      <nav className="sticky top-0 z-50 py-6 px-8 flex justify-between items-center backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#d4af37] to-amber-200 flex items-center justify-center text-midnight font-bold shadow-[0_0_20px_rgba(212,175,55,0.4)]">C</div>
          <span className="font-serif text-2xl tracking-widest gold-text uppercase">Celestial</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm uppercase tracking-widest font-light">
          <a href={`#${SECTIONS.SPREADS}`} className="hover:text-[#d4af37] transition-colors">Spreads</a>
          <a href={`#${SECTIONS.ORACLES}`} className="hover:text-[#d4af37] transition-colors">Oracles</a>
          <a href={`#${SECTIONS.SOULMATE}`} className="hover:text-[#d4af37] transition-colors">Soulmates</a>
          <a href={`#${SECTIONS.VOID}`} className="hover:text-[#d4af37] transition-colors">The Void</a>
        </div>
      </nav>

      <header className="pt-20 pb-12 px-4 flex flex-col items-center min-h-[600px]">
        {activeRitual ? (
          <div className="w-full max-w-7xl animate-fade-in text-center min-h-[800px] flex flex-col ritual-table rounded-[4rem] border-4 border-[#d4af37]/40 p-8 md:p-16 mb-20 shadow-[0_60px_100px_rgba(0,0,0,0.9)] relative">
             <div className="velvet-fold"></div>
             
             <div className="absolute top-8 left-8 opacity-40 pointer-events-none hidden lg:flex flex-col items-center">
                <span className="text-5xl text-[#d4af37]">❧</span>
                <div className="h-64 w-px bg-gradient-to-b from-[#d4af37] to-transparent mt-4"></div>
             </div>
             <div className="absolute top-8 right-8 opacity-40 pointer-events-none hidden lg:flex flex-col items-center">
                <span className="text-5xl text-[#d4af37]">❧</span>
                <div className="h-64 w-px bg-gradient-to-b from-[#d4af37] to-transparent mt-4"></div>
             </div>

             <div className="mb-12 flex justify-between items-center px-4 md:px-10 relative z-10">
               <button onClick={() => { setActiveRitual(null); setSelectedDeck(null); }} className="text-slate-100 text-[10px] md:text-xs uppercase tracking-[0.4em] hover:text-[#d4af37] transition-all flex items-center gap-2 group font-black">
                 <span className="group-hover:-translate-x-1 transition-transform">←</span> Temple
               </button>
               <h2 className="text-3xl md:text-6xl font-serif gold-text italic tracking-wider drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] px-4">
                 {activeRitual.title}
               </h2>
               <div className="flex items-center gap-6">
                 {selectedDeck && (
                    <div className="hidden sm:flex flex-col items-end group">
                       <span className="text-[9px] text-slate-300 uppercase tracking-widest font-black opacity-60">Inner Eye</span>
                       <div className="crystal-orb scale-[0.5] -mr-8 -mt-8 animate-float group-hover:scale-[0.6] transition-transform">
                          <div className="orb-mist"></div>
                       </div>
                    </div>
                 )}
               </div>
             </div>

             {!selectedDeck ? (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 max-w-6xl mx-auto mt-10 md:mt-20 animate-fade-in-up px-4 md:px-12 pb-20 relative z-10">
                 {(Object.keys(DECKS) as DeckType[]).map((deckName) => (
                   <div 
                    key={deckName} 
                    onClick={() => selectDeck(deckName)}
                    className="glass-card group p-8 md:p-12 rounded-[3.5rem] md:rounded-[5rem] cursor-pointer border-2 border-[#d4af37]/20 hover:border-[#d4af37] transition-all duration-700 overflow-hidden relative flex flex-col items-center shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
                   >
                     <div className={`absolute inset-0 bg-gradient-to-b ${DECKS[deckName].accent} opacity-10 group-hover:opacity-50 transition-opacity`}></div>
                     <div className="aspect-[2/3] w-full max-w-[240px] mx-auto rounded-[2rem] md:rounded-[3rem] overflow-hidden border-4 border-[#d4af37]/40 mb-8 md:mb-12 shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative z-10 preserve-3d">
                        <LuxuryCardBack deckType={deckName} />
                     </div>
                     <h3 className="text-3xl md:text-4xl font-serif gold-text mb-4 relative z-10 italic">{deckName}</h3>
                     <p className="text-xs md:text-sm text-slate-100 font-light leading-relaxed relative z-10 text-center px-4 md:px-6 mb-8 md:mb-12 italic opacity-80 group-hover:opacity-100">
                        "{DECKS[deckName].desc}"
                     </p>
                     <div className="mt-auto px-10 py-4 border-2 border-[#d4af37]/60 text-[10px] md:text-[12px] font-black uppercase tracking-[0.6em] group-hover:bg-[#d4af37] group-hover:text-midnight transition-all rounded-full relative z-10 shadow-2xl bg-midnight/60">Invoke</div>
                   </div>
                 ))}
               </div>
             ) : isRitualLoading ? (
               <div className="flex-1 flex flex-col items-center justify-center space-y-16 relative z-10 pb-20">
                 <div className="w-40 h-40 md:w-64 md:h-64 relative">
                    <div className="crystal-orb w-full h-full scale-125 md:scale-150 animate-float opacity-80">
                       <div className="orb-mist"></div>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <p className="text-3xl md:text-5xl font-serif gold-text animate-pulse italic tracking-[0.1em]">The Veil is Lifting...</p>
                    <p className="text-[10px] text-[#d4af37] uppercase tracking-[0.5em] font-black opacity-60">The spirits are aligning</p>
                 </div>
               </div>
             ) : reading ? (
               <div className="flex-1 flex flex-col space-y-16 md:space-y-32 pb-20 relative z-10 overflow-hidden">
                 <div className={`flex flex-wrap justify-center gap-8 md:gap-14 px-4 md:px-10 max-w-[110rem] mx-auto transition-opacity duration-1000 ${showInterpretation ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    {reading.cards.map((card, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => revealCard(idx)}
                        className={`
                          relative w-52 h-80 md:w-72 md:h-[28rem] lg:w-80 lg:h-[32rem] rounded-[2.5rem] md:rounded-[3.5rem] cursor-pointer preserve-3d card-transition
                          ${card.isRevealed ? 'rotate-y-180 scale-105 shadow-[0_0_100px_rgba(212,175,55,0.4)]' : 'hover:scale-105 hover:-translate-y-4 shadow-[0_30px_60px_rgba(212,175,55,0.4)]'}
                        `}
                      >
                        <div className="absolute inset-0 backface-hidden rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden">
                           <LuxuryCardBack deckType={reading.deckType} />
                           <div className="absolute inset-0 bg-midnight/10 flex items-center justify-center rounded-[inherit] overflow-hidden">
                             {card.isGeneratingImage && (
                               <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-6 z-20">
                                  <div className="w-10 h-10 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
                                  <span className="text-[10px] gold-text uppercase tracking-[0.4em] font-black animate-pulse">Invoking</span>
                               </div>
                             )}
                           </div>
                        </div>
                        <div className={`absolute inset-0 rotate-y-180 backface-hidden rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden ${DECKS[reading.deckType].cardColor} shadow-[0_0_120px_rgba(0,0,0,1)]`}>
                           {card.base64Image ? (
                             <div className="w-full h-full relative group">
                                <img 
                                  src={`data:image/png;base64,${card.base64Image}`} 
                                  className="w-full h-full object-cover transition-transform duration-[30s] group-hover:scale-110" 
                                  alt={card.name} 
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/30 to-transparent p-6 md:p-10 flex flex-col items-center">
                                   <h4 className="text-xl md:text-3xl font-serif font-black gold-foil uppercase tracking-[0.2em] text-center drop-shadow-[0_4px_8px_rgba(0,0,0,1)]">
                                     {card.name}
                                   </h4>
                                   <span className="mt-3 text-[9px] md:text-[11px] text-white/90 uppercase tracking-[0.5em] font-black drop-shadow-lg">{card.positionName}</span>
                                </div>
                             </div>
                           ) : (
                             <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                <div className="text-5xl text-[#d4af37] animate-pulse">✦</div>
                             </div>
                           )}
                        </div>
                      </div>
                    ))}
                 </div>

                 {showInterpretation && (
                   <div className="max-w-7xl mx-auto glass-card rounded-[4rem] md:rounded-[6rem] p-12 md:p-32 animate-fade-in-up border-4 border-[#d4af37]/40 relative overflow-hidden shadow-[0_0_150px_rgba(0,0,0,1)] bg-midnight/90">
                     <div className={`absolute inset-0 bg-gradient-to-br ${DECKS[reading.deckType].accent} opacity-30`}></div>
                     <div className="relative z-10">
                        <div className="text-center mb-16 md:mb-24 flex flex-col items-center gap-6">
                           <span className="text-6xl text-[#d4af37] opacity-60">✺</span>
                           <h3 className="text-3xl md:text-5xl font-serif gold-text italic tracking-tighter">Wisdom of the {reading.deckType}</h3>
                           <span className="text-[10px] md:text-sm uppercase tracking-[1em] text-[#d4af37] font-black border-b-2 border-[#d4af37]/40 pb-4 inline-block shadow-glow">Final Decree</span>
                        </div>
                        
                        <div className="flex flex-wrap justify-center gap-8 md:gap-14 mb-24 md:mb-32">
                           {reading.cards.map((card, idx) => (
                             <div key={idx} className="w-52 h-80 md:w-72 md:h-[28rem] lg:w-80 lg:h-[32rem] rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border-4 border-[#d4af37]/40 shadow-[0_0_100px_rgba(0,0,0,1)] hover:scale-105 transition-all duration-700 bg-black">
                                <img src={`data:image/png;base64,${card.base64Image}`} className="w-full h-full object-cover" alt={card.name} />
                             </div>
                           ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 text-left mb-20 md:mb-32">
                            {reading.cards.map((card, idx) => (
                              <div key={idx} className="space-y-6 p-8 md:p-14 glass-card rounded-[3rem] md:rounded-[4.5rem] border-2 border-[#d4af37]/10 hover:border-[#d4af37]/60 transition-all duration-700 group relative overflow-hidden bg-black/60 shadow-2xl">
                                <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#d4af37]/10 rounded-full blur-3xl group-hover:bg-[#d4af37]/20 transition-colors"></div>
                                <div className="flex justify-between items-center mb-6 relative z-10">
                                  <div className="flex flex-col">
                                    <h4 className="gold-text text-sm md:text-lg uppercase tracking-[0.4em] font-black">{card.positionName}</h4>
                                    <div className="h-0.5 w-12 bg-[#d4af37]/40 mt-1"></div>
                                  </div>
                                  <span className="text-white text-xs md:text-sm font-serif italic tracking-[0.2em] opacity-60">{card.name}</span>
                                </div>
                                <p className="text-lg md:text-xl text-slate-100 font-light leading-relaxed italic opacity-95 group-hover:opacity-100 transition-opacity relative z-10">
                                  "{card.interpretation}"
                                </p>
                              </div>
                            ))}
                        </div>
                        <div className="pt-20 md:pt-32 border-t-2 border-[#d4af37]/40 flex flex-col items-center">
                            <div className="crystal-orb mb-16 animate-float scale-125 md:scale-150">
                               <div className="orb-mist"></div>
                            </div>
                            <h3 className="text-4xl md:text-7xl font-serif gold-text mb-12 italic text-center tracking-tighter drop-shadow-2xl">The Oracle's Synthesis</h3>
                            <p className="text-2xl md:text-4xl text-slate-100 font-light leading-relaxed max-w-5xl mx-auto text-center italic drop-shadow-[0_15px_40px_rgba(0,0,0,1)] px-6">
                              "{reading.overallInterpretation}"
                            </p>
                            <div className="mt-24 md:mt-36 flex justify-center items-center gap-12">
                               <div className="hidden md:block w-40 lg:w-64 h-px bg-gradient-to-r from-transparent via-[#d4af37]/60 to-[#d4af37]"></div>
                               <button 
                                onClick={() => { setActiveRitual(null); setSelectedDeck(null); }}
                                className="px-14 md:px-24 py-5 md:py-8 bg-midnight border-2 border-[#d4af37]/60 text-[#d4af37] rounded-full text-[10px] md:text-sm font-black uppercase tracking-[0.6em] hover:bg-[#d4af37] hover:text-midnight hover:scale-110 transition-all shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
                               >
                                Close the Portal
                               </button>
                               <div className="hidden md:block w-40 lg:w-64 h-px bg-gradient-to-l from-transparent via-[#d4af37]/60 to-[#d4af37]"></div>
                            </div>
                        </div>
                     </div>
                   </div>
                 )}
               </div>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center py-24 relative z-10">
                  <div className="absolute top-0 opacity-10 animate-spin-slow pointer-events-none scale-150">
                     <svg width="600" height="600" viewBox="0 0 100 100" className="text-[#d4af37]">
                        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.05" strokeDasharray="1,2"/>
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="4,8"/>
                     </svg>
                  </div>
                  <p className="text-slate-100 font-serif italic text-3xl md:text-5xl mb-20 animate-pulse tracking-[0.05em] px-6">
                    Pick your cards from the ether...
                  </p>
                  <div className="flex flex-wrap justify-center gap-6 md:gap-10 mt-10 animate-fade-in-up px-6 md:px-24 max-w-[100rem] mx-auto">
                    {Array.from({ length: 22 }).map((_, i) => (
                        <div 
                          key={i} 
                          onClick={() => selectCard(i)}
                          className={`
                            relative w-28 h-44 md:w-40 md:h-64 lg:w-48 lg:h-72 rounded-2xl cursor-pointer transition-all duration-700 shadow-2xl preserve-3d
                            ${selectedCardIndices.includes(i) ? '-translate-y-80 opacity-0 pointer-events-none scale-50 rotate-12' : 'hover:-translate-y-12 hover:rotate-6 hover:shadow-[0_30px_60px_rgba(212,175,55,0.4)]'}
                          `}
                        >
                          <LuxuryCardBack deckType={selectedDeck} />
                        </div>
                    ))}
                  </div>
               </div>
             )}
          </div>
        ) : state.soulmateProfile ? (
          <div className="w-full max-w-5xl animate-fade-in bg-[#050b1a]/80 backdrop-blur-xl border border-[#d4af37]/30 rounded-[3rem] p-8 md:p-16 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-[#d4af37] to-indigo-500"></div>
             
             <div className="flex flex-col lg:flex-row gap-12">
               <div className="lg:w-1/3 space-y-8">
                 <div className="aspect-square rounded-2xl overflow-hidden border-4 border-double border-[#d4af37]/50 shadow-2xl">
                   <img src={`data:${state.soulmateProfile.image.mimeType};base64,${state.soulmateProfile.image.base64}`} alt="Soulmate Portrait" className="w-full h-full object-cover" />
                 </div>
                 <div className="text-center p-6 glass-card rounded-2xl border-pink-500/20">
                   <h3 className="text-pink-500 text-xs uppercase tracking-[0.3em] font-bold mb-2">Initials of Your Soulmate</h3>
                   <p className="text-5xl font-serif gold-text">{state.soulmateProfile.initials}</p>
                   <p className="text-xs text-slate-400 mt-4 leading-relaxed">These unique letters will appear in unexpected places, guiding you toward love. Trust the signs.</p>
                 </div>
               </div>

               <div className="lg:w-2/3 space-y-10">
                 <div className="border-b border-white/10 pb-6">
                    <h2 className="text-4xl font-serif gold-text mb-4 italic">Your Destiny Profile</h2>
                    <p className="text-slate-400 text-sm tracking-wide">Calculated through celestial alignment and the stars of your birth.</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <section>
                     <h4 className="text-[#d4af37] text-xs uppercase tracking-widest font-bold mb-2">Astrological Sign</h4>
                     <p className="text-slate-200 text-sm leading-relaxed">{state.soulmateProfile.zodiac}</p>
                   </section>
                   <section>
                     <h4 className="text-[#d4af37] text-xs uppercase tracking-widest font-bold mb-2">Aura Description</h4>
                     <p className="text-slate-200 text-sm leading-relaxed">{state.soulmateProfile.aura}</p>
                   </section>
                   <section>
                     <h4 className="text-[#d4af37] text-xs uppercase tracking-widest font-bold mb-2">Personality Traits</h4>
                     <p className="text-slate-200 text-sm leading-relaxed">{state.soulmateProfile.personality}</p>
                   </section>
                   <section>
                     <h4 className="text-[#d4af37] text-xs uppercase tracking-widest font-bold mb-2">Spiritual Alignment</h4>
                     <p className="text-slate-200 text-sm leading-relaxed">{state.soulmateProfile.spiritualAlignment}</p>
                   </section>
                 </div>

                 <div className="p-8 glass-card rounded-[2rem] border-amber-500/10 space-y-6">
                    <div>
                      <h4 className="gold-text text-xs uppercase tracking-widest font-bold mb-2">Spirit Animal</h4>
                      <p className="text-slate-200 text-sm italic">"{state.soulmateProfile.spiritAnimal}"</p>
                    </div>
                    <div>
                      <h4 className="gold-text text-xs uppercase tracking-widest font-bold mb-2">When & Where</h4>
                      <p className="text-slate-200 text-sm leading-relaxed font-light">{state.soulmateProfile.timingLocation}</p>
                    </div>
                 </div>

                 <div className="pt-8 text-center border-t border-white/5">
                    <h3 className="text-2xl font-serif gold-text mb-4 italic">Conclusion</h3>
                    <p className="text-slate-400 text-sm leading-relaxed italic max-w-xl mx-auto mb-10">
                      {state.soulmateProfile.conclusion}
                    </p>
                    <button onClick={() => setState(prev => ({ ...prev, soulmateProfile: null }))} className="text-[#d4af37] text-xs uppercase tracking-widest hover:underline">Clear this Vision</button>
                 </div>
               </div>
             </div>
          </div>
        ) : (
          <div className="text-center max-w-3xl animate-fade-in-up px-6">
            <h1 className="text-6xl md:text-9xl font-serif mb-8 gold-text italic tracking-tighter">Divine Guidance</h1>
            <p className="text-xl md:text-3xl font-light text-slate-300 tracking-wide max-w-3xl mx-auto leading-relaxed px-6 italic">
              Unlock the secrets of the cosmos through starlight and ancient wisdom.
            </p>
            <div className="mt-16 flex justify-center">
              <div className="w-2 h-40 bg-gradient-to-b from-[#d4af37] to-transparent shadow-[0_0_20px_rgba(212,175,55,0.6)]"></div>
            </div>
          </div>
        )}
      </header>

      {isSoulmateWizardOpen && (
        <div className="fixed inset-0 z-[100] bg-midnight/95 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="w-full max-w-xl glass-card rounded-[4rem] p-12 border-4 border-[#d4af37]/40 animate-scale-in shadow-[0_0_100px_rgba(0,0,0,0.8)]">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-serif gold-text italic">Soulmate Ritual</h3>
              <button onClick={() => setIsSoulmateWizardOpen(false)} className="text-slate-400 hover:text-white transition-colors text-xl">✕</button>
            </div>
            <form onSubmit={handleSoulmateMatch} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[12px] uppercase tracking-[0.3em] text-[#d4af37] font-black">Date of Birth</label>
                <input required type="date" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-base focus:outline-none focus:border-[#d4af37] transition-all" 
                  value={soulmateFormData.dob} onChange={e => setSoulmateFormData({...soulmateFormData, dob: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] uppercase tracking-[0.3em] text-[#d4af37] font-black">Place of Birth</label>
                <input required type="text" placeholder="City, Country" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-base focus:outline-none focus:border-[#d4af37] transition-all" 
                  value={soulmateFormData.pob} onChange={e => setSoulmateFormData({...soulmateFormData, pob: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] uppercase tracking-[0.3em] text-[#d4af37] font-black">Time of Birth</label>
                <input required type="time" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-base focus:outline-none focus:border-[#d4af37] transition-all" 
                  value={soulmateFormData.tob} onChange={e => setSoulmateFormData({...soulmateFormData, tob: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] uppercase tracking-[0.3em] text-[#d4af37] font-black">Seeking</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-base focus:outline-none focus:border-[#d4af37] transition-all appearance-none"
                  value={soulmateFormData.preference} onChange={e => setSoulmateFormData({...soulmateFormData, preference: e.target.value})}>
                  <option value="man">A Man</option>
                  <option value="woman">A Woman</option>
                  <option value="other">A Celestial Essence</option>
                </select>
              </div>
              <button type="submit" className="w-full py-5 bg-[#d4af37] text-midnight font-black uppercase tracking-[0.5em] rounded-full mt-10 hover:shadow-[0_0_50px_rgba(212,175,55,0.6)] transition-all transform hover:scale-105">
                Invoke the Stars
              </button>
            </form>
          </div>
        </div>
      )}

      {activeOracleConsultation && (
        <LiveOracleSession oracleName={activeOracleConsultation} onClose={() => setActiveOracleConsultation(null)} />
      )}

      <section id={SECTIONS.SPREADS} className="py-20 md:py-32 px-4 md:px-8 max-w-[100rem] mx-auto">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-4xl md:text-5xl font-serif gold-text mb-6 tracking-[0.2em] uppercase">Sacred Spreads</h2>
          <p className="text-slate-400 uppercase tracking-[0.4em] text-xs font-bold">The mapping of your journey</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {SPREADS_DEFAULTS.map((s) => (
            <div key={s.id} className="glass-card p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] group cursor-pointer gold-glow-hover transition-all duration-700 border-2 border-[#d4af37]/10">
              <div className="aspect-[3/4] mb-8 md:mb-10 overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border-2 border-[#d4af37]/30 relative mx-auto w-[90%] shadow-2xl">
                <img src={spreadImages[s.id]} alt={s.title} className="w-full h-full object-cover grayscale-[0.6] group-hover:grayscale-0 transition-all duration-1000 scale-100 group-hover:scale-110" />
                <div className="absolute inset-0 bg-midnight/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-8 md:p-10">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={el => { spreadInputRefs.current[s.id] = el; }}
                    onChange={(e) => e.target.files && handleSpreadImageUpload(s.id, e.target.files[0])}
                  />
                  <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        spreadInputRefs.current[s.id]?.click();
                    }}
                    className="bg-[#d4af37] text-midnight text-[10px] md:text-[11px] font-black uppercase tracking-widest px-6 md:px-8 py-2 md:py-3 rounded-full mb-4 hover:scale-110 transition-transform shadow-lg"
                  >
                    Custom Artifact
                  </button>
                </div>
              </div>
              <div className="text-center px-4">
                <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-[#d4af37] font-black">{s.type}</span>
                <h3 className="text-2xl md:text-3xl font-serif mt-4 mb-4 md:mb-5 text-slate-100">{s.title}</h3>
                <p className="text-xs md:text-sm text-slate-400 font-light leading-relaxed mb-8 md:mb-10 italic">"{s.desc}"</p>
                <button 
                  onClick={() => startRitual(s)}
                  className="w-full py-4 md:py-5 rounded-full border-2 border-[#d4af37]/40 text-[10px] md:text-[12px] font-black uppercase tracking-[0.5em] hover:bg-[#d4af37] hover:text-midnight transition-all shadow-xl bg-midnight/40"
                >
                  Begin Ritual
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id={SECTIONS.ORACLES} className="py-32 bg-gradient-to-b from-transparent via-[#d4af37]/5 to-transparent">
        <div className="max-w-7xl mx-auto px-10">
          <div className="text-center mb-28">
            <h2 className="text-5xl font-serif gold-text mb-6 tracking-[0.2em] uppercase italic">Sacred Portals</h2>
            <p className="text-slate-400 uppercase tracking-[0.4em] text-xs font-bold">Communion with the High Oracles</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
            {ORACLE_DEFAULTS.map((o) => (
              <div key={o.name} className="flex flex-col items-center text-center group">
                <div className="relative w-72 h-72 md:w-full aspect-square mb-12">
                  <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#d4af37]/30 group-hover:rotate-180 transition-transform duration-[15s] ease-linear"></div>
                  <div className="absolute inset-6 rounded-full overflow-hidden border-4 border-[#d4af37] relative shadow-[0_0_80px_rgba(212,175,55,0.3)]">
                    <img src={oracleImages[o.name]} alt={o.name} className="w-full h-full object-cover scale-105 group-hover:scale-125 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-midnight/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-8">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={el => { oracleInputRefs.current[o.name] = el; }}
                        onChange={(e) => e.target.files && handleOracleImageUpload(o.name, e.target.files[0])}
                      />
                      <button 
                        onClick={() => oracleInputRefs.current[o.name]?.click()}
                        className="bg-[#d4af37] text-midnight text-[11px] font-black uppercase tracking-widest px-8 py-3 rounded-full mb-4 hover:scale-110 transition-transform shadow-lg"
                      >
                        New Essence
                      </button>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#d4af37] text-midnight text-[11px] font-black uppercase tracking-[0.4em] px-10 py-3 rounded-full shadow-2xl z-20">Awakened</div>
                </div>
                <h3 className="text-4xl font-serif gold-text mb-2 tracking-tight italic">{o.name}</h3>
                <p className="text-sm text-slate-400 mt-2 mb-6 italic tracking-widest">{o.title}</p>
                <p className="text-xs text-slate-500 max-w-[240px] mb-10 leading-relaxed font-light">"{o.desc}"</p>
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => setActiveOracleConsultation(o.name)}
                    className="px-14 py-4 bg-slate-100 text-midnight text-[11px] font-black uppercase tracking-[0.6em] rounded-full hover:bg-[#d4af37] transition-all shadow-2xl"
                  >
                    Consult the Oracle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id={SECTIONS.SOULMATE} className="py-40 px-8">
        <div className="max-w-6xl mx-auto glass-card rounded-[3rem] md:rounded-[5rem] p-12 md:p-36 relative overflow-hidden text-center shadow-[0_50px_150px_rgba(0,0,0,0.8)] border-4 border-pink-500/20">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-500/10 rounded-full blur-[150px]"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[150px]"></div>
          <div className="mb-14 inline-flex items-center justify-center w-24 h-24 md:w-32 md:h-32 rounded-full bg-pink-500/10 text-pink-500 border-4 border-pink-500/30 animate-pulse shadow-[0_0_60px_rgba(236,72,153,0.4)]">
            <svg className="w-12 h-12 md:w-16 md:h-16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-4xl md:text-8xl font-serif gold-text mb-8 md:mb-10 italic tracking-tight">The Star-Bound</h2>
          <p className="text-lg md:text-3xl text-slate-200 font-light max-w-4xl mx-auto leading-relaxed mb-12 md:mb-20 italic px-4">
            Is your future written in the celestial currents? Align your birth coordinates and discover the soul destined to walk with you.
          </p>
          <button 
            onClick={() => setIsSoulmateWizardOpen(true)}
            className="px-14 md:px-24 py-5 md:py-8 bg-gradient-to-r from-pink-700 to-indigo-800 text-white rounded-full text-[10px] md:text-sm font-black uppercase tracking-[0.6em] shadow-[0_30px_70px_rgba(0,0,0,0.6)] hover:scale-110 hover:shadow-pink-500/40 transition-all border-2 border-white/20"
          >
            Find Your Match
          </button>
        </div>
      </section>

      <section id={SECTIONS.VOID} className="py-40 px-4 md:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-16 md:mb-24">
            <h2 className="text-5xl md:text-8xl font-serif gold-text mb-8 italic tracking-tighter">The Void</h2>
            <p className="text-lg md:text-2xl text-slate-300 font-light tracking-wide max-w-3xl mx-auto leading-relaxed italic">
              A dedicated space for conjuring visions from the ether. Speak your truth and watch the stars align.
            </p>
          </div>
          <div className="w-full max-w-4xl mx-auto">
             <PromptBar 
                prompt={prompt}
                setPrompt={setPrompt}
                onAction={handleAction}
                isLoading={state.isLoading}
                mode={state.currentImage ? AppMode.EDIT : AppMode.CREATE}
                uploadedImage={uploadedImage}
                onUpload={(file) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                     const res = reader.result as string;
                     const matches = res.match(/^data:(.+);base64,(.+)$/);
                     if (matches) setUploadedImage({ mimeType: matches[1], base64: matches[2] });
                  };
                  reader.readAsDataURL(file);
                }}
                onClearUpload={() => setUploadedImage(null)}
              />
          </div>
          <div className="mt-16 md:mt-24 flex flex-col items-center">
            {state.isLoading && (
              <div className="w-full max-w-2xl">
                <LoadingOracle message="The spirits are weaving your vision..." />
              </div>
            )}
            {!state.isLoading && state.currentImage && (
              <div className="w-full max-w-2xl animate-fade-in space-y-8">
                 <ImageDisplay 
                    image={state.currentImage} 
                    onDownload={() => {}}
                    onReset={() => setState(s => ({...s, currentImage: null}))}
                  />
                  <p className="text-sm italic text-amber-200/60 uppercase tracking-widest">A celestial vision has been conjured</p>
              </div>
            )}
            {!state.isLoading && !state.currentImage && (
              <div className="py-20 opacity-10">
                 <div className="w-32 h-32 border-4 border-dashed border-[#d4af37]/30 rounded-full animate-spin-slow"></div>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="py-20 text-center border-t border-white/5 opacity-40">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#d4af37] to-amber-200 flex items-center justify-center text-midnight font-bold">C</div>
          <span className="font-serif text-sm tracking-[0.4em] gold-text uppercase">Celestial Arcana</span>
          <p className="text-[10px] uppercase tracking-widest">© Sacred Knowledge 2025</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
