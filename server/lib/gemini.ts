import { GoogleGenerativeAI } from "@google/generative-ai";
import type { 
  Mood, 
  MoodAnalysis, 
  RelationshipAnalysis, 
  Emotion 
} from "../../client/src/types";

// Initialize the Google Generative AI
const apiKey = process.env.GEMINI_API_KEY;

// Enhanced debugging for API key issues
console.log("Gemini API Key check: ", apiKey ? "API key is set" : "API key is NOT set");
if (apiKey) {
  // Just show a partially masked version of the key for debugging
  const maskedKey = apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length - 4);
  console.log("API Key format (masked):", maskedKey);
} else {
  console.error("GEMINI_API_KEY environment variable not set. API calls will fail.");
}

// Initialize the Google Generative AI SDK
const genAI = new GoogleGenerativeAI(apiKey || "");
// Use gemini-1.5-pro model which is the latest model available
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Test the API key at startup
async function testApiKey() {
  if (!apiKey) {
    console.error("No Gemini API key to test - skipping test");
    return;
  }
  
  try {
    console.log("Testing Gemini API key...");
    const prompt = "Hello, respond with a short greeting";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("✅ Gemini API key is valid and working properly!");
  } catch (error: any) {
    console.error("❌ Gemini API key test failed:", error.message);
    console.error("Error details:", error);
  }
}

