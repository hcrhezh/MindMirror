import { MoodHistoryEntry, Mood, Emotion } from '@/types';
import { subDays, format } from 'date-fns';

// Common emotions by mood category
const EMOTIONS_BY_MOOD: Record<Mood, string[]> = {
  'very-sad': [
    'depressed', 'hopeless', 'grief', 'despair', 'miserable',
    'devastated', 'heartbroken', 'lonely', 'defeated'
  ],
  'sad': [
    'disappointed', 'unhappy', 'regretful', 'gloomy', 'sorrowful',
    'melancholy', 'discouraged', 'hurt', 'pessimistic'
  ],
  'neutral': [
    'calm', 'indifferent', 'reserved', 'contemplative', 'balanced',
    'steady', 'composed', 'ambivalent', 'quiet'
  ],
  'happy': [
    'pleased', 'cheerful', 'satisfied', 'content', 'optimistic',
    'joyful', 'grateful', 'relieved', 'excited'
  ],
  'very-happy': [
    'ecstatic', 'delighted', 'elated', 'thrilled', 'exhilarated',
    'overjoyed', 'euphoric', 'jubilant', 'blissful'
  ]
};

// Map of mood to score range
const MOOD_SCORE_RANGES: Record<Mood, [number, number]> = {
  'very-sad': [0.05, 0.2],
  'sad': [0.2, 0.4],
  'neutral': [0.4, 0.6],
  'happy': [0.6, 0.8],
  'very-happy': [0.8, 0.95]
};

// Generate a random number between min and max
function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Pick random emotions for a mood
function pickRandomEmotions(mood: Mood, count: number = 3): Emotion[] {
  const possibleEmotions = EMOTIONS_BY_MOOD[mood];
  const selectedEmotions: Emotion[] = [];
  
  // Shuffle array
  const shuffled = [...possibleEmotions].sort(() => 0.5 - Math.random());
  
  // Take first N emotions
  const selectedNames = shuffled.slice(0, count);
  
  // Generate percentages that sum to 100
  let remaining = 100;
  for (let i = 0; i < selectedNames.length; i++) {
    const isLast = i === selectedNames.length - 1;
    const percentage = isLast ? remaining : Math.floor(randomInRange(10, remaining - (selectedNames.length - i - 1) * 10));
    
    selectedEmotions.push({
      name: selectedNames[i],
      percentage
    });
    
    remaining -= percentage;
  }
  
  return selectedEmotions;
}

// Generate a sample mood entry for a given date
function generateMoodEntry(date: Date): MoodHistoryEntry {
  // Simulate weekday patterns (happier on weekends)
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // Mood is more likely to be positive on weekends
  const moodProbabilities: Record<Mood, number> = isWeekend 
    ? { 'very-sad': 0.05, 'sad': 0.1, 'neutral': 0.2, 'happy': 0.4, 'very-happy': 0.25 }
    : { 'very-sad': 0.1, 'sad': 0.2, 'neutral': 0.4, 'happy': 0.2, 'very-happy': 0.1 };
  
  // Randomly select mood based on probabilities
  const random = Math.random();
  let cumulativeProbability = 0;
  let selectedMood: Mood = 'neutral';
  
  for (const [mood, probability] of Object.entries(moodProbabilities) as [Mood, number][]) {
    cumulativeProbability += probability;
    if (random <= cumulativeProbability) {
      selectedMood = mood;
      break;
    }
  }
  
  // Generate score within the range for this mood
  const [min, max] = MOOD_SCORE_RANGES[selectedMood];
  const score = randomInRange(min, max);
  
  // Add a journal entry some of the time
  const hasJournalEntry = Math.random() > 0.6;
  const journalEntry = hasJournalEntry ? generateJournalEntry(selectedMood) : undefined;
  
  // Return the generated entry
  return {
    date: format(date, 'yyyy-MM-dd'),
    mood: selectedMood,
    score,
    emotions: pickRandomEmotions(selectedMood),
    journalEntry
  };
}

// Generate sample mood history for the past N days
export function generateSampleMoodHistory(days: number = 30): MoodHistoryEntry[] {
  const today = new Date();
  const history: MoodHistoryEntry[] = [];
  
  // Generate entries for a percentage of days (not every day)
  const trackingFrequency = 0.7; // 70% of days have entries
  
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    
    // Only create an entry with trackingFrequency probability
    if (Math.random() < trackingFrequency) {
      history.push(generateMoodEntry(date));
    }
  }
  
  return history;
}

// Generate sample journal entries based on mood
function generateJournalEntry(mood: Mood): string | undefined {
  const journalTemplates: Record<Mood, string[]> = {
    'very-sad': [
      "Today has been really difficult. I'm struggling to find motivation for anything.",
      "I feel completely overwhelmed and don't know how to move forward.",
      "Everything feels hopeless right now. Nothing seems to be going right."
    ],
    'sad': [
      "Feeling a bit down today. Work was stressful and I didn't accomplish what I wanted to.",
      "Not my best day. I'm disappointed about how things turned out.",
      "I'm feeling quite low today. Hoping tomorrow will be better."
    ],
    'neutral': [
      "Today was just an ordinary day. Nothing special happened.",
      "Neither good nor bad today. Just going through the motions.",
      "A regular day. Did my usual routine without much excitement."
    ],
    'happy': [
      "Had a good day today! Managed to accomplish several things on my to-do list.",
      "Feeling positive today. The weather was nice and I spent some time outdoors.",
      "Today was a good day. I enjoyed time with friends and felt productive."
    ],
    'very-happy': [
      "Amazing day! Everything went perfectly and I feel so accomplished!",
      "I'm feeling on top of the world today! So many good things happened.",
      "Today was absolutely fantastic! I can't remember the last time I felt this good."
    ]
  };
  
  const templates = journalTemplates[mood];
  return templates[Math.floor(Math.random() * templates.length)];
}

export default generateSampleMoodHistory;