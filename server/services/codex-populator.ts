import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import { storage } from "../storage";
import type { InsertEmotionEntry } from "@shared/schema";

interface YamlEmotionFamily {
  name: string;
  code: string;
  variants: Array<{
    name: string;
    code: string;
    aliases: string[];
  }>;
}

interface YamlEmotionData {
  emotion_families: YamlEmotionFamily[];
}

export class CodexPopulator {
  private static instance: CodexPopulator;
  
  private constructor() {}
  
  static getInstance(): CodexPopulator {
    if (!CodexPopulator.instance) {
      CodexPopulator.instance = new CodexPopulator();
    }
    return CodexPopulator.instance;
  }

  async populateFromYamlFile(filePath: string): Promise<{
    added: number;
    skipped: number;
    errors: string[];
  }> {
    const results = {
      added: 0,
      skipped: 0,
      errors: [] as string[]
    };

    try {
      const yamlContent = fs.readFileSync(filePath, 'utf-8');
      const emotionData = yaml.load(yamlContent) as YamlEmotionData;
      
      for (const family of emotionData.emotion_families) {
        try {
          await this.processFamilyFromYaml(family, results);
        } catch (error: any) {
          results.errors.push(`Error processing family ${family.name}: ${error.message}`);
        }
      }
    } catch (error: any) {
      results.errors.push(`Error loading YAML file: ${error.message}`);
    }

    return results;
  }

  private async processFamilyFromYaml(
    family: YamlEmotionFamily, 
    results: { added: number; skipped: number; errors: string[] }
  ): Promise<void> {
    const familyName = family.name.toUpperCase();
    
    // Check if family already exists
    const existingEntries = await storage.getAllEmotionEntries();
    const familyExists = existingEntries.some(entry => entry.emotionFamily === familyName);
    
    if (familyExists) {
      results.skipped++;
      return;
    }

    // Generate comprehensive emotion entry
    const emotionDefinition = this.generateDefinition(family.name);
    const intensityRange = this.calculateIntensityRange(family.name);
    const culturalUniversality = this.determineCulturalUniversality(family.name);
    const blendableWith = this.generateBlendableEmotions(family.name);
    const triggers = this.generateTriggers(family.name, family.variants);
    const intensityMarkers = this.generateIntensityMarkers(family.name, family.variants);
    const variants = this.processVariants(family.variants);

    const emotionEntry: InsertEmotionEntry = {
      referenceCode: `${family.code.split('-')[1]}-001`,
      emotionFamily: familyName,
      variant: family.name,
      definition: emotionDefinition,
      intensityMin: intensityRange[0],
      intensityMax: intensityRange[1],
      culturalUniversality,
      variants,
      blendableWith,
      triggers,
      intensityMarkers
    };

    await storage.createEmotionEntry(emotionEntry);
    results.added++;
  }

  private generateDefinition(emotionName: string): string {
    const definitions: Record<string, string> = {
      "Joy": "A positive emotional state marked by happiness, satisfaction, fulfillment, and inner contentment",
      "Sadness": "A negative emotional state characterized by feelings of sorrow, loss, and emotional pain",
      "Anger": "A negative emotional state triggered by perceived threat, injustice, or boundary violations",
      "Fear": "An unpleasant emotion caused by threat, danger, or uncertainty about future outcomes",
      "Love": "A deep emotional attachment characterized by affection, care, and connection to others",
      "Disgust": "A feeling of revulsion or strong disapproval aroused by something unpleasant or offensive",
      "Curiosity": "A strong desire to know, learn, or understand something new or unknown",
      "Guilt": "A feeling of having done wrong or failed in an obligation, accompanied by regret",
      "Shame": "A painful feeling of humiliation or distress caused by consciousness of wrong behavior",
      "Surprise": "A feeling of mild astonishment or shock caused by something unexpected",
      "Playfulness": "A lighthearted, fun-loving attitude characterized by humor and spontaneity",
      "Trust": "Firm belief in the reliability, truth, or ability of someone or something",
      "Hope": "A positive emotional state characterized by expectation and desire for positive outcomes",
      "Grief": "Deep sorrow especially that caused by someone's death or a significant loss",
      "Helplessness": "A state of powerlessness and perceived inability to control one's circumstances",
      "Loneliness": "A complex emotional state characterized by feelings of isolation and disconnection"
    };

    return definitions[emotionName] || `A complex emotional state related to ${emotionName.toLowerCase()}`;
  }

  private calculateIntensityRange(emotionName: string): [number, number] {
    const ranges: Record<string, [number, number]> = {
      "Joy": [20, 100],
      "Sadness": [20, 100],
      "Anger": [30, 100],
      "Fear": [20, 100],
      "Love": [30, 100],
      "Disgust": [20, 100],
      "Curiosity": [10, 90],
      "Guilt": [30, 100],
      "Shame": [40, 100],
      "Surprise": [20, 100],
      "Playfulness": [10, 90],
      "Trust": [30, 100],
      "Hope": [20, 100],
      "Grief": [50, 100],
      "Helplessness": [40, 100],
      "Loneliness": [30, 100]
    };

    return ranges[emotionName] || [20, 100];
  }

