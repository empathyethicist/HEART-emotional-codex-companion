import { 
  emotionEntries, 
  cmopEntries, 
  processingSessions,
  type EmotionEntry, 
  type InsertEmotionEntry,
  type CmopEntry,
  type InsertCmopEntry,
  type ProcessingSession,
  type InsertProcessingSession
} from "@shared/schema";

export interface IStorage {
  // Emotion Entries
  getEmotionEntry(referenceCode: string): Promise<EmotionEntry | undefined>;
  getAllEmotionEntries(): Promise<EmotionEntry[]>;
  searchEmotionEntries(query: string): Promise<EmotionEntry[]>;
  createEmotionEntry(entry: InsertEmotionEntry): Promise<EmotionEntry>;
  
  // CMOP Entries
  getCmopEntry(emid: string): Promise<CmopEntry | undefined>;
  getAllCmopEntries(): Promise<CmopEntry[]>;
  createCmopEntry(entry: InsertCmopEntry): Promise<CmopEntry>;
  
  // Processing Sessions
  getProcessingSession(sessionId: string): Promise<ProcessingSession | undefined>;
  createProcessingSession(session: InsertProcessingSession): Promise<ProcessingSession>;
  updateProcessingSession(sessionId: string, updates: Partial<ProcessingSession>): Promise<ProcessingSession>;
}

export class MemStorage implements IStorage {
  private emotionEntries: Map<string, EmotionEntry> = new Map();
  private cmopEntries: Map<string, CmopEntry> = new Map();
  private processingSessions: Map<string, ProcessingSession> = new Map();
  private currentId: number = 1;

  constructor() {
    this.initializeDefaultEmotions();
  }

