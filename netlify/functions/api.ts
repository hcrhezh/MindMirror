import express, { Express, Request, Response } from 'express';
import serverless from 'serverless-http';
import { storage } from '../../server/storage';
import { analyzeMood, clarifyThoughts, analyzeRelationship, generateDailyTips, analyzeSocialMedia } from '../../server/lib/gemini';

// Set up the Express app
const app = express();
app.use(express.json());

// Mood analysis endpoint
app.post('/api/analyze/mood', async (req, res) => {
  try {
    const { text, selectedMood, selectedMoodScore, language } = req.body;
    
    if (!text && !selectedMood) {
      return res.status(400).json({ message: 'Either text or mood selection is required' });
    }
    
    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('Missing GEMINI_API_KEY environment variable');
      return res.status(500).json({ 
        error: 'api_key_missing',
        message: 'The Gemini API key is missing. Please provide a valid API key.' 
      });
    }
    
    const analysis = await analyzeMood(text, selectedMood, selectedMoodScore, language);
    
    // Save to local storage for now (Netlify doesn't maintain session state)
    // In a production app, you'd want to use a database
    
    return res.json(analysis);
  } catch (error: any) {
    console.error('Error analyzing mood:', error);
    
    // Check if this is a Gemini API error
    if (error?.status) {
      const status = error.status;
      if (status === 401) {
        return res.status(401).json({ 
          error: 'api_key_invalid',
          message: 'Invalid API key provided. Please check your Gemini API key.' 
        });
      } else if (status === 429) {
        return res.status(429).json({ 
          error: 'rate_limit_exceeded',
          message: 'Gemini API rate limit exceeded. Please try again later.' 
        });
      } else if (status === 404) {
        return res.status(404).json({ 
          error: 'model_not_found',
          message: 'The requested Gemini model was not found. Please check the model configuration.' 
        });
      }
    }
    
    return res.status(500).json({ 
      error: 'api_error',
      message: 'Failed to analyze mood. Please try again later.' 
    });
  }
});

// Thought clarification endpoint
app.post('/api/analyze/thoughts', async (req, res) => {
  try {
    const { text, language } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('Missing GEMINI_API_KEY environment variable');
      return res.status(500).json({ 
        error: 'api_key_missing',
        message: 'The Gemini API key is missing. Please provide a valid API key.' 
      });
    }
    
    const clarifiedThoughts = await clarifyThoughts(text, language);
    return res.json(clarifiedThoughts);
  } catch (error: any) {
    console.error('Error clarifying thoughts:', error);
    
    // Check if this is a Gemini API error
    if (error?.status) {
      const status = error.status;
      if (status === 401) {
        return res.status(401).json({ 
          error: 'api_key_invalid',
          message: 'Invalid API key provided. Please check your Gemini API key.' 
        });
      } else if (status === 429) {
        return res.status(429).json({ 
          error: 'rate_limit_exceeded',
          message: 'Gemini API rate limit exceeded. Please try again later.' 
        });
      } else if (status === 404) {
        return res.status(404).json({ 
          error: 'model_not_found',
          message: 'The requested Gemini model was not found. Please check the model configuration.' 
        });
      }
    }
    
    return res.status(500).json({ 
      error: 'api_error',
      message: 'Failed to clarify thoughts. Please try again later.' 
    });
  }
});

// Relationship analysis endpoint
app.post('/api/analyze/relationship', async (req, res) => {
  try {
    const { text, language } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('Missing GEMINI_API_KEY environment variable');
      return res.status(500).json({ 
        error: 'api_key_missing',
        message: 'The Gemini API key is missing. Please provide a valid API key.' 
      });
    }
    
    const analysis = await analyzeRelationship(text, language);
    return res.json(analysis);
  } catch (error: any) {
    console.error('Error analyzing relationship:', error);
    
    // Check if this is a Gemini API error
    if (error?.status) {
      const status = error.status;
      if (status === 401) {
        return res.status(401).json({ 
          error: 'api_key_invalid',
          message: 'Invalid API key provided. Please check your Gemini API key.' 
        });
      } else if (status === 429) {
        return res.status(429).json({ 
          error: 'rate_limit_exceeded',
          message: 'Gemini API rate limit exceeded. Please try again later.' 
        });
      } else if (status === 404) {
        return res.status(404).json({ 
          error: 'model_not_found',
          message: 'The requested Gemini model was not found. Please check the model configuration.' 
        });
      }
    }
    
    return res.status(500).json({ 
      error: 'api_error',
      message: 'Failed to analyze relationship. Please try again later.' 
    });
  }
});

// Daily tips generation endpoint
app.post('/api/generate/daily-tips', async (req, res) => {
  try {
    const { mood, moodScore, language } = req.body;
    
    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('Missing GEMINI_API_KEY environment variable');
      return res.status(500).json({ 
        error: 'api_key_missing',
        message: 'The Gemini API key is missing. Please provide a valid API key.' 
      });
    }
    
    const tips = await generateDailyTips(mood, moodScore, language);
    return res.json(tips);
  } catch (error: any) {
    console.error('Error generating daily tips:', error);
    
    // Check if this is a Gemini API error
    if (error?.status) {
      const status = error.status;
      if (status === 401) {
        return res.status(401).json({ 
          error: 'api_key_invalid',
          message: 'Invalid API key provided. Please check your Gemini API key.' 
        });
      } else if (status === 429) {
        return res.status(429).json({ 
          error: 'rate_limit_exceeded',
          message: 'Gemini API rate limit exceeded. Please try again later.' 
        });
      } else if (status === 404) {
        return res.status(404).json({ 
          error: 'model_not_found',
          message: 'The requested Gemini model was not found. Please check the model configuration.' 
        });
      }
    }
    
    return res.status(500).json({ 
      error: 'api_error',
      message: 'Failed to generate daily tips. Please try again later.' 
    });
  }
});

// Social media analysis endpoint
app.post('/api/analyze/social-media', async (req, res) => {
  try {
    const { text, language } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('Missing GEMINI_API_KEY environment variable');
      return res.status(500).json({ 
        error: 'api_key_missing',
        message: 'The Gemini API key is missing. Please provide a valid API key.' 
      });
    }
    
    const analysis = await analyzeSocialMedia(text, language);
    return res.json(analysis);
  } catch (error: any) {
    console.error('Error analyzing social media:', error);
    
    // Check if this is a Gemini API error
    if (error?.status) {
      const status = error.status;
      if (status === 401) {
        return res.status(401).json({ 
          error: 'api_key_invalid',
          message: 'Invalid API key provided. Please check your Gemini API key.' 
        });
      } else if (status === 429) {
        return res.status(429).json({ 
          error: 'rate_limit_exceeded',
          message: 'Gemini API rate limit exceeded. Please try again later.' 
        });
      } else if (status === 404) {
        return res.status(404).json({ 
          error: 'model_not_found',
          message: 'The requested Gemini model was not found. Please check the model configuration.' 
        });
      }
    }
    
    return res.status(500).json({ 
      error: 'api_error',
      message: 'Failed to analyze social media content. Please try again later.' 
    });
  }
});

// Export the serverless function handler
export const handler = serverless(app);