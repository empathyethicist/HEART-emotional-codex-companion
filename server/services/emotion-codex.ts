import * as fs from "fs";
import * as path from "path";
import { toneClassifierService } from "./tone-classifier";
import { culturalExpressionModifierService } from "./cultural-expression-modifier";

// Load emotion codex data from the attached assets
const emotionCodexData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "attached_assets", "emotion_codex_1751587416313.json"), "utf-8")
);

export interface EmotionCodexEntry {
  reference_code: string;
  definition: string;
  intensity_range: [number, number];
  cultural_universality: string;
  variants?: Record<string, {
    name: string;
    intensity_range: [number, number];
  }>;
  blendable_with?: string[];
  triggers?: string[];
  intensity_markers?: {
    low: string[];
    medium: string[];
    high: string[];
  };
}

export class EmotionCodexService {
  private codex: Record<string, EmotionCodexEntry>;

  constructor() {
    this.codex = this.processCodexData(emotionCodexData);
  }

  private processCodexData(data: any): Record<string, EmotionCodexEntry> {
    const processed: Record<string, EmotionCodexEntry> = {};
    
    for (const [emotionFamily, emotionData] of Object.entries(data)) {
      const entry = emotionData as any;
      processed[emotionFamily] = {
        reference_code: entry.reference_code,
        definition: entry.definition,
        intensity_range: entry.intensity_range,
        cultural_universality: entry.cultural_universality,
        variants: entry.variants,
        blendable_with: entry.blendable_with,
        triggers: entry.triggers,
        intensity_markers: entry.intensity_markers,
      };
    }
    
    return processed;
  }

