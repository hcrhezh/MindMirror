import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Language, LanguageOption } from '@/types';

export const languages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' }
];

// Translations for common UI elements
export const translations: Record<Language, Record<string, string>> = {
  en: {
    appName: 'MindMirror',
    greeting: 'Hello',
    howAreYou: 'How are you feeling today?',
    selectMood: 'Select your mood:',
    verySad: 'Very Sad',
    sad: 'Sad',
    neutral: 'Neutral',
    happy: 'Happy',
    veryHappy: 'Very Happy',
    expressThoughts: 'Express your thoughts',
    voice: 'Voice',
    journalPlaceholder: 'Tell Sanasa how you\'re feeling today...',
    analyzeMood: 'Analyze My Mood',
    moodAnalysis: 'Mood Analysis',
    negative: 'Negative',
    positive: 'Positive',
    primaryEmotions: 'Primary emotions detected:',
    personalizedSuggestions: 'Personalized Suggestions',
    moodHistory: 'Your Mood History',
    lastDays: 'Last 7 days',
    talkToSanasa: 'Talk to Sanasa',
    mood: 'Mood',
    thoughts: 'Thoughts',
    relations: 'Relations',
    dailyTips: 'Daily Tips',
    welcome: 'Welcome to MindMirror',
    aiAssistant: 'Your AI-powered mental health assistant',
    trackMood: 'Track Your Mood',
    aiAnalysis: 'AI analysis of your emotions and thoughts',
    clarifyThoughts: 'Clarify Your Thoughts',
    anxiousToAction: 'Turn anxious thoughts into clear action steps',
    dailyWellness: 'Daily Wellness Guide',
    personalizedTips: 'Personalized tips and affirmations',
    getStarted: 'Get Started',
    learnMore: 'Learn More'
  },
  si: {
    appName: 'මනස් දර්පණය',
    greeting: 'ආයුබෝවන්',
    howAreYou: 'අද ඔබ කොහොමද දැනෙන්නේ?',
    selectMood: 'ඔබේ මනෝභාවය තෝරන්න:',
    verySad: 'ඉතා දුකයි',
    sad: 'දුකයි',
    neutral: 'මධ්යස්ථයි',
    happy: 'සතුටුයි',
    veryHappy: 'ඉතා සතුටුයි',
    expressThoughts: 'ඔබේ අදහස් ප්‍රකාශ කරන්න',
    voice: 'හඬ',
    journalPlaceholder: 'අද ඔබ කොහොමද දැනෙන්නේ කියලා සනාසට කියන්න...',
    analyzeMood: 'මගේ මනෝභාවය විශ්ලේෂණය කරන්න',
    moodAnalysis: 'මනෝභාව විශ්ලේෂණය',
    negative: 'ප්‍රතිකූල',
    positive: 'ධනාත්මක',
    primaryEmotions: 'අනාවරණය කරගත් ප්‍රාථමික හැඟීම්:',
    personalizedSuggestions: 'පුද්ගලීකරණය කළ යෝජනා',
    moodHistory: 'ඔබේ මනෝභාව ඉතිහාසය',
    lastDays: 'අවසාන දින 7',
    talkToSanasa: 'සනාස සමඟ කතා කරන්න',
    mood: 'මනෝභාවය',
    thoughts: 'සිතුවිලි',
    relations: 'සබඳතා',
    dailyTips: 'දෛනික ඉඟි',
    welcome: 'මනස් දර්පණයට සාදරයෙන් පිළිගනිමු',
    aiAssistant: 'ඔබේ AI-බලගැන්වූ මානසික සෞඛ්‍ය සහායක',
    trackMood: 'ඔබේ මනෝභාවය නිරීක්ෂණය කරන්න',
    aiAnalysis: 'AI වලින් ඔබේ හැඟීම් සහ සිතුවිලි විශ්ලේෂණය',
    clarifyThoughts: 'ඔබේ සිතුවිලි පැහැදිලි කරන්න',
    anxiousToAction: 'කනස්සල්ලදායක සිතුවිලි පැහැදිලි ක්‍රියාමාර්ග බවට පත් කරන්න',
    dailyWellness: 'දෛනික සුබසාධන මාර්ගෝපදේශය',
    personalizedTips: 'පුද්ගලීකරණය කළ ඉඟි සහ තහවුරු කිරීම්',
    getStarted: 'ආරම්භ කරන්න',
    learnMore: 'තව දැනගන්න'
  },
  ta: {
    appName: 'மைண்ட்மிரர்',
    greeting: 'வணக்கம்',
    howAreYou: 'இன்று நீங்கள் எப்படி உணர்கிறீர்கள்?',
    selectMood: 'உங்கள் மனநிலையைத் தேர்ந்தெடுக்கவும்:',
    verySad: 'மிகவும் சோகமாக',
    sad: 'சோகமாக',
    neutral: 'நடுநிலை',
    happy: 'மகிழ்ச்சி',
    veryHappy: 'மிகவும் மகிழ்ச்சி',
    expressThoughts: 'உங்கள் எண்ணங்களை வெளிப்படுத்துங்கள்',
    voice: 'குரல்',
    journalPlaceholder: 'இன்று உங்களுக்கு எப்படி உணர்கிறது என்பதை சனாசாவிடம் சொல்லுங்கள்...',
    analyzeMood: 'என் மனநிலையை ஆராய்',
    moodAnalysis: 'மனநிலை பகுப்பாய்வு',
    negative: 'எதிர்மறை',
    positive: 'நேர்மறை',
    primaryEmotions: 'கண்டறியப்பட்ட முதன்மை உணர்வுகள்:',
    personalizedSuggestions: 'தனிப்பயனாக்கப்பட்ட பரிந்துரைகள்',
    moodHistory: 'உங்கள் மனநிலை வரலாறு',
    lastDays: 'கடந்த 7 நாட்கள்',
    talkToSanasa: 'சனாசாவுடன் பேசுங்கள்',
    mood: 'மனநிலை',
    thoughts: 'எண்ணங்கள்',
    relations: 'உறவுகள்',
    dailyTips: 'தினசரி குறிப்புகள்',
    welcome: 'மைண்ட்மிரருக்கு வரவேற்கிறோம்',
    aiAssistant: 'உங்கள் AI-இயக்கப்படும் மன ஆரோக்கிய உதவியாளர்',
    trackMood: 'உங்கள் மனநிலையைக் கண்காணிக்கவும்',
    aiAnalysis: 'உங்கள் உணர்வுகள் மற்றும் எண்ணங்களின் AI பகுப்பாய்வு',
    clarifyThoughts: 'உங்கள் எண்ணங்களை தெளிவுபடுத்துங்கள்',
    anxiousToAction: 'கவலைக்குரிய எண்ணங்களை தெளிவான செயல் படிகளாக மாற்றவும்',
    dailyWellness: 'தினசரி நல வழிகாட்டி',
    personalizedTips: 'தனிப்பயனாக்கப்பட்ட குறிப்புகள் மற்றும் உறுதிப்படுத்தல்கள்',
    getStarted: 'தொடங்குங்கள்',
    learnMore: 'மேலும் அறிக'
  },
  hi: {
    appName: 'माइंडमिरर',
    greeting: 'नमस्ते',
    howAreYou: 'आज आप कैसा महसूस कर रहे हैं?',
    selectMood: 'अपना मूड चुनें:',
    verySad: 'बहुत दुखी',
    sad: 'दुखी',
    neutral: 'तटस्थ',
    happy: 'खुश',
    veryHappy: 'बहुत खुश',
    expressThoughts: 'अपने विचार व्यक्त करें',
    voice: 'आवाज़',
    journalPlaceholder: 'सनासा को बताएं कि आज आप कैसा महसूस कर रहे हैं...',
    analyzeMood: 'मेरे मूड का विश्लेषण करें',
    moodAnalysis: 'मूड विश्लेषण',
    negative: 'नकारात्मक',
    positive: 'सकारात्मक',
    primaryEmotions: 'पता लगाई गई प्राथमिक भावनाएं:',
    personalizedSuggestions: 'व्यक्तिगत सुझाव',
    moodHistory: 'आपका मूड इतिहास',
    lastDays: 'पिछले 7 दिन',
    talkToSanasa: 'सनासा से बात करें',
    mood: 'मूड',
    thoughts: 'विचार',
    relations: 'संबंध',
    dailyTips: 'दैनिक सुझाव',
    welcome: 'माइंडमिरर में आपका स्वागत है',
    aiAssistant: 'आपका AI-संचालित मानसिक स्वास्थ्य सहायक',
    trackMood: 'अपने मूड को ट्रैक करें',
    aiAnalysis: 'आपकी भावनाओं और विचारों का AI विश्लेषण',
    clarifyThoughts: 'अपने विचारों को स्पष्ट करें',
    anxiousToAction: 'चिंताजनक विचारों को स्पष्ट कार्य चरणों में बदलें',
    dailyWellness: 'दैनिक कल्याण गाइड',
    personalizedTips: 'व्यक्तिगत सुझाव और पुष्टिकरण',
    getStarted: 'शुरू करें',
    learnMore: 'और जानें'
  },
  es: {
    appName: 'MindMirror',
    greeting: 'Hola',
    howAreYou: '¿Cómo te sientes hoy?',
    selectMood: 'Selecciona tu estado de ánimo:',
    verySad: 'Muy triste',
    sad: 'Triste',
    neutral: 'Neutral',
    happy: 'Feliz',
    veryHappy: 'Muy feliz',
    expressThoughts: 'Expresa tus pensamientos',
    voice: 'Voz',
    journalPlaceholder: 'Dile a Sanasa cómo te sientes hoy...',
    analyzeMood: 'Analizar mi estado de ánimo',
    moodAnalysis: 'Análisis del estado de ánimo',
    negative: 'Negativo',
    positive: 'Positivo',
    primaryEmotions: 'Emociones primarias detectadas:',
    personalizedSuggestions: 'Sugerencias personalizadas',
    moodHistory: 'Tu historial de estado de ánimo',
    lastDays: 'Últimos 7 días',
    talkToSanasa: 'Hablar con Sanasa',
    mood: 'Estado',
    thoughts: 'Pensamientos',
    relations: 'Relaciones',
    dailyTips: 'Consejos diarios',
    welcome: 'Bienvenido a MindMirror',
    aiAssistant: 'Tu asistente de salud mental con tecnología de IA',
    trackMood: 'Seguimiento de tu estado de ánimo',
    aiAnalysis: 'Análisis de tus emociones y pensamientos con IA',
    clarifyThoughts: 'Aclara tus pensamientos',
    anxiousToAction: 'Convierte pensamientos ansiosos en pasos de acción claros',
    dailyWellness: 'Guía diaria de bienestar',
    personalizedTips: 'Consejos personalizados y afirmaciones',
    getStarted: 'Comenzar',
    learnMore: 'Más información'
  },
  ar: {
    appName: 'مايند ميرور',
    greeting: 'مرحبا',
    howAreYou: 'كيف تشعر اليوم؟',
    selectMood: 'اختر مزاجك:',
    verySad: 'حزين جدا',
    sad: 'حزين',
    neutral: 'محايد',
    happy: 'سعيد',
    veryHappy: 'سعيد جدا',
    expressThoughts: 'عبر عن أفكارك',
    voice: 'صوت',
    journalPlaceholder: 'أخبر ساناسا كيف تشعر اليوم...',
    analyzeMood: 'تحليل مزاجي',
    moodAnalysis: 'تحليل المزاج',
    negative: 'سلبي',
    positive: 'إيجابي',
    primaryEmotions: 'المشاعر الأساسية المكتشفة:',
    personalizedSuggestions: 'اقتراحات مخصصة',
    moodHistory: 'سجل مزاجك',
    lastDays: 'آخر 7 أيام',
    talkToSanasa: 'تحدث إلى ساناسا',
    mood: 'مزاج',
    thoughts: 'أفكار',
    relations: 'علاقات',
    dailyTips: 'نصائح يومية',
    welcome: 'مرحبا بك في مايند ميرور',
    aiAssistant: 'مساعدك للصحة النفسية المدعوم بالذكاء الاصطناعي',
    trackMood: 'تتبع مزاجك',
    aiAnalysis: 'تحليل الذكاء الاصطناعي لمشاعرك وأفكارك',
    clarifyThoughts: 'توضيح أفكارك',
    anxiousToAction: 'حول الأفكار القلقة إلى خطوات عمل واضحة',
    dailyWellness: 'دليل الرفاهية اليومي',
    personalizedTips: 'نصائح وتأكيدات مخصصة',
    getStarted: 'ابدأ الآن',
    learnMore: 'تعرف على المزيد'
  }
};

// Create the context
type LanguageContextType = {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('mindmirror_language') as Language;
    return savedLanguage || 'en';
  });

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('mindmirror_language', language);
  };

  const t = (key: string): string => {
    return translations[currentLanguage][key] || translations.en[key] || key;
  };

  const contextValue = { currentLanguage, setLanguage, t };
  
  return React.createElement(
    LanguageContext.Provider,
    { value: contextValue },
    children
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};