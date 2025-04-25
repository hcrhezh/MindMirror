import type { 
  Mood, 
  MoodAnalysis, 
  RelationshipAnalysis
} from "../types";

/**
 * Analyzes the user's mood from text input and/or selected mood using Gemini API
 */
export async function analyzeMood(
  text: string, 
  selectedMood: Mood | null, 
  selectedMoodScore: number,
  language: string
): Promise<MoodAnalysis> {
  const response = await fetch('/api/analyze/mood', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      selectedMood,
      selectedMoodScore,
      language
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to analyze mood');
  }
  
  return response.json();
}

/**
 * Clarifies unclear or anxious thoughts into clear action steps using Gemini API
 */
export async function clarifyThoughts(
  text: string,
  language: string
): Promise<{
  clarifiedThoughts: string;
  actionSteps: string[];
}> {
  const response = await fetch('/api/analyze/thoughts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      language
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to clarify thoughts');
  }
  
  return response.json();
}

/**
 * Analyzes relationship dynamics from chat-style input using Gemini API
 */
export async function analyzeRelationship(
  text: string,
  language: string
): Promise<RelationshipAnalysis> {
  const response = await fetch('/api/analyze/relationship', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      language
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to analyze relationship');
  }
  
  return response.json();
}

/**
 * Generates personalized daily affirmations, meditation scripts, and self-care tips using Gemini API
 */
export async function generateDailyTips(
  mood: string,
  language: string
): Promise<{
  affirmation: string;
  meditation: string;
  selfCare: string[];
}> {
  const response = await fetch('/api/generate/daily-tips', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mood,
      language
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to generate daily tips');
  }
  
  return response.json();
}

/**
 * Analyzes social media content using Gemini API
 */
export async function analyzeSocialMedia(
  text: string,
  language: string
): Promise<{
  emotionalTone: string;
  socialImpression: string;
  suggestions: string[];
}> {
  const response = await fetch('/api/analyze/social-media', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      language
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to analyze social media content');
  }
  
  return response.json();
}