  private determineCulturalUniversality(emotionName: string): string {
    const universality: Record<string, string> = {
      "Joy": "High",
      "Sadness": "High", 
      "Anger": "High",
      "Fear": "High",
      "Love": "High",
      "Disgust": "High",
      "Surprise": "High",
      "Curiosity": "High",
      "Guilt": "Medium",
      "Shame": "Medium",
      "Playfulness": "High",
      "Trust": "High",
      "Hope": "High",
      "Grief": "High",
      "Helplessness": "High",
      "Loneliness": "High"
    };

    return universality[emotionName] || "Medium";
  }

  private generateBlendableEmotions(emotionName: string): string[] {
    const blendable: Record<string, string[]> = {
      "Joy": ["SURPRISE", "LOVE", "HOPE", "PLAYFULNESS"],
      "Sadness": ["FEAR", "GUILT", "LONELINESS", "GRIEF"],
      "Anger": ["DISGUST", "FEAR", "FRUSTRATION"],
      "Fear": ["SADNESS", "HELPLESSNESS", "ANXIETY"],
      "Love": ["JOY", "TRUST", "HOPE", "COMPASSION"],
      "Disgust": ["ANGER", "CONTEMPT"],
      "Curiosity": ["SURPRISE", "JOY", "WONDER"],
      "Guilt": ["SHAME", "SADNESS", "REGRET"],
      "Shame": ["GUILT", "SADNESS", "EMBARRASSMENT"],
      "Surprise": ["JOY", "FEAR", "CURIOSITY"],
      "Playfulness": ["JOY", "CURIOSITY", "AMUSEMENT"],
      "Trust": ["LOVE", "HOPE", "SECURITY"],
      "Hope": ["JOY", "TRUST", "OPTIMISM"],
      "Grief": ["SADNESS", "LONELINESS", "LOSS"],
      "Helplessness": ["FEAR", "SADNESS", "POWERLESSNESS"],
      "Loneliness": ["SADNESS", "HELPLESSNESS", "ISOLATION"]
    };

    return blendable[emotionName] || [];
  }

  private generateTriggers(emotionName: string, variants: Array<{aliases: string[]}>): string[] {
    const baseTriggers: Record<string, string[]> = {
      "Joy": ["achievement", "success", "celebration", "love", "gratitude", "positive outcomes"],
      "Sadness": ["loss", "rejection", "failure", "separation", "disappointment", "grief"],
      "Anger": ["injustice", "disrespect", "betrayal", "frustration", "blocking", "violation"],
      "Fear": ["threat", "uncertainty", "danger", "change", "unknown", "vulnerability"],
      "Love": ["connection", "bonding", "care", "affection", "devotion", "intimacy"],
      "Disgust": ["offensive behavior", "moral violation", "repulsive content", "contamination"],
      "Curiosity": ["mystery", "unknown", "questions", "exploration", "discovery", "learning"],
      "Guilt": ["wrongdoing", "harm", "mistake", "moral failure", "responsibility"],
      "Shame": ["exposure", "judgment", "failure", "inadequacy", "humiliation"],
      "Surprise": ["unexpected events", "sudden change", "revelation", "shock"],
      "Playfulness": ["fun activities", "games", "humor", "spontaneity", "lightheartedness"],
      "Trust": ["reliability", "honesty", "consistency", "safety", "dependability"],
      "Hope": ["possibility", "future potential", "optimism", "faith", "aspiration"],
      "Grief": ["death", "loss", "ending", "absence", "mourning"],
      "Helplessness": ["powerlessness", "overwhelming circumstances", "lack of control"],
      "Loneliness": ["isolation", "disconnection", "abandonment", "misunderstanding"]
    };

    // Add triggers from variant aliases
    const variantTriggers = variants.flatMap(v => v.aliases);
    
    return [...(baseTriggers[emotionName] || []), ...variantTriggers];
  }

  private generateIntensityMarkers(emotionName: string, variants: Array<{aliases: string[]}>): Record<string, string[]> {
    const baseMarkers: Record<string, Record<string, string[]>> = {
      "Joy": {
        low: ["pleased", "glad", "content", "satisfied"],
        medium: ["happy", "joyful", "cheerful", "excited"],
        high: ["ecstatic", "euphoric", "overjoyed", "blissful"]
      },
      "Hope": {
        low: ["hopeful", "optimistic", "expectant"],
        medium: ["confident", "believing", "trusting"],
        high: ["certain", "unwavering", "absolute faith"]
      }
    };

    // Generate default markers if not defined
    const defaultMarkers = {
      low: variants.slice(0, 2).flatMap(v => v.aliases.slice(0, 2)),
      medium: variants.slice(1, 3).flatMap(v => v.aliases.slice(0, 2)),
      high: variants.slice(-2).flatMap(v => v.aliases.slice(0, 2))
    };

    return baseMarkers[emotionName] || defaultMarkers;
  }

  private processVariants(variants: Array<{name: string; code: string; aliases: string[]}>): Record<string, any> {
    const processedVariants: Record<string, any> = {};
    
    variants.forEach((variant, index) => {
      const intensityBase = 20 + (index * 15);
      processedVariants[variant.code] = {
        name: variant.name,
        intensity_range: [intensityBase, Math.min(intensityBase + 40, 100)]
      };
    });

    return processedVariants;
  }
}

export const codexPopulator = CodexPopulator.getInstance();