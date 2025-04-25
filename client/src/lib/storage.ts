import { JournalEntry, MoodHistoryEntry, DailyTip, User, Language } from "@/types";

// Utility to check if localStorage is available
const isLocalStorageAvailable = () => {
  try {
    const test = 'test';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

// Local storage keys
const KEYS = {
  USER: 'mindmirror_user',
  JOURNAL: 'mindmirror_journal',
  MOOD_HISTORY: 'mindmirror_mood_history',
  DAILY_TIPS: 'mindmirror_daily_tips',
  LANGUAGE: 'mindmirror_language'
};

// User functions
export const getUser = (): User | null => {
  if (!isLocalStorageAvailable()) return null;
  
  const userString = localStorage.getItem(KEYS.USER);
  if (!userString) return null;
  
  try {
    return JSON.parse(userString);
  } catch (e) {
    console.error('Error parsing user from localStorage:', e);
    return null;
  }
};

export const saveUser = (user: User): void => {
  if (!isLocalStorageAvailable()) return;
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
};

export const updateUserLanguage = (language: Language): void => {
  if (!isLocalStorageAvailable()) return;
  
  const user = getUser();
  if (user) {
    user.language = language;
    saveUser(user);
  }
  
  localStorage.setItem(KEYS.LANGUAGE, language);
};

// Journal entry functions
export const getJournalEntries = (): JournalEntry[] => {
  if (!isLocalStorageAvailable()) return [];
  
  const entriesString = localStorage.getItem(KEYS.JOURNAL);
  if (!entriesString) return [];
  
  try {
    return JSON.parse(entriesString);
  } catch (e) {
    console.error('Error parsing journal entries from localStorage:', e);
    return [];
  }
};

export const saveJournalEntry = (entry: Omit<JournalEntry, 'id'>): JournalEntry => {
  if (!isLocalStorageAvailable()) throw new Error('LocalStorage not available');
  
  const entries = getJournalEntries();
  const newEntry = {
    ...entry,
    id: Date.now(),
  };
  
  entries.push(newEntry);
  localStorage.setItem(KEYS.JOURNAL, JSON.stringify(entries));
  
  return newEntry;
};

// Mood history functions
export const getMoodHistory = (): MoodHistoryEntry[] => {
  if (!isLocalStorageAvailable()) return [];
  
  const historyString = localStorage.getItem(KEYS.MOOD_HISTORY);
  if (!historyString) return [];
  
  try {
    return JSON.parse(historyString);
  } catch (e) {
    console.error('Error parsing mood history from localStorage:', e);
    return [];
  }
};

export const saveMoodEntry = (entry: MoodHistoryEntry): void => {
  if (!isLocalStorageAvailable()) return;
  
  const history = getMoodHistory();
  history.push(entry);
  localStorage.setItem(KEYS.MOOD_HISTORY, JSON.stringify(history));
};

// Daily tips functions
export const getDailyTips = (): DailyTip[] => {
  if (!isLocalStorageAvailable()) return [];
  
  const tipsString = localStorage.getItem(KEYS.DAILY_TIPS);
  if (!tipsString) return [];
  
  try {
    return JSON.parse(tipsString);
  } catch (e) {
    console.error('Error parsing daily tips from localStorage:', e);
    return [];
  }
};

export const saveDailyTip = (tip: Omit<DailyTip, 'id'>): DailyTip => {
  if (!isLocalStorageAvailable()) throw new Error('LocalStorage not available');
  
  const tips = getDailyTips();
  const newTip = {
    ...tip,
    id: Date.now(),
  };
  
  tips.push(newTip);
  localStorage.setItem(KEYS.DAILY_TIPS, JSON.stringify(tips));
  
  return newTip;
};

// Sync functions for when online
export const syncWithServer = async (): Promise<boolean> => {
  try {
    // Get local data
    const journal = getJournalEntries();
    const moodHistory = getMoodHistory();
    const dailyTips = getDailyTips();
    
    // Sync with server when online
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        journal,
        moodHistory,
        dailyTips
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to sync with server');
    }
    
    return true;
  } catch (error) {
    console.error('Error syncing with server:', error);
    return false;
  }
};

// Initialize user if none exists
export const initializeUser = (): User => {
  let user = getUser();
  if (!user) {
    user = {
      id: 1,
      name: 'User',
      language: 'en'
    };
    saveUser(user);
  }
  return user;
};
