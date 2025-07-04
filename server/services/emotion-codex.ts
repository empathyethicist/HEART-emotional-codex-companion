import * as fs from "fs";
import * as path from "path";

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

  findEmotionMatch(inputPhrase: string): {
    emotion: string;
    variant?: string;
    referenceCode: string;
    confidence: number;
    intensity: number;
    blendableWith: string[];
  } | null {
    const normalizedInput = inputPhrase.toLowerCase();
    let bestMatch: any = null;
    let highestConfidence = 0;

    for (const [emotionFamily, emotionData] of Object.entries(this.codex)) {
      // Check triggers
      const triggers = emotionData.triggers || [];
      const triggerMatches = triggers.filter(trigger => 
        normalizedInput.includes(trigger.toLowerCase())
      ).length;

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

      // Calculate confidence based on matches
      const confidence = (triggerMatches * 0.6 + markerMatches * 0.4) / 
        Math.max(triggers.length + allMarkers.length, 1);

      if (confidence > highestConfidence) {
        highestConfidence = confidence;
        
        // Determine intensity based on which markers matched
        let intensity = 0.5; // default medium
        if (intensityMarkers.high.some(marker => normalizedInput.includes(marker.toLowerCase()))) {
          intensity = 0.8;
        } else if (intensityMarkers.low.some(marker => normalizedInput.includes(marker.toLowerCase()))) {
          intensity = 0.3;
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

        bestMatch = {
          emotion: emotionFamily,
          variant: matchedVariant,
          referenceCode: emotionData.reference_code,
          confidence: Math.min(confidence, 1),
          intensity,
          blendableWith: emotionData.blendable_with || [],
        };
      }
    }

    return highestConfidence > 0.1 ? bestMatch : null;
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
