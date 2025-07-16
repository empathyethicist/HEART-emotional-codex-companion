import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Emotion Codex Entry Schema
export const emotionEntries = pgTable("emotion_entries", {
  id: serial("id").primaryKey(),
  referenceCode: text("reference_code").notNull().unique(),
  emotionFamily: text("emotion_family").notNull(),
  variant: text("variant"),
  definition: text("definition").notNull(),
  intensityMin: integer("intensity_min").notNull(),
  intensityMax: integer("intensity_max").notNull(),
  culturalUniversality: text("cultural_universality").notNull(),
  variants: jsonb("variants").$type<Record<string, any>>(),
  blendableWith: jsonb("blendable_with").$type<string[]>(),
  triggers: jsonb("triggers").$type<string[]>(),
  intensityMarkers: jsonb("intensity_markers").$type<Record<string, string[]>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// CMOP (Codex Mapping Output Packet) Schema
export const cmopEntries = pgTable("cmop_entries", {
  id: serial("id").primaryKey(),
  emid: text("emid").notNull().unique(),
  inputPhrase: text("input_phrase").notNull(),
  emotionFamily: text("emotion_family").notNull(),
  variant: text("variant"),
  codexReference: text("codex_reference").notNull(),
  intensity: integer("intensity").notNull(), // stored as integer (0-100)
  blendableWith: jsonb("blendable_with").$type<string[]>(),
  symbolicReference: text("symbolic_reference"),
  culturalTag: text("cultural_tag"),
  confidence: integer("confidence").notNull(), // stored as integer (0-100)
  salAnalysis: jsonb("sal_analysis").$type<{
    symbolicPatterns: string[];
    archetype: string;
    reasoning: string;
  }>(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Processing Session Schema
export const processingSessions = pgTable("processing_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  emotionsProcessed: integer("emotions_processed").default(0),
  successfulMatches: integer("successful_matches").default(0),
  manualEntries: integer("manual_entries").default(0),
  avgConfidence: integer("avg_confidence").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertEmotionEntrySchema = createInsertSchema(emotionEntries).omit({
  id: true,
  createdAt: true,
});

export const insertCmopEntrySchema = createInsertSchema(cmopEntries).omit({
  id: true,
  timestamp: true,
});

export const insertProcessingSessionSchema = createInsertSchema(processingSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type EmotionEntry = typeof emotionEntries.$inferSelect;
export type InsertEmotionEntry = z.infer<typeof insertEmotionEntrySchema>;
export type CmopEntry = typeof cmopEntries.$inferSelect;
export type InsertCmopEntry = z.infer<typeof insertCmopEntrySchema>;
export type ProcessingSession = typeof processingSessions.$inferSelect;
export type InsertProcessingSession = z.infer<typeof insertProcessingSessionSchema>;

// API Response Types
export const emotionProcessingRequestSchema = z.object({
  inputPhrase: z.string().min(1, "Input phrase is required"),
  culturalContext: z.string().optional().default("Western (Generic)"),
  processingMode: z.enum(["Developer Mode", "Therapist Mode", "Research Mode"]).optional().default("Developer Mode"),
});

export const emotionProcessingResponseSchema = z.object({
  emid: z.string(),
  inputPhrase: z.string(),
  emotionFamily: z.string(),
  variant: z.string().optional(),
  codexReference: z.string(),
  intensity: z.number().min(0).max(1),
  blendableWith: z.array(z.string()),
  symbolicReference: z.string().optional(),
  culturalTag: z.string(),
  confidence: z.number().min(0).max(1),
  salAnalysis: z.object({
    symbolicPatterns: z.array(z.string()),
    archetype: z.string(),
    reasoning: z.string(),
  }).optional(),
  timestamp: z.string(),
});

export type EmotionProcessingRequest = z.infer<typeof emotionProcessingRequestSchema>;
export type EmotionProcessingResponse = z.infer<typeof emotionProcessingResponseSchema>;

// Manual Entry Schema
export const manualEntrySchema = z.object({
  emotionFamily: z.string().min(1, "Emotion family is required"),
  variantName: z.string().min(1, "Variant name is required"),
  definition: z.string().min(10, "Definition must be at least 10 characters"),
  intensityMin: z.number().min(0).max(1),
  intensityMax: z.number().min(0).max(1),
  triggers: z.array(z.string()).min(1, "At least one trigger is required"),
  blendableWith: z.array(z.string()),
  culturalModifiers: z.string().optional(),
  symbolicInterpretation: z.string().optional(),
});

export type ManualEntry = z.infer<typeof manualEntrySchema>;
