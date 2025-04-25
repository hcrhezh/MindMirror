import { User, InsertUser, JournalEntry, InsertJournalEntry, MoodHistory, InsertMoodHistory, DailyTip, InsertDailyTip } from "@shared/schema";
import { db } from "./db";
import { users, journalEntries, moodHistory, dailyTips } from "@shared/schema";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Journal entry operations
  getJournalEntry(id: number): Promise<JournalEntry | undefined>;
  getJournalEntriesByUserId(userId: number): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  
  // Mood history operations
  getMoodHistory(id: number): Promise<MoodHistory | undefined>;
  getMoodHistoryByUserId(userId: number): Promise<MoodHistory[]>;
  createMoodHistory(history: InsertMoodHistory): Promise<MoodHistory>;
  
  // Daily tips operations
  getDailyTip(id: number): Promise<DailyTip | undefined>;
  getDailyTipsByUserId(userId: number): Promise<DailyTip[]>;
  createDailyTip(tip: InsertDailyTip): Promise<DailyTip>;
}

// Database Storage implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Journal entry operations
  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
    return entry;
  }
  
  async getJournalEntriesByUserId(userId: number): Promise<JournalEntry[]> {
    return db.select().from(journalEntries).where(eq(journalEntries.userId, userId));
  }
  
  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const [entry] = await db.insert(journalEntries).values(insertEntry).returning();
    return entry;
  }
  
  // Mood history operations
  async getMoodHistory(id: number): Promise<MoodHistory | undefined> {
    const [history] = await db.select().from(moodHistory).where(eq(moodHistory.id, id));
    return history;
  }
  
  async getMoodHistoryByUserId(userId: number): Promise<MoodHistory[]> {
    return db.select().from(moodHistory).where(eq(moodHistory.userId, userId));
  }
  
  async createMoodHistory(insertHistory: InsertMoodHistory): Promise<MoodHistory> {
    const [history] = await db.insert(moodHistory).values(insertHistory).returning();
    return history;
  }
  
  // Daily tips operations
  async getDailyTip(id: number): Promise<DailyTip | undefined> {
    const [tip] = await db.select().from(dailyTips).where(eq(dailyTips.id, id));
    return tip;
  }
  
  async getDailyTipsByUserId(userId: number): Promise<DailyTip[]> {
    return db.select().from(dailyTips).where(eq(dailyTips.userId, userId));
  }
  
  async createDailyTip(insertTip: InsertDailyTip): Promise<DailyTip> {
    const [tip] = await db.insert(dailyTips).values(insertTip).returning();
    return tip;
  }
}

// Use database storage instead of memory storage
export const storage = new DatabaseStorage();