  findEmotionMatch(inputPhrase: string, culturalContext: string = "Universal"): {
    emotion: string;
    variant?: string;
    referenceCode: string;
    confidence: number;
    intensity: number;
    blendableWith: string[];
    toneAnalysis?: any;
    culturalAnalysis?: any;
  } | null {
    const normalizedInput = inputPhrase.toLowerCase();
    let bestMatch: any = null;
    let highestConfidence = 0;

    // Enhanced keyword matching for better emotion detection
    const emotionKeywords: Record<string, string[]> = {
      'FEAR': ['scared', 'afraid', 'terrified', 'anxious', 'worried', 'nervous', 'panic', 'dread', 'frightened', 'fearful', 'uncertain', 'confused', 'unsure'],
      'ANGER': ['angry', 'mad', 'furious', 'frustrated', 'irritated', 'annoyed', 'rage', 'livid', 'hostile', 'outraged', 'disapproval'],
      'JOY': ['happy', 'joyful', 'excited', 'thrilled', 'elated', 'delighted', 'cheerful', 'glad', 'content', 'euphoric', 'relief', 'optimistic', 'proud'],
      'SADNESS': ['sad', 'depressed', 'miserable', 'heartbroken', 'melancholy', 'sorrowful', 'dejected', 'despondent', 'gloomy', 'blue', 'grief', 'disappointed', 'hopeless', 'remorse'],
      'LOVE': ['love', 'adore', 'cherish', 'affection', 'fondness', 'devotion', 'passion', 'romantic', 'caring', 'tender', 'compassion', 'gratitude', 'thankful', 'admiration'],
      'SURPRISE': ['surprised', 'amazed', 'shocked', 'astonished', 'stunned', 'bewildered', 'startled', 'astounded', 'realization'],
      'DISGUST': ['disgust', 'gross', 'yuck', 'revulsion', 'contempt', 'nauseated', 'disdain'],
      'CURIOSITY': ['curious', 'wondering', 'intrigued', 'obsessed', 'wonder', 'skeptical'],
      'GUILT': ['guilt', 'guilty', 'remorse', 'regret', 'self-blame', 'responsible'],
      'SHAME': ['embarrassed', 'humiliated', 'worthless', 'ashamed'],
      'PLAYFULNESS': ['amused', 'funny', 'laughing', 'teasing', 'lighthearted', 'carefree'],
      'TRUST': ['trust', 'comfort', 'faith', 'loyal', 'secure', 'safe'],
      'HOPE': ['hope', 'hopeful', 'optimism', 'anticipation', 'visionary'],
      'GRIEF': ['grief', 'grieving', 'mourning', 'bereavement', 'nostalgic'],
      'HELPLESSNESS': ['powerless', 'trapped', 'stuck', 'overwhelmed', 'exhausted', 'resigned', 'isolated', 'overloaded'],
      'LONELINESS': ['lonely', 'alone', 'isolated', 'invisible', 'disconnected', 'companionship']
    };

    // Metaphor patterns for enhanced detection
    const metaphorPatterns = {
      'floating': ['JOY', 'CONFUSION'],
      'drowning': ['FEAR', 'SADNESS'],
      'fog': ['CONFUSION', 'SADNESS'],
      'through fog': ['CONFUSION', 'UNCERTAINTY'],
      'floating through': ['UNCERTAINTY', 'DETACHMENT'],
      'sinking': ['SADNESS', 'FEAR'],
      'burning': ['ANGER', 'PASSION'],
      'frozen': ['FEAR', 'SHOCK'],
      'melting': ['LOVE', 'RELIEF'],
      'storm': ['ANGER', 'CHAOS'],
      'sunshine': ['JOY', 'WARMTH']
    };

    for (const [emotionFamily, emotionData] of Object.entries(this.codex)) {
      let confidence = 0;
      let matchedReasons = [];

      // Check direct keyword matches
      const keywords = emotionKeywords[emotionFamily] || [];
      const keywordMatches = keywords.filter((keyword: string) => 
        normalizedInput.includes(keyword)
      ).length;
      
      if (keywordMatches > 0) {
        confidence += keywordMatches * 0.3;
        matchedReasons.push(`keyword matches: ${keywordMatches}`);
      }

      // Check metaphor patterns
      for (const [pattern, emotions] of Object.entries(metaphorPatterns)) {
        if (normalizedInput.includes(pattern) && emotions.includes(emotionFamily)) {
          confidence += 0.4;
          matchedReasons.push(`metaphor: ${pattern}`);
        }
      }

      // Check triggers from codex
      const triggers = emotionData.triggers || [];
      const triggerMatches = triggers.filter(trigger => 
        normalizedInput.includes(trigger.toLowerCase())
      ).length;
      
      if (triggerMatches > 0) {
        confidence += triggerMatches * 0.2;
        matchedReasons.push(`triggers: ${triggerMatches}`);
      }

      // Check intensity markers
      const intensityMarkers = emotionData.intensity_markers || { low: [], medium: [], high: [] };
      const allMarkers = [
        ...intensityMarkers.low,
        ...intensityMarkers.medium,
        ...intensityMarkers.high
      ];
      const markerMatches = allMarkers.filter(marker => 
        normalizedInput.includes(marker.toLowerCase())
      ).length;
      
      if (markerMatches > 0) {
        confidence += markerMatches * 0.1;
        matchedReasons.push(`intensity markers: ${markerMatches}`);
      }

      // Normalize confidence to 0-1 range
      confidence = Math.min(confidence, 1);

      if (confidence > highestConfidence && confidence > 0.1) {
        highestConfidence = confidence;
        
        // Determine intensity based on context and markers
        let intensity = 0.5; // default medium
        
        // Adjust based on metaphor intensity
        if (normalizedInput.includes('drowning') || normalizedInput.includes('overwhelming')) {
          intensity = 0.8;
        } else if (normalizedInput.includes('floating') || normalizedInput.includes('drifting')) {
          intensity = 0.4;
        } else if (normalizedInput.includes('crushing') || normalizedInput.includes('devastating')) {
          intensity = 0.9;
        }
        
        // Check intensity markers for fine-tuning
        if (intensityMarkers.high.some(marker => normalizedInput.includes(marker.toLowerCase()))) {
          intensity = Math.max(intensity, 0.8);
        } else if (intensityMarkers.low.some(marker => normalizedInput.includes(marker.toLowerCase()))) {
          intensity = Math.min(intensity, 0.4);
        }

        // Check for specific variants
        let matchedVariant: string | undefined;
        if (emotionData.variants) {
          for (const [variantCode, variantData] of Object.entries(emotionData.variants)) {
            if (normalizedInput.includes(variantData.name.toLowerCase())) {
              matchedVariant = variantData.name;
              // Adjust intensity based on variant range
              const [min, max] = variantData.intensity_range;
              intensity = (min + max) / 2 / 100; // Convert to 0-1 scale
              break;
            }
          }
        }

        // Add advanced tone and cultural analysis
        const toneAnalysis = toneClassifierService.analyzeTone(
          inputPhrase, 
          emotionFamily, 
          culturalContext, 
          intensity
        );
        
        const culturalAnalysis = culturalExpressionModifierService.analyzeCulturalExpression(
          inputPhrase,
          emotionFamily,
          culturalContext !== "Universal" ? culturalContext : undefined
        );

        bestMatch = {
          emotion: emotionFamily,
          variant: matchedVariant,
          referenceCode: emotionData.reference_code,
          confidence: Math.min(confidence, 1),
          intensity,
          blendableWith: emotionData.blendable_with || [],
          toneAnalysis,
          culturalAnalysis
        };
      }
    }

    return bestMatch;
  }

  getAllEmotions(): Record<string, EmotionCodexEntry> {
    return this.codex;
  }

  getEmotionByReference(referenceCode: string): EmotionCodexEntry | null {
    for (const emotion of Object.values(this.codex)) {
      if (emotion.reference_code === referenceCode) {
        return emotion;
      }
    }
    return null;
  }

  searchEmotions(query: string): Array<{ family: string; data: EmotionCodexEntry }> {
    const normalizedQuery = query.toLowerCase();
    const results: Array<{ family: string; data: EmotionCodexEntry }> = [];

    for (const [family, data] of Object.entries(this.codex)) {
      const matches = 
        family.toLowerCase().includes(normalizedQuery) ||
        data.definition.toLowerCase().includes(normalizedQuery) ||
        (data.triggers || []).some(trigger => trigger.toLowerCase().includes(normalizedQuery)) ||
        (data.variants && Object.values(data.variants).some(variant => 
          variant.name.toLowerCase().includes(normalizedQuery)
        ));

      if (matches) {
        results.push({ family, data });
      }
    }

    return results;
  }
}

export const emotionCodexService = new EmotionCodexService();
