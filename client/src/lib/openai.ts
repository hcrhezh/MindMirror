import { MoodAnalysis, RelationshipAnalysis, Emotion } from "@/types";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024.
// do not change this unless explicitly requested by the user

// Mock function to analyze mood using OpenAI
// In a real implementation, this would make an API call to the backend
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

// Function to clarify thoughts
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

// Function to analyze relationships
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