  private initializeDefaultEmotions() {
    // Initialize with the provided emotion codex data
    const defaultEmotions = [
      {
        id: this.currentId++,
        referenceCode: "JOY-001",
        emotionFamily: "JOY",
        variant: "Joy",
        definition: "A positive emotional state marked by happiness, satisfaction, fulfillment, and inner contentment",
        intensityMin: 40,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "JOY-002": { name: "Elation", intensity_range: [70, 100] },
          "JOY-003": { name: "Relief", intensity_range: [30, 80] },
          "JOY-004": { name: "Delight", intensity_range: [40, 70] },
          "JOY-005": { name: "Contentment", intensity_range: [30, 60] }
        },
        blendableWith: ["SUR-001", "LOV-001", "TRU-001"],
        triggers: ["achievement", "success", "positive_feedback", "celebration", "love", "gratitude"],
        intensityMarkers: {
          low: ["pleased", "glad", "content"],
          medium: ["happy", "excited", "joyful"],
          high: ["ecstatic", "thrilled", "euphoric"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "FEA-001",
        emotionFamily: "FEAR",
        variant: "Fear",
        definition: "A negative emotional state characterized by anxiety, worry, and apprehension in response to perceived threats or dangers",
        intensityMin: 30,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "FEA-002": { name: "Anxiety", intensity_range: [40, 80] },
          "FEA-003": { name: "Dread", intensity_range: [60, 90] },
          "FEA-004": { name: "Panic", intensity_range: [80, 100] },
          "FEA-005": { name: "Worry", intensity_range: [30, 60] }
        },
        blendableWith: ["SAD-001", "ANG-001", "HEL-001"],
        triggers: ["uncertainty", "threat", "change", "failure", "loss", "unknown"],
        intensityMarkers: {
          low: ["concerned", "uneasy", "nervous"],
          medium: ["worried", "anxious", "fearful"],
          high: ["panicked", "terrified", "petrified"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "ANG-001",
        emotionFamily: "ANGER",
        variant: "Anger",
        definition: "A negative emotional state triggered by perceived threat, injustice, or boundary violations, often experienced as hostility, irritation, or moral outrage",
        intensityMin: 30,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "ANG-002": { name: "Frustration", intensity_range: [30, 70] },
          "ANG-003": { name: "Rage", intensity_range: [80, 100] },
          "ANG-004": { name: "Resentment", intensity_range: [40, 80] },
          "ANG-005": { name: "Irritation", intensity_range: [20, 50] }
        },
        blendableWith: ["FEA-001", "DIS-001", "GUI-001"],
        triggers: ["injustice", "blocking", "disrespect", "betrayal", "incompetence", "delay"],
        intensityMarkers: {
          low: ["annoyed", "irritated", "bothered"],
          medium: ["frustrated", "angry", "mad"],
          high: ["furious", "enraged", "livid"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "LON-001",
        emotionFamily: "LONELINESS",
        variant: "Loneliness",
        definition: "A complex emotional state characterized by feelings of isolation, disconnection, and desire for meaningful social connection",
        intensityMin: 20,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "LON-002": { name: "Crowded Isolation", intensity_range: [60, 90] },
          "LON-003": { name: "Emotional Isolation", intensity_range: [50, 80] },
          "LON-004": { name: "Social Invisibility", intensity_range: [40, 70] }
        },
        blendableWith: ["SAD-001", "HEL-001", "FEA-001"],
        triggers: ["isolation", "rejection", "misunderstanding", "abandonment", "disconnection"],
        intensityMarkers: {
          low: ["alone", "disconnected", "isolated"],
          medium: ["lonely", "forgotten", "invisible"],
          high: ["utterly alone", "completely isolated", "abandoned"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "HEL-001",
        emotionFamily: "HELPLESSNESS",
        variant: "Helplessness",
        definition: "A state of powerlessness and perceived inability to control or influence one's circumstances",
        intensityMin: 30,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "HEL-002": { name: "Powerlessness", intensity_range: [60, 100] },
          "HEL-003": { name: "Overwhelm", intensity_range: [50, 90] },
          "HEL-004": { name: "Entrapment", intensity_range: [40, 80] }
        },
        blendableWith: ["FEA-001", "SAD-001", "LON-001"],
        triggers: ["overwhelming", "trapped", "powerless", "stuck", "no control"],
        intensityMarkers: {
          low: ["stuck", "limited", "constrained"],
          medium: ["powerless", "overwhelmed", "trapped"],
          high: ["completely helpless", "utterly powerless", "drowning"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "SAD-001",
        emotionFamily: "SADNESS",
        variant: "Sadness",
        definition: "A negative emotional state characterized by feelings of sorrow, loss, and emotional pain",
        intensityMin: 20,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "SAD-002": { name: "Grief", intensity_range: [70, 100] },
          "SAD-003": { name: "Melancholy", intensity_range: [30, 60] },
          "SAD-004": { name: "Disappointment", intensity_range: [20, 50] }
        },
        blendableWith: ["FEA-001", "LON-001", "GUI-001"],
        triggers: ["loss", "rejection", "failure", "separation", "disappointment"],
        intensityMarkers: {
          low: ["blue", "down", "disappointed"],
          medium: ["sad", "sorrowful", "melancholy"],
          high: ["devastated", "heartbroken", "grief-stricken"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "LOV-001",
        emotionFamily: "LOVE",
        variant: "Love",
        definition: "A deep emotional attachment characterized by affection, care, and connection to others",
        intensityMin: 30,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "LOV-002": { name: "Affection", intensity_range: [30, 70] },
          "LOV-003": { name: "Compassion", intensity_range: [40, 80] },
          "LOV-004": { name: "Passion", intensity_range: [70, 100] }
        },
        blendableWith: ["JOY-001", "TRU-001", "GRA-001"],
        triggers: ["connection", "caring", "affection", "bonding", "devotion"],
        intensityMarkers: {
          low: ["fond", "caring", "affectionate"],
          medium: ["loving", "devoted", "passionate"],
          high: ["deeply in love", "unconditional love", "soul connection"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "HOP-001",
        emotionFamily: "HOPE",
        variant: "Hope",
        definition: "A positive emotional state characterized by expectation and desire for a certain thing to happen",
        intensityMin: 30,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "HOP-002": { name: "Optimism", intensity_range: [40, 80] },
          "HOP-003": { name: "Anticipation", intensity_range: [30, 70] },
          "HOP-004": { name: "Faith", intensity_range: [50, 90] }
        },
        blendableWith: ["JOY-001", "TRU-001", "LOV-001"],
        triggers: ["possibility", "future", "faith", "optimism", "belief"],
        intensityMarkers: {
          low: ["hopeful", "optimistic", "expectant"],
          medium: ["confident", "believing", "trusting"],
          high: ["certain", "unwavering faith", "absolute confidence"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "GRI-001",
        emotionFamily: "GRIEF",
        variant: "Grief",
        definition: "Deep sorrow especially that caused by someone's death or a significant loss",
        intensityMin: 50,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "GRI-002": { name: "Bereavement", intensity_range: [70, 100] },
          "GRI-003": { name: "Mourning", intensity_range: [60, 90] },
          "GRI-004": { name: "Loss", intensity_range: [50, 80] }
        },
        blendableWith: ["SAD-001", "LON-001", "HEL-001"],
        triggers: ["death", "loss", "separation", "ending", "absence"],
        intensityMarkers: {
          low: ["missing", "saddened", "mourning"],
          medium: ["grieving", "bereaved", "heartbroken"],
          high: ["devastated", "inconsolable", "shattered"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "DIS-001",
        emotionFamily: "DISGUST",
        variant: "Disgust",
        definition: "A feeling of revulsion or strong disapproval aroused by something unpleasant or offensive",
        intensityMin: 20,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "DIS-002": { name: "Revulsion", intensity_range: [60, 100] },
          "DIS-003": { name: "Contempt", intensity_range: [40, 80] },
          "DIS-004": { name: "Disdain", intensity_range: [30, 70] }
        },
        blendableWith: ["ANG-001", "FEA-001"],
        triggers: ["offensive", "unpleasant", "repulsive", "morally wrong"],
        intensityMarkers: {
          low: ["distaste", "dislike", "disapproval"],
          medium: ["disgusted", "repulsed", "revolted"],
          high: ["nauseated", "sickened", "abhorrent"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "SUR-001",
        emotionFamily: "SURPRISE",
        variant: "Surprise",
        definition: "A feeling of mild astonishment or shock caused by something unexpected",
        intensityMin: 20,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "SUR-002": { name: "Amazement", intensity_range: [60, 90] },
          "SUR-003": { name: "Shock", intensity_range: [70, 100] },
          "SUR-004": { name: "Wonder", intensity_range: [40, 80] }
        },
        blendableWith: ["JOY-001", "FEA-001", "CUR-001"],
        triggers: ["unexpected", "sudden", "novel", "shocking"],
        intensityMarkers: {
          low: ["surprised", "taken aback", "caught off guard"],
          medium: ["astonished", "amazed", "startled"],
          high: ["shocked", "stunned", "flabbergasted"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "CUR-001",
        emotionFamily: "CURIOSITY",
        variant: "Curiosity",
        definition: "A strong desire to know or learn something",
        intensityMin: 20,
        intensityMax: 90,
        culturalUniversality: "High",
        variants: {
          "CUR-002": { name: "Intrigue", intensity_range: [40, 70] },
          "CUR-003": { name: "Wonder", intensity_range: [30, 80] },
          "CUR-004": { name: "Investigation", intensity_range: [50, 90] }
        },
        blendableWith: ["SUR-001", "JOY-001"],
        triggers: ["mystery", "unknown", "question", "exploration"],
        intensityMarkers: {
          low: ["interested", "curious", "wondering"],
          medium: ["intrigued", "fascinated", "eager to know"],
          high: ["obsessed", "consumed by curiosity", "must know"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "GUI-001",
        emotionFamily: "GUILT",
        variant: "Guilt",
        definition: "A feeling of having done wrong or failed in an obligation",
        intensityMin: 30,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "GUI-002": { name: "Remorse", intensity_range: [60, 100] },
          "GUI-003": { name: "Regret", intensity_range: [40, 80] },
          "GUI-004": { name: "Self-Blame", intensity_range: [50, 90] }
        },
        blendableWith: ["SAD-001", "SHA-001", "FEA-001"],
        triggers: ["wrongdoing", "mistake", "harm", "responsibility"],
        intensityMarkers: {
          low: ["sorry", "regretful", "apologetic"],
          medium: ["guilty", "remorseful", "ashamed"],
          high: ["tormented", "consumed by guilt", "self-loathing"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "SHA-001",
        emotionFamily: "SHAME",
        variant: "Shame",
        definition: "A painful feeling of humiliation or distress caused by consciousness of wrong or foolish behavior",
        intensityMin: 40,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "SHA-002": { name: "Embarrassment", intensity_range: [40, 70] },
          "SHA-003": { name: "Humiliation", intensity_range: [70, 100] },
          "SHA-004": { name: "Mortification", intensity_range: [80, 100] }
        },
        blendableWith: ["GUI-001", "SAD-001", "ANG-001"],
        triggers: ["exposure", "judgment", "failure", "inadequacy"],
        intensityMarkers: {
          low: ["embarrassed", "self-conscious", "awkward"],
          medium: ["ashamed", "humiliated", "mortified"],
          high: ["utterly shamed", "wanting to disappear", "crushed"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "TRU-001",
        emotionFamily: "TRUST",
        variant: "Trust",
        definition: "Firm belief in the reliability, truth, or ability of someone or something",
        intensityMin: 30,
        intensityMax: 100,
        culturalUniversality: "High",
        variants: {
          "TRU-002": { name: "Faith", intensity_range: [60, 100] },
          "TRU-003": { name: "Confidence", intensity_range: [50, 90] },
          "TRU-004": { name: "Security", intensity_range: [40, 80] }
        },
        blendableWith: ["LOV-001", "HOP-001", "JOY-001"],
        triggers: ["reliability", "safety", "honesty", "consistency"],
        intensityMarkers: {
          low: ["trusting", "confident", "believing"],
          medium: ["secure", "certain", "faithful"],
          high: ["unwavering trust", "absolute faith", "complete confidence"]
        },
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        referenceCode: "PLA-001",
        emotionFamily: "PLAYFULNESS",
        variant: "Playfulness",
        definition: "A lighthearted, fun-loving attitude characterized by humor and spontaneity",
        intensityMin: 20,
        intensityMax: 90,
        culturalUniversality: "High",
        variants: {
          "PLA-002": { name: "Amusement", intensity_range: [30, 70] },
          "PLA-003": { name: "Humor", intensity_range: [40, 80] },
          "PLA-004": { name: "Whimsy", intensity_range: [20, 60] }
        },
        blendableWith: ["JOY-001", "CUR-001", "SUR-001"],
        triggers: ["fun", "games", "jokes", "spontaneity"],
        intensityMarkers: {
          low: ["playful", "lighthearted", "amused"],
          medium: ["silly", "goofy", "mischievous"],
          high: ["exuberant", "wild", "uncontrollably playful"]
        },
        createdAt: new Date(),
      }
    ];

    defaultEmotions.forEach(emotion => {
      this.emotionEntries.set(emotion.referenceCode, emotion as EmotionEntry);
    });
  }

  async getEmotionEntry(referenceCode: string): Promise<EmotionEntry | undefined> {
    return this.emotionEntries.get(referenceCode);
  }

  async getAllEmotionEntries(): Promise<EmotionEntry[]> {
    return Array.from(this.emotionEntries.values());
  }

  async searchEmotionEntries(query: string): Promise<EmotionEntry[]> {
    const entries = Array.from(this.emotionEntries.values());
    const lowerQuery = query.toLowerCase();
    
    return entries.filter(entry => 
      entry.emotionFamily.toLowerCase().includes(lowerQuery) ||
      entry.variant?.toLowerCase().includes(lowerQuery) ||
      entry.definition.toLowerCase().includes(lowerQuery) ||
      (entry.triggers as string[]).some(trigger => trigger.toLowerCase().includes(lowerQuery))
    );
  }

  async createEmotionEntry(entry: InsertEmotionEntry): Promise<EmotionEntry> {
    const newEntry: EmotionEntry = {
      id: this.currentId++,
      referenceCode: entry.referenceCode,
      emotionFamily: entry.emotionFamily,
      variant: entry.variant || null,
      definition: entry.definition,
      intensityMin: entry.intensityMin,
      intensityMax: entry.intensityMax,
      culturalUniversality: entry.culturalUniversality,
      variants: entry.variants || null,
      blendableWith: entry.blendableWith ? (entry.blendableWith as any) as string[] : null,
      triggers: entry.triggers ? (entry.triggers as any) as string[] : null,
      intensityMarkers: (entry.intensityMarkers && typeof entry.intensityMarkers === 'object') ? entry.intensityMarkers as Record<string, string[]> : null,
      createdAt: new Date(),
    };
    
    this.emotionEntries.set(newEntry.referenceCode, newEntry);
    return newEntry;
  }

  async getCmopEntry(emid: string): Promise<CmopEntry | undefined> {
    return this.cmopEntries.get(emid);
  }

  async getAllCmopEntries(): Promise<CmopEntry[]> {
    return Array.from(this.cmopEntries.values());
  }

  async createCmopEntry(entry: InsertCmopEntry): Promise<CmopEntry> {
    const newEntry: CmopEntry = {
      id: this.currentId++,
      emid: entry.emid,
      inputPhrase: entry.inputPhrase,
      emotionFamily: entry.emotionFamily,
      variant: entry.variant || null,
      codexReference: entry.codexReference,
      intensity: entry.intensity,
      blendableWith: entry.blendableWith ? (entry.blendableWith as any) as string[] : null,
      symbolicReference: entry.symbolicReference || null,
      culturalTag: entry.culturalTag || null,
      confidence: entry.confidence,
      salAnalysis: entry.salAnalysis ? (entry.salAnalysis as any) : null,
      timestamp: new Date(),
    };
    
    this.cmopEntries.set(newEntry.emid, newEntry);
    return newEntry;
  }

  async getProcessingSession(sessionId: string): Promise<ProcessingSession | undefined> {
    return this.processingSessions.get(sessionId);
  }

  async createProcessingSession(session: InsertProcessingSession): Promise<ProcessingSession> {
    const newSession: ProcessingSession = {
      id: this.currentId++,
      sessionId: session.sessionId,
      emotionsProcessed: session.emotionsProcessed ?? null,
      successfulMatches: session.successfulMatches ?? null,
      manualEntries: session.manualEntries ?? null,
      avgConfidence: session.avgConfidence ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.processingSessions.set(newSession.sessionId, newSession);
    return newSession;
  }

  async updateProcessingSession(sessionId: string, updates: Partial<ProcessingSession>): Promise<ProcessingSession> {
    const existing = this.processingSessions.get(sessionId);
    if (!existing) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    const updated: ProcessingSession = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.processingSessions.set(sessionId, updated);
    return updated;
  }
}

export const storage = new MemStorage();
