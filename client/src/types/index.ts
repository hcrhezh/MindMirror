export type Language = 'en' | 'si' | 'ta' | 'hi' | 'es' | 'ar';

export type LanguageOption = {
  code: Language;
  name: string;
  nativeName: string;
};

export type Mood = 'very-sad' | 'sad' | 'neutral' | 'happy' | 'very-happy';

export type MoodEmoji = {
  mood: Mood;
  emoji: string;
  label: string;
  score: number;
};

export type MoodHistoryEntry = {
  date: string;
  mood: Mood;
  score: number;
  journalEntry?: string;
};

export type Emotion = {
  name: string;
  percentage: number;
};

export type MoodAnalysis = {
  mood: Mood;
  score: number;
  emotions: Emotion[];
  suggestions: string[];
};

export type JournalEntry = {
  id: number;
  date: string;
  text: string;
  mood?: Mood;
  moodScore?: number;
  emotions?: Emotion[];
  language: Language;
  userId: number;
};

export type RelationshipAnalysis = {
  compatibilityScore: number;
  communicationQuality: number;
  strengths: string[];
  areasToImprove: string[];
  tips: string[];
};

export type DailyTip = {
  id: number;
  date: string;
  affirmation: string;
  meditation?: string;
  selfCare: string[];
  mood?: Mood;
  language: Language;
  userId: number;
};

export type User = {
  id: number;
  name: string;
  language: Language;
};
