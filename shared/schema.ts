import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  language: text("language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  text: text("text").notNull(),
  date: text("date").notNull(),
  mood: text("mood"),
  moodScore: integer("mood_score"),
  emotions: jsonb("emotions"),
  language: text("language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const moodHistory = pgTable("mood_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  date: text("date").notNull(),
  mood: text("mood").notNull(),
  score: integer("score").notNull(),
  journalEntryId: integer("journal_entry_id").references(() => journalEntries.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyTips = pgTable("daily_tips", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  date: text("date").notNull(),
  affirmation: text("affirmation").notNull(),
  meditation: text("meditation"),
  selfCare: jsonb("self_care").notNull(),
  mood: text("mood"),
  language: text("language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas for validation and insertion
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  language: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
  userId: true,
  text: true,
  date: true,
  mood: true,
  moodScore: true,
  emotions: true,
  language: true,
});

export const insertMoodHistorySchema = createInsertSchema(moodHistory).pick({
  userId: true,
  date: true,
  mood: true,
  score: true,
  journalEntryId: true,
});

export const insertDailyTipSchema = createInsertSchema(dailyTips).pick({
  userId: true,
  date: true,
  affirmation: true,
  meditation: true,
  selfCare: true,
  mood: true,
  language: true,
});

// Types for use in the application
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;

export type InsertMoodHistory = z.infer<typeof insertMoodHistorySchema>;
export type MoodHistory = typeof moodHistory.$inferSelect;

export type InsertDailyTip = z.infer<typeof insertDailyTipSchema>;
export type DailyTip = typeof dailyTips.$inferSelect;
