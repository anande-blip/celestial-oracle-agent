
export interface GeneratedImage {
  base64: string;
  mimeType: string;
  timestamp: number;
}

export interface UploadedImage {
  base64: string;
  mimeType: string;
}

export type DeckType = 'Rider-Waite' | 'Tarot de Marseille' | 'Thoth';

export interface TarotCard {
  name: string;
  interpretation: string;
  positionName: string;
  isRevealed: boolean;
  base64Image?: string;
  isGeneratingImage?: boolean;
}

export interface TarotReading {
  cards: TarotCard[];
  overallInterpretation: string;
  deckType: DeckType;
}

export interface SoulmateProfile {
  image: GeneratedImage;
  initials: string;
  zodiac: string;
  aura: string;
  personality: string;
  spiritualAlignment: string;
  spiritAnimal: string;
  career: string;
  mission: string;
  timingLocation: string;
  meetingDetails: string;
  pastLife: string;
  tarotCompatibility: string;
  spiritualSymbols: string;
  conclusion: string;
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  currentImage: GeneratedImage | null;
  soulmateProfile: SoulmateProfile | null;
}

export enum AppMode {
  CREATE = 'CREATE',
  EDIT = 'EDIT'
}
