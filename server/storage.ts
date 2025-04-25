import { User, InsertUser, JournalEntry, InsertJournalEntry, MoodHistory, InsertMoodHistory, DailyTip, InsertDailyTip } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private journalEntries: Map<number, JournalEntry>;
  private moodHistories: Map<number, MoodHistory>;
  private dailyTips: Map<number, DailyTip>;
  
  private userIdCounter: number;
  private journalIdCounter: number;
  private moodHistoryIdCounter: number;
  private dailyTipIdCounter: number;

  constructor() {
    this.users = new Map();
    this.journalEntries = new Map();
    this.moodHistories = new Map();
    this.dailyTips = new Map();
    
    this.userIdCounter = 1;
    this.journalIdCounter = 1;
    this.moodHistoryIdCounter = 1;
    this.dailyTipIdCounter = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now 
    };
    this.users.set(id, user);
    return user;
  }
  
  // Journal entry operations
  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    return this.journalEntries.get(id);
  }
  
  async getJournalEntriesByUserId(userId: number): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values()).filter(
      (entry) => entry.userId === userId
    );
  }
  
  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const id = this.journalIdCounter++;
    const now = new Date();
    const entry: JournalEntry = {
      ...insertEntry,
      id,
      createdAt: now
    };
    this.journalEntries.set(id, entry);
    return entry;
  }
  
  // Mood history operations
  async getMoodHistory(id: number): Promise<MoodHistory | undefined> {
    return this.moodHistories.get(id);
  }
  
  async getMoodHistoryByUserId(userId: number): Promise<MoodHistory[]> {
    return Array.from(this.moodHistories.values()).filter(
      (history) => history.userId === userId
    );
  }
  
  async createMoodHistory(insertHistory: InsertMoodHistory): Promise<MoodHistory> {
    const id = this.moodHistoryIdCounter++;
    const now = new Date();
    const history: MoodHistory = {
      ...insertHistory,
      id,
      createdAt: now
    };
    this.moodHistories.set(id, history);
    return history;
  }
  
  // Daily tips operations
  async getDailyTip(id: number): Promise<DailyTip | undefined> {
    return this.dailyTips.get(id);
  }
  
  async getDailyTipsByUserId(userId: number): Promise<DailyTip[]> {
    return Array.from(this.dailyTips.values()).filter(
      (tip) => tip.userId === userId
    );
  }
  
  async createDailyTip(insertTip: InsertDailyTip): Promise<DailyTip> {
    const id = this.dailyTipIdCounter++;
    const now = new Date();
    const tip: DailyTip = {
      ...insertTip,
      id,
      createdAt: now
    };
    this.dailyTips.set(id, tip);
    return tip;
  }
}

export const storage = new MemStorage();
