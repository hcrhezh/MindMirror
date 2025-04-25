import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// Import from Gemini instead of OpenAI
import { analyzeMood, clarifyThoughts, analyzeRelationship, generateDailyTips, analyzeSocialMedia } from "./lib/gemini";
import { insertJournalEntrySchema, insertMoodHistorySchema, insertDailyTipSchema } from "../shared/schema";
import { z } from "zod";

// Extend Express Request type to include session
declare module 'express-serve-static-core' {
  interface Request {
    session?: {
      userId?: number;
      [key: string]: any;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
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
      
      // If user is logged in, save journal entry and mood
      if (req.session?.userId) {
        const userId = req.session.userId;
        
        // Save journal entry
        const journalEntry = await storage.createJournalEntry({
          userId,
          text,
          date: new Date().toISOString().split('T')[0],
          mood: analysis.mood,
          moodScore: analysis.score,
          emotions: analysis.emotions,
          language
        });
        
        // Save mood history
        await storage.createMoodHistory({
          userId,
          date: new Date().toISOString().split('T')[0],
          mood: analysis.mood,
          score: analysis.score,
          journalEntryId: journalEntry.id
        });
      }
      
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
      
      // If user is logged in, save journal entry
      if (req.session?.userId) {
        const userId = req.session.userId;
        
        await storage.createJournalEntry({
          userId,
          text,
          date: new Date().toISOString().split('T')[0],
          language
        });
      }
      
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
      
      // If user is logged in, save daily tip
      if (req.session?.userId) {
        const userId = req.session.userId;
        
        await storage.createDailyTip({
          userId,
          date: new Date().toISOString().split('T')[0],
          affirmation: tips.affirmation,
          meditation: tips.meditation,
          selfCare: tips.selfCare,
          mood,
          language
        });
      }
      
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
  
  // Sync data endpoint
  app.post('/api/sync', async (req, res) => {
    try {
      const { journal, moodHistory, dailyTips } = req.body;
      
      // Only process if user is logged in
      if (!req.session?.userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const userId = req.session.userId;
      
      // Process journal entries
      if (journal && journal.length) {
        for (const entry of journal) {
          await storage.createJournalEntry({
            ...entry,
            userId
          });
        }
      }
      
      // Process mood history
      if (moodHistory && moodHistory.length) {
        for (const mood of moodHistory) {
          await storage.createMoodHistory({
            ...mood,
            userId
          });
        }
      }
      
      // Process daily tips
      if (dailyTips && dailyTips.length) {
        for (const tip of dailyTips) {
          await storage.createDailyTip({
            ...tip,
            userId
          });
        }
      }
      
      return res.json({ success: true });
    } catch (error) {
      console.error('Error syncing data:', error);
      return res.status(500).json({ message: 'Failed to sync data' });
    }
  });
  
  // Get mood history endpoint
  app.get('/api/mood-history', async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const userId = req.session.userId;
      const history = await storage.getMoodHistoryByUserId(userId);
      
      return res.json(history);
    } catch (error) {
      console.error('Error fetching mood history:', error);
      return res.status(500).json({ message: 'Failed to fetch mood history' });
    }
  });
  
  // Get journal entries endpoint
  app.get('/api/journal', async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const userId = req.session.userId;
      const entries = await storage.getJournalEntriesByUserId(userId);
      
      return res.json(entries);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      return res.status(500).json({ message: 'Failed to fetch journal entries' });
    }
  });
  
  // Get daily tips endpoint
  app.get('/api/daily-tips', async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const userId = req.session.userId;
      const tips = await storage.getDailyTipsByUserId(userId);
      
      return res.json(tips);
    } catch (error) {
      console.error('Error fetching daily tips:', error);
      return res.status(500).json({ message: 'Failed to fetch daily tips' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}