// Run the test
testApiKey();

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
      "score": <number between 0 and 1 (0.1 = very sad, 0.3 = sad, 0.5 = neutral, 0.7 = happy, 0.9 = very happy)>,
      "emotions": [
        {"name": "<emotion name>", "percentage": <number>}
      ],
      "suggestions": ["<suggestion1>", "<suggestion2>", "<suggestion3>"]
    }
    
    The suggestions should be thoughtful, empathetic and actionable steps to help the user feel better or maintain their positive state.
    
    User Text: ${text}`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const resultText = response.text();
    
    // Extract JSON from response - Gemini sometimes adds markdown formatting
    const jsonMatch = resultText.match(/```json\n([\s\S]*?)\n```/) || 
                      resultText.match(/```\n([\s\S]*?)\n```/) ||
                      resultText.match(/({[\s\S]*})/);
    
    let parsedResult = {};
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        parsedResult = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse JSON from Gemini response", e);
        parsedResult = {};
      }
    } else {
      try {
        // Try to parse the entire response as JSON
        parsedResult = JSON.parse(resultText);
      } catch (e) {
        console.error("Failed to parse full response from Gemini as JSON", e);
        parsedResult = {};
      }
    }
    
    const result_typed = parsedResult as any;
    
    return {
      mood: result_typed.mood || "neutral",
      score: result_typed.score || 0.5,
      emotions: result_typed.emotions || [],
      suggestions: result_typed.suggestions || []
    };
  } catch (error) {
    console.error("Error analyzing mood with Gemini:", error);
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
      "clarifiedThoughts": "<a clear, empathetic reformulation of their thoughts>",
      "actionSteps": ["<step1>", "<step2>", "<step3>"] (3-5 practical, specific steps the user can take)
    }
    
    User Text: ${text}`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const resultText = response.text();
    
    // Extract JSON from response - Gemini sometimes adds markdown formatting
    const jsonMatch = resultText.match(/```json\n([\s\S]*?)\n```/) || 
                      resultText.match(/```\n([\s\S]*?)\n```/) ||
                      resultText.match(/({[\s\S]*})/);
    
    let parsedResult = {};
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        parsedResult = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse JSON from Gemini response", e);
        parsedResult = {};
      }
    } else {
      try {
        // Try to parse the entire response as JSON
        parsedResult = JSON.parse(resultText);
      } catch (e) {
        console.error("Failed to parse full response from Gemini as JSON", e);
        parsedResult = {};
      }
    }
    
    const result_typed = parsedResult as any;
    
    return {
      clarifiedThoughts: result_typed.clarifiedThoughts || "I understand you're experiencing some complex thoughts. Let's break them down together.",
      actionSteps: result_typed.actionSteps || [
        "Take a moment to breathe and gather your thoughts",
        "Write down specifically what's bothering you",
        "Consider what small step you can take today"
      ]
    };
  } catch (error) {
    console.error("Error clarifying thoughts with Gemini:", error);
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
      "compatibilityScore": <number between 0 and 100>,
      "communicationQuality": <number between 0 and 100>,
      "strengths": ["<strength1>", "<strength2>", "<strength3>"],
      "areasToImprove": ["<area1>", "<area2>", "<area3>"],
      "tips": ["<tip1>", "<tip2>", "<tip3>"]
    }
    
    The tips should be practical, specific advice for improving the relationship or communication.
    
    User Text: ${text}`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const resultText = response.text();
    
    // Extract JSON from response - Gemini sometimes adds markdown formatting
    const jsonMatch = resultText.match(/```json\n([\s\S]*?)\n```/) || 
                      resultText.match(/```\n([\s\S]*?)\n```/) ||
                      resultText.match(/({[\s\S]*})/);
    
    let parsedResult = {};
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        parsedResult = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse JSON from Gemini response", e);
        parsedResult = {};
      }
    } else {
      try {
        // Try to parse the entire response as JSON
        parsedResult = JSON.parse(resultText);
      } catch (e) {
        console.error("Failed to parse full response from Gemini as JSON", e);
        parsedResult = {};
      }
    }
    
    const result_typed = parsedResult as any;
    
    return {
      compatibilityScore: result_typed.compatibilityScore || 50,
      communicationQuality: result_typed.communicationQuality || 50,
      strengths: result_typed.strengths || ["Understanding of each other's perspectives", "Shared values and interests", "Mutual respect"],
      areasToImprove: result_typed.areasToImprove || ["Communication during disagreements", "Active listening", "Expression of needs"],
      tips: result_typed.tips || [
        "Practice active listening by repeating back what you heard",
        "Schedule regular check-ins about your relationship",
        "Express appreciation for specific things the other person does"
      ]
    };
  } catch (error) {
    console.error("Error analyzing relationship with Gemini:", error);
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
      "affirmation": "<a positive, empowering daily affirmation>",
      "meditation": "<a brief 2-3 paragraph guided meditation script>",
      "selfCare": ["<activity1>", "<activity2>", "<activity3>"] (3-5 practical self-care activities tailored to their mood)
    }
    
    The self-care activities should be specific, achievable, and appropriate for the user's current emotional state.`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const resultText = response.text();
    
    // Extract JSON from response - Gemini sometimes adds markdown formatting
    const jsonMatch = resultText.match(/```json\n([\s\S]*?)\n```/) || 
                      resultText.match(/```\n([\s\S]*?)\n```/) ||
                      resultText.match(/({[\s\S]*})/);
    
    let parsedResult = {};
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        parsedResult = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse JSON from Gemini response", e);
        parsedResult = {};
      }
    } else {
      try {
        // Try to parse the entire response as JSON
        parsedResult = JSON.parse(resultText);
      } catch (e) {
        console.error("Failed to parse full response from Gemini as JSON", e);
        parsedResult = {};
      }
    }
    
    const result_typed = parsedResult as any;
    
    return {
      affirmation: result_typed.affirmation || "I embrace each day with an open heart and mind, allowing myself to grow through both challenges and joys.",
      meditation: result_typed.meditation || "Find a comfortable position and close your eyes. Take a deep breath in through your nose, filling your lungs completely, and then exhale slowly through your mouth. Feel the tension leaving your body with each exhale.\n\nFocus on the present moment, acknowledging your thoughts without judgment. With each breath, imagine a peaceful energy flowing through your body, bringing calm and clarity to your mind.",
      selfCare: result_typed.selfCare || [
        "Take a 10-minute walk outside, focusing on the sensations around you",
        "Write down three things you're grateful for today",
        "Drink a glass of water and enjoy a nutritious snack mindfully"
      ]
    };
  } catch (error) {
    console.error("Error generating daily tips with Gemini:", error);
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
      "emotionalTone": "<description of the overall emotional tone>",
      "socialImpression": "<how others might perceive this content>",
      "suggestions": ["<suggestion1>", "<suggestion2>", "<suggestion3>"] (3-5 ways to improve the impact or emotional tone if needed)
    }
    
    The suggestions should be helpful, specific, and supportive.
    
    User Text: ${text}`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const resultText = response.text();
    
    // Extract JSON from response - Gemini sometimes adds markdown formatting
    const jsonMatch = resultText.match(/```json\n([\s\S]*?)\n```/) || 
                      resultText.match(/```\n([\s\S]*?)\n```/) ||
                      resultText.match(/({[\s\S]*})/);
    
    let parsedResult = {};
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        parsedResult = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse JSON from Gemini response", e);
        parsedResult = {};
      }
    } else {
      try {
        // Try to parse the entire response as JSON
        parsedResult = JSON.parse(resultText);
      } catch (e) {
        console.error("Failed to parse full response from Gemini as JSON", e);
        parsedResult = {};
      }
    }
    
    const result_typed = parsedResult as any;
    
    return {
      emotionalTone: result_typed.emotionalTone || "Neutral with slight positive undertones",
      socialImpression: result_typed.socialImpression || "Readers are likely to perceive you as thoughtful and genuine.",
      suggestions: result_typed.suggestions || [
        "Consider adding more personal warmth to create deeper connections",
        "Try incorporating a thoughtful question to engage your audience",
        "Adding a specific detail about your experience can make the content more relatable"
      ]
    };
  } catch (error) {
    console.error("Error analyzing social media with Gemini:", error);
    return {
      emotionalTone: "Neutral with slight positive undertones",
      socialImpression: "Readers are likely to perceive you as thoughtful and genuine.",
      suggestions: [
        "Consider adding more personal warmth to create deeper connections",
        "Try incorporating a thoughtful question to engage your audience",
        "Adding a specific detail about your experience can make the content more relatable"
      ]
    };
  }
}