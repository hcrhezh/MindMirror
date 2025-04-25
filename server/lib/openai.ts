import OpenAI from "openai";
import { Mood, MoodAnalysis, RelationshipAnalysis, Emotion } from "@shared/schema";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. 
// Do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "default_key"
});

/**
 * Analyzes the user's mood from text input and/or selected mood
 */
export async function analyzeMood(
  text: string, 
  selectedMood: Mood | null, 
  selectedMoodScore: number, 
  language: string
): Promise<MoodAnalysis> {
  try {
    // If there's no text but there is a selected mood, return based on selection
    if (!text && selectedMood) {
      const defaultEmotions: Emotion[] = [
        { name: "Primary Emotion", percentage: 65 },
        { name: "Secondary Emotion", percentage: 25 },
        { name: "Tertiary Emotion", percentage: 10 }
      ];
      
      // Return the user-selected mood
      return {
        mood: selectedMood,
        score: selectedMoodScore,
        emotions: defaultEmotions,
        suggestions: [
          "Take a moment to breathe deeply and check in with yourself.",
          "Consider journaling about why you feel this way.",
          "Connect with someone you trust about your feelings."
        ]
      };
    }

    // Prepare system prompt for the language
    const systemPrompt = `You are Sanasa (CalmMind), an empathetic AI mental health assistant who analyzes emotions and provides supportive feedback. 
    Analyze the following text in ${language} language to determine the emotional state of the user. 
    Respond with a JSON object in this exact format:
    {
      "mood": "very-sad" | "sad" | "neutral" | "happy" | "very-happy",
      "score": number between 0 and 1 (0.1 = very sad, 0.3 = sad, 0.5 = neutral, 0.7 = happy, 0.9 = very happy),
      "emotions": [
        {"name": string, "percentage": number}
      ],
      "suggestions": [string, string, string]
    }
    
    The suggestions should be thoughtful, empathetic and actionable steps to help the user feel better or maintain their positive state.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response
    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      mood: result.mood || "neutral",
      score: result.score || 0.5,
      emotions: result.emotions || [],
      suggestions: result.suggestions || []
    };
  } catch (error) {
    console.error("Error analyzing mood with OpenAI:", error);
    // Return a default response if the API fails
    return {
      mood: selectedMood || "neutral",
      score: selectedMoodScore || 0.5,
      emotions: [{ name: "Undetermined", percentage: 100 }],
      suggestions: [
        "Take a moment to breathe and reflect.",
        "Consider journaling your thoughts.",
        "Connect with a friend or loved one."
      ]
    };
  }
}

/**
 * Clarifies unclear or anxious thoughts into clear action steps
 */
export async function clarifyThoughts(
  text: string,
  language: string
): Promise<{
  clarifiedThoughts: string;
  actionSteps: string[];
}> {
  try {
    const systemPrompt = `You are Sanasa (CalmMind), an empathetic AI mental health assistant who helps clarify thoughts.
    Your goal is to help the user convert unclear, anxious, or overthinking thoughts into clear, actionable steps.
    Analyze the following text in ${language} language and respond with a JSON object in this exact format:
    {
      "clarifiedThoughts": string (a clear, empathetic reformulation of their thoughts),
      "actionSteps": [string, string, string] (3-5 practical, specific steps the user can take)
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response
    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      clarifiedThoughts: result.clarifiedThoughts || "I understand you're experiencing some complex thoughts. Let's break them down together.",
      actionSteps: result.actionSteps || [
        "Take a moment to breathe and gather your thoughts",
        "Write down specifically what's bothering you",
        "Consider what small step you can take today"
      ]
    };
  } catch (error) {
    console.error("Error clarifying thoughts with OpenAI:", error);
    return {
      clarifiedThoughts: "I understand you're experiencing some complex thoughts. Let's break them down together.",
      actionSteps: [
        "Take a moment to breathe and gather your thoughts",
        "Write down specifically what's bothering you",
        "Consider what small step you can take today"
      ]
    };
  }
}

/**
 * Analyzes relationship dynamics from chat-style input
 */
