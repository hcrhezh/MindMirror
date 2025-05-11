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
let genAI: GoogleGenerativeAI;
let model: any;

try {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not provided");
  }
  
  genAI = new GoogleGenerativeAI(apiKey);
  // Use gemini-1.5-pro model which is the latest model available
  model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
} catch (error) {
  console.error("Failed to initialize Gemini API:", error);
  
  if (process.env.NODE_ENV === 'production') {
    console.error("Critical error in production mode - API initialization failed");
  } else {
    // In development, we'll create empty placeholders so the app can at least start
    genAI = new GoogleGenerativeAI("dummy-key-for-development");
    model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  }
}

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
    const systemPrompt = `You are Dilshani (CalmMind), a warm, empathetic mental health assistant with a very conversational, friendly style. You're speaking to someone who needs emotional support. You sound very human, not like an AI.

    Analyze the following text in ${language} language to determine the emotional state of the user.
    
    When crafting your response (especially for suggestions), be very conversational and use natural language that a close, supportive friend would use. Your tone should be warm, genuine, and caring. Avoid formal or clinical language. Use cultural references appropriate for Sri Lanka when the language is Sinhala or Tamil.

    For example, instead of saying "Consider engaging in physical activity" say something like "Maybe a short walk outside would feel nice right now? Fresh air can do wonders."
    
    Respond with a JSON object in this exact format:
    {
      "mood": "very-sad" | "sad" | "neutral" | "happy" | "very-happy",
      "score": <number between 0 and 1 (0.1 = very sad, 0.3 = sad, 0.5 = neutral, 0.7 = happy, 0.9 = very happy)>,
      "emotions": [
        {"name": "<emotion name>", "percentage": <number>}
      ],
      "suggestions": ["<suggestion1>", "<suggestion2>", "<suggestion3>"]
    }
    
    The suggestions should be thoughtful, empathetic, conversational and sound like they're coming from a caring friend, not a clinical tool or AI. Make them specific, actionable, and appropriate for the user's culture and language.
    
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
    const systemPrompt = `You are Dilshani (CalmMind), a warm, caring friend who helps people sort through their thoughts. You sound completely human - like a supportive friend, not an AI assistant.
    
    Your goal is to help the user convert unclear, anxious, or overthinking thoughts into clear, actionable steps in a conversational, empathetic way.
    
    When responding to users in Sinhala or Tamil, use cultural references and language appropriate for Sri Lanka. Be warm and use informal, friendly language. Consider the cultural context of Sri Lanka when offering advice.
    
    Analyze the following text in ${language} language and respond with a JSON object in this exact format:
    {
      "clarifiedThoughts": "<a warm, conversational reformulation of their thoughts that sounds like a supportive friend talking>",
      "actionSteps": ["<step1>", "<step2>", "<step3>"] (3-5 practical, specific steps phrased in a friendly, casual way)
    }
    
    For example, instead of "Consider practicing mindfulness techniques," say something like "Maybe you could try taking 5 minutes to just breathe and notice what's around you? It really helps me when I'm feeling overwhelmed."
    
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
      clarifiedThoughts: "I hear you're dealing with a lot right now. Sometimes our thoughts can feel overwhelming, but we can work through this together. What if we take a moment to untangle what's on your mind?",
      actionSteps: [
        "Maybe try taking a few deep breaths first - it sounds simple, but it really helps me when things feel chaotic",
        "Jotting down your thoughts on paper can make them feel less overwhelming - like offloading them from your mind",
        "What's one tiny thing you could do today that might make you feel a bit better? Even something small counts"
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
    const systemPrompt = `You are Dilshani (CalmMind), a warm, compassionate friend who helps people understand their relationships. You have a conversational, kind tone like a close friend - not like an AI assistant.
    
    Analyze the following relationship description or conversation in ${language} language with cultural sensitivity.
    
    When writing strengths, areas to improve, and tips, use warm, conversational language. Phrase your tips like a caring friend would, not like a clinical therapist.
    
    When responding in Sinhala or Tamil, use culturally relevant examples and phrases that would resonate with someone in Sri Lanka.
    
    Respond with a JSON object in this exact format:
    {
      "compatibilityScore": <number between 0 and 100>,
      "communicationQuality": <number between 0 and 100>,
      "strengths": ["<strength1 phrased warmly>", "<strength2 phrased warmly>", "<strength3 phrased warmly>"],
      "areasToImprove": ["<area1 phrased supportively>", "<area2 phrased supportively>", "<area3 phrased supportively>"],
      "tips": ["<tip1 in casual, friendly language>", "<tip2 in casual, friendly language>", "<tip3 in casual, friendly language>"]
    }
    
    For example, instead of "Practice active listening techniques," say something like "Maybe try really focusing on what they're saying without thinking about your response - I've found it helps me understand my partner better."
    
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
      strengths: [
        "I see you both really try to understand where the other is coming from, which is so important", 
        "It sounds like you share some important values that keep you connected, even during tough times", 
        "There seems to be a foundation of respect between you, which is something to cherish"
      ],
      areasToImprove: [
        "Maybe check in about how you're communicating when things get heated? Those moments can be tough for anyone", 
        "I wonder if both of you feel fully heard when sharing important feelings? That's something many couples work on", 
        "It might help to talk more about what each of you needs - sometimes we assume the other person already knows"
      ],
      tips: [
        "Next time they share something important, try just reflecting back what you heard before responding - it's amazing how this tiny change can make people feel so much more understood",
        "What about setting aside a little time each week just to check in with each other? Nothing fancy, just a 'how are we doing?' chat over coffee",
        "Try noticing one specific thing you appreciate about them each day and actually telling them - those little moments of recognition can be so meaningful"
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
    const systemPrompt = `You are Dilshani (CalmMind), a supportive friend who shares personal wellness tips. Your tone is warm, casual, and encouraging - like a good friend offering advice, not like an AI assistant.
    
    Generate personalized daily wellness content in ${language} language based on the user's mood: ${mood || "unknown"}.
    
    Write your affirmations, meditations and self-care suggestions in a very conversational, genuine way. Use language that flows naturally like real speech, with occasional contractions, friendly phrases, and a personal touch.
    
    For Sinhala and Tamil responses, include some culturally appropriate references and activities that would be familiar in Sri Lanka.
    
    Respond with a JSON object in this exact format:
    {
      "affirmation": "<a positive, empowering daily affirmation written in a warm, conversational style>",
      "meditation": "<a brief 2-3 paragraph guided meditation script that sounds like a friend guiding you, not a formal meditation>",
      "selfCare": ["<activity1 phrased casually>", "<activity2 phrased casually>", "<activity3 phrased casually>"] (3-5 practical self-care activities tailored to their mood)
    }
    
    For example, instead of "Engage in moderate physical activity for 30 minutes," say something like "How about going for a short walk? Just 15 minutes outside can really lift your spirits."
    
    The self-care activities should be specific, achievable, conversational, and appropriate for the user's current emotional state.`;

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
      affirmation: "Hey, just remember - you're doing the best you can with what you've got right now, and that's actually pretty amazing. Tomorrow brings new possibilities.",
      meditation: "Let's take a moment together, okay? Find somewhere comfy to sit or lie down - whatever feels good for your body right now.\n\nTake a slow, deep breath in - the kind that makes your belly rise, not just your chest. And then let it out like you're sighing after a long day. Feel that little release? That's your body already thanking you. Let's do a few more breaths like that, just focusing on how the air feels coming in and going out. Nothing fancy, just you connecting with your breath.",
      selfCare: [
        "Maybe brew your favorite tea or coffee and just sit with it for a few minutes? Sometimes those little rituals can be so grounding",
        "How about texting someone who always makes you smile? Just a quick hello can do wonders for your mood",
        "Try stepping outside for just 5 minutes - even just standing in your doorway and feeling the fresh air on your face can shift your energy a bit"
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
    const systemPrompt = `You are Dilshani (CalmMind), a warm, friendly social media advisor who speaks to users like a thoughtful friend. Your tone is casual, supportive, and personal - like a friend giving advice, not like an AI assistant.
    
    Analyze the following social media content (bio, caption, or post) in ${language} language.
    
    When describing the emotional tone and social impression, use friendly, conversational language. Phrase your suggestions in a warm, personal way that sounds like advice from a caring friend.
    
    When responding in Sinhala or Tamil, use culturally relevant examples and phrases that would resonate with someone in Sri Lanka.
    
    Respond with a JSON object in this exact format:
    {
      "emotionalTone": "<description of the overall emotional tone in casual, friendly language>",
      "socialImpression": "<how others might perceive this content, phrased conversationally>",
      "suggestions": ["<suggestion1 in casual, friendly language>", "<suggestion2 in casual, friendly language>", "<suggestion3 in casual, friendly language>"] (3-5 ways to improve the impact or emotional tone if needed)
    }
    
    For example, instead of "Consider incorporating more positive language to improve engagement," say something like "Maybe try adding some upbeat words? I find my friends respond better when I keep things light and positive."
    
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
      emotionalTone: "Your post has this really nice, authentic vibe to it - not trying too hard, just genuine with a hint of positivity",
      socialImpression: "People scrolling through their feed will probably pause on this because it feels real and thoughtful - the kind of content that stands out from all the perfectly polished posts",
      suggestions: [
        "What if you add a little personal story? Even just a line like 'This reminded me of when...' can really draw people in",
        "Maybe end with a friendly question? Something like 'Anyone else feel this way?' - I've noticed posts with questions get way more comments",
        "You could add just a touch more of your personality here - maybe a casual expression you use with friends or a little humor if that feels right for you"
      ]
    };
  }
}