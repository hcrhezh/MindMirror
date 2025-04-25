import { MoodAnalysis, RelationshipAnalysis, Emotion } from "@/types";

// IMPORTANT: This file has been updated to use Google's Gemini API instead of OpenAI
// We're keeping the same interface for compatibility with existing code
// The actual implementation now uses Gemini on the backend

// Function to analyze mood using Gemini (via backend API)
export async function analyzeMood(text: string, language: string): Promise<MoodAnalysis> {
  try {
    const response = await fetch('/api/analyze/mood', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, language }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to analyze mood');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error analyzing mood:', error);
    throw error;
  }
}

// Function to clarify thoughts using Gemini (via backend API)
export async function clarifyThoughts(text: string, language: string): Promise<{
  clarifiedThoughts: string;
  actionSteps: string[];
}> {
  try {
    const response = await fetch('/api/analyze/thoughts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, language }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to clarify thoughts');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error clarifying thoughts:', error);
    throw error;
  }
}

// Function to analyze relationships using Gemini (via backend API)
export async function analyzeRelationship(text: string, language: string): Promise<RelationshipAnalysis> {
  try {
    const response = await fetch('/api/analyze/relationship', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, language }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to analyze relationship');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error analyzing relationship:', error);
    throw error;
  }
}

// Function to generate daily tips
export async function generateDailyTips(mood: string, language: string): Promise<{
  affirmation: string;
  meditation: string;
  selfCare: string[];
}> {
  try {
    const response = await fetch('/api/generate/daily-tips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mood, language }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate daily tips');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating daily tips:', error);
    throw error;
  }
}

// Function to analyze social media content
export async function analyzeSocialMedia(text: string, language: string): Promise<{
  emotionalTone: string;
  socialImpression: string;
  suggestions: string[];
}> {
  try {
    const response = await fetch('/api/analyze/social-media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, language }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to analyze social media');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error analyzing social media:', error);
    throw error;
  }
}