export async function analyzeRelationship(
  text: string,
  language: string
): Promise<RelationshipAnalysis> {
  try {
    const systemPrompt = `You are Sanasa (CalmMind), an empathetic AI mental health assistant who helps analyze relationships.
    Analyze the following relationship description or conversation in ${language} language.
    Respond with a JSON object in this exact format:
    {
      "compatibilityScore": number between 0 and 100,
      "communicationQuality": number between 0 and 100,
      "strengths": [string, string, string],
      "areasToImprove": [string, string, string],
      "tips": [string, string, string]
    }
    
    The tips should be practical, specific advice for improving the relationship or communication.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response
    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      compatibilityScore: result.compatibilityScore || 50,
      communicationQuality: result.communicationQuality || 50,
      strengths: result.strengths || ["Understanding of each other's perspectives", "Shared values and interests", "Mutual respect"],
      areasToImprove: result.areasToImprove || ["Communication during disagreements", "Active listening", "Expression of needs"],
      tips: result.tips || [
        "Practice active listening by repeating back what you heard",
        "Schedule regular check-ins about your relationship",
        "Express appreciation for specific things the other person does"
      ]
    };
  } catch (error) {
    console.error("Error analyzing relationship with OpenAI:", error);
    return {
      compatibilityScore: 50,
      communicationQuality: 50,
      strengths: ["Understanding of each other's perspectives", "Shared values and interests", "Mutual respect"],
      areasToImprove: ["Communication during disagreements", "Active listening", "Expression of needs"],
      tips: [
        "Practice active listening by repeating back what you heard",
        "Schedule regular check-ins about your relationship",
        "Express appreciation for specific things the other person does"
      ]
    };
  }
}

/**
 * Generates personalized daily affirmations, meditation scripts, and self-care tips
 */
export async function generateDailyTips(
  mood: string | null,
  moodScore: number | null,
  language: string
): Promise<{
  affirmation: string;
  meditation: string;
  selfCare: string[];
}> {
  try {
    const systemPrompt = `You are Sanasa (CalmMind), an empathetic AI mental health assistant.
    Generate personalized daily wellness content in ${language} language based on the user's mood: ${mood || "unknown"}.
    Respond with a JSON object in this exact format:
    {
      "affirmation": string (a positive, empowering daily affirmation),
      "meditation": string (a brief 2-3 paragraph guided meditation script),
      "selfCare": [string, string, string] (3-5 practical self-care activities tailored to their mood)
    }
    
    The self-care activities should be specific, achievable, and appropriate for the user's current emotional state.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate daily wellness content for mood: ${mood || "neutral"}` }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response
    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      affirmation: result.affirmation || "I embrace each day with an open heart and mind, allowing myself to grow through both challenges and joys.",
      meditation: result.meditation || "Find a comfortable position and close your eyes. Take a deep breath in through your nose, filling your lungs completely, and then exhale slowly through your mouth. Feel the tension leaving your body with each exhale.\n\nFocus on the present moment, acknowledging your thoughts without judgment. With each breath, imagine a peaceful energy flowing through your body, bringing calm and clarity to your mind.",
      selfCare: result.selfCare || [
        "Take a 10-minute walk outside, focusing on the sensations around you",
        "Write down three things you're grateful for today",
        "Drink a glass of water and enjoy a nutritious snack mindfully"
      ]
    };
  } catch (error) {
    console.error("Error generating daily tips with OpenAI:", error);
    return {
      affirmation: "I embrace each day with an open heart and mind, allowing myself to grow through both challenges and joys.",
      meditation: "Find a comfortable position and close your eyes. Take a deep breath in through your nose, filling your lungs completely, and then exhale slowly through your mouth. Feel the tension leaving your body with each exhale.\n\nFocus on the present moment, acknowledging your thoughts without judgment. With each breath, imagine a peaceful energy flowing through your body, bringing calm and clarity to your mind.",
      selfCare: [
        "Take a 10-minute walk outside, focusing on the sensations around you",
        "Write down three things you're grateful for today",
        "Drink a glass of water and enjoy a nutritious snack mindfully"
      ]
    };
  }
}

/**
 * Analyzes social media content
 */
export async function analyzeSocialMedia(
  text: string,
  language: string
): Promise<{
  emotionalTone: string;
  socialImpression: string;
  suggestions: string[];
}> {
  try {
    const systemPrompt = `You are Sanasa (CalmMind), an empathetic AI mental health assistant.
    Analyze the following social media content (bio, caption, or post) in ${language} language.
    Respond with a JSON object in this exact format:
    {
      "emotionalTone": string (description of the overall emotional tone),
      "socialImpression": string (how others might perceive this content),
      "suggestions": [string, string, string] (3 thoughtful suggestions for improvement if needed or reinforcement if positive)
    }
    
    Be honest but kind in your analysis. Focus on emotional aspects rather than grammar or style.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response
    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      emotionalTone: result.emotionalTone || "The content has a balanced emotional tone that reflects authenticity.",
      socialImpression: result.socialImpression || "Readers are likely to perceive you as thoughtful and genuine.",
      suggestions: result.suggestions || [
        "Consider adding more personal warmth to create deeper connections",
        "Your authentic voice shines through - continue being genuine",
        "Balance vulnerability with positivity to create relatable content"
      ]
    };
  } catch (error) {
    console.error("Error analyzing social media with OpenAI:", error);
    return {
      emotionalTone: "The content has a balanced emotional tone that reflects authenticity.",
      socialImpression: "Readers are likely to perceive you as thoughtful and genuine.",
      suggestions: [
        "Consider adding more personal warmth to create deeper connections",
        "Your authentic voice shines through - continue being genuine",
        "Balance vulnerability with positivity to create relatable content"
      ]
    };
  }
}
