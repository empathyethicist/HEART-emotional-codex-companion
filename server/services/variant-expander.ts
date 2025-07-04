import { storage } from "../storage";
import type { InsertEmotionEntry } from "@shared/schema";

export class VariantExpander {
  private static instance: VariantExpander;
  
  private constructor() {}
  
  static getInstance(): VariantExpander {
    if (!VariantExpander.instance) {
      VariantExpander.instance = new VariantExpander();
    }
    return VariantExpander.instance;
  }

  async expandAllEmotionVariants(): Promise<{
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
      const existingEntries = await storage.getAllEmotionEntries();
      const familyGroups = this.groupByFamily(existingEntries);

      for (const [family, entries] of Object.entries(familyGroups)) {
        const variants = this.getVariantsForFamily(family);
        
        for (const variant of variants) {
          const existingVariant = entries.find(entry => 
            entry.variant === variant.name || 
            entry.referenceCode === variant.code
          );

          if (existingVariant) {
            results.skipped++;
            continue;
          }

          try {
            await this.createVariantEntry(family, variant, results);
          } catch (error: any) {
            results.errors.push(`Error creating variant ${variant.name} for ${family}: ${error.message}`);
          }
        }
      }
    } catch (error: any) {
      results.errors.push(`Error expanding variants: ${error.message}`);
    }

    return results;
  }

  private groupByFamily(entries: any[]): Record<string, any[]> {
    return entries.reduce((groups, entry) => {
      const family = entry.emotionFamily;
      if (!groups[family]) groups[family] = [];
      groups[family].push(entry);
      return groups;
    }, {} as Record<string, any[]>);
  }

  private getVariantsForFamily(family: string): Array<{
    name: string;
    code: string;
    definition: string;
    intensityMin: number;
    intensityMax: number;
    triggers: string[];
    culturalUniversality: string;
  }> {
    const variants: Record<string, Array<any>> = {
      "JOY": [
        {
          name: "Euphoria",
          code: "JOY-002",
          definition: "An intense feeling of excitement and happiness, often overwhelming in nature",
          intensityMin: 80,
          intensityMax: 100,
          triggers: ["peak achievement", "profound love", "spiritual experience", "overwhelming success"],
          culturalUniversality: "High"
        },
        {
          name: "Contentment",
          code: "JOY-003",
          definition: "A peaceful happiness and satisfaction with one's current state",
          intensityMin: 30,
          intensityMax: 60,
          triggers: ["completion", "acceptance", "inner peace", "stability"],
          culturalUniversality: "High"
        },
        {
          name: "Delight",
          code: "JOY-004",
          definition: "A feeling of pleasure and enjoyment, often sparked by pleasant surprises",
          intensityMin: 50,
          intensityMax: 80,
          triggers: ["pleasant surprise", "beauty", "humor", "small victories"],
          culturalUniversality: "High"
        },
        {
          name: "Elation",
          code: "JOY-005",
          definition: "Great happiness and exhilaration, feeling on top of the world",
          intensityMin: 70,
          intensityMax: 95,
          triggers: ["major accomplishment", "recognition", "breakthrough", "victory"],
          culturalUniversality: "High"
        }
      ],
      "ANGER": [
        {
          name: "Frustration",
          code: "ANG-002",
          definition: "Feeling upset or annoyed as a result of being unable to change or achieve something",
          intensityMin: 30,
          intensityMax: 70,
          triggers: ["blocked goals", "repeated failure", "inefficiency", "miscommunication"],
          culturalUniversality: "High"
        },
        {
          name: "Rage",
          code: "ANG-003",
          definition: "Violent, uncontrollable anger that can overwhelm rational thought",
          intensityMin: 85,
          intensityMax: 100,
          triggers: ["severe injustice", "betrayal", "physical threat", "extreme provocation"],
          culturalUniversality: "High"
        },
        {
          name: "Resentment",
          code: "ANG-004",
          definition: "Bitter indignation at having been treated unfairly, often long-lasting",
          intensityMin: 40,
          intensityMax: 80,
          triggers: ["unfair treatment", "favoritism", "broken promises", "chronic injustice"],
          culturalUniversality: "Medium"
        },
        {
          name: "Irritation",
          code: "ANG-005",
          definition: "A feeling of mild anger caused by minor annoyances or disturbances",
          intensityMin: 20,
          intensityMax: 50,
          triggers: ["minor annoyances", "interruptions", "noise", "repetitive behavior"],
          culturalUniversality: "High"
        }
      ],
      "FEAR": [
        {
          name: "Anxiety",
          code: "FEA-002",
          definition: "A feeling of worry, nervousness, or unease about something with an uncertain outcome",
          intensityMin: 30,
          intensityMax: 80,
          triggers: ["uncertainty", "future events", "performance", "social situations"],
          culturalUniversality: "High"
        },
        {
          name: "Panic",
          code: "FEA-003",
          definition: "Sudden uncontrollable fear or anxiety, often causing wildly unthinking behavior",
          intensityMin: 80,
          intensityMax: 100,
          triggers: ["immediate danger", "phobic triggers", "overwhelming stress", "trauma response"],
          culturalUniversality: "High"
        },
        {
          name: "Dread",
          code: "FEA-004",
          definition: "A great fear or apprehension about something that will or might happen",
          intensityMin: 60,
          intensityMax: 90,
          triggers: ["anticipated threat", "impending doom", "negative prediction", "loss expectation"],
          culturalUniversality: "High"
        },
        {
          name: "Nervousness",
          code: "FEA-005",
          definition: "Easily agitated or alarmed; tending to be anxious about small matters",
          intensityMin: 20,
          intensityMax: 60,
          triggers: ["new situations", "performance pressure", "social interaction", "change"],
          culturalUniversality: "High"
        }
      ],
      "SADNESS": [
        {
          name: "Melancholy",
          code: "SAD-002",
          definition: "A thoughtful sadness, often with a sense of longing or nostalgia",
          intensityMin: 30,
          intensityMax: 70,
          triggers: ["nostalgia", "memories", "autumn", "endings", "beauty tinged with loss"],
          culturalUniversality: "High"
        },
        {
          name: "Despair",
          code: "SAD-003",
          definition: "The complete loss or absence of hope, profound hopelessness",
          intensityMin: 80,
          intensityMax: 100,
          triggers: ["repeated failure", "loss of meaning", "betrayal", "terminal illness"],
          culturalUniversality: "High"
        },
        {
          name: "Sorrow",
          code: "SAD-004",
          definition: "Deep distress, especially that caused by loss, disappointment, or other misfortune",
          intensityMin: 50,
          intensityMax: 90,
          triggers: ["death", "separation", "failure", "broken relationships"],
          culturalUniversality: "High"
        },
        {
          name: "Disappointment",
          code: "SAD-005",
          definition: "Sadness or displeasure caused by the nonfulfillment of one's hopes or expectations",
          intensityMin: 25,
          intensityMax: 65,
          triggers: ["unmet expectations", "broken promises", "failed plans", "reality vs expectation"],
          culturalUniversality: "High"
        }
      ],
      "LOVE": [
        {
          name: "Affection",
          code: "LOV-002",
          definition: "A gentle feeling of fondness or liking for someone or something",
          intensityMin: 30,
          intensityMax: 70,
          triggers: ["caring moments", "kindness", "companionship", "gentle touch"],
          culturalUniversality: "High"
        },
        {
          name: "Passion",
          code: "LOV-003",
          definition: "Strong and barely controllable emotion of love, desire, or enthusiasm",
          intensityMin: 70,
          intensityMax: 100,
          triggers: ["romantic attraction", "deep connection", "physical desire", "intense interest"],
          culturalUniversality: "High"
        },
        {
          name: "Adoration",
          code: "LOV-004",
          definition: "Deep love and respect, often with a sense of worship or reverence",
          intensityMin: 60,
          intensityMax: 95,
          triggers: ["admiration", "reverence", "idealization", "devotion"],
          culturalUniversality: "Medium"
        },
        {
          name: "Compassion",
          code: "LOV-005",
          definition: "Sympathetic concern for the sufferings or misfortunes of others",
          intensityMin: 40,
          intensityMax: 85,
          triggers: ["others' suffering", "empathy", "helping others", "understanding pain"],
          culturalUniversality: "High"
        }
      ]
    };

    return variants[family] || [];
  }

  private async createVariantEntry(
    family: string, 
    variant: any, 
    results: { added: number; skipped: number; errors: string[] }
  ): Promise<void> {
    const emotionEntry: InsertEmotionEntry = {
      referenceCode: variant.code,
      emotionFamily: family,
      variant: variant.name,
      definition: variant.definition,
      intensityMin: variant.intensityMin,
      intensityMax: variant.intensityMax,
      culturalUniversality: variant.culturalUniversality,
      variants: this.generateSubVariants(variant.name),
      blendableWith: this.getBlendableEmotions(family),
      triggers: variant.triggers,
      intensityMarkers: this.generateIntensityMarkers(variant.name, variant.intensityMin, variant.intensityMax)
    };

    await storage.createEmotionEntry(emotionEntry);
    results.added++;
  }

  private generateSubVariants(variantName: string): Record<string, any> {
    const subVariants: Record<string, any> = {};
    
    // Generate micro-variants based on the main variant
    const microVariations = this.getMicroVariations(variantName);
    
    microVariations.forEach((micro, index) => {
      const code = `${variantName.substring(0, 3).toUpperCase()}-SUB-${String(index + 1).padStart(2, '0')}`;
      subVariants[code] = {
        name: micro.name,
        intensity_range: micro.intensityRange
      };
    });

    return subVariants;
  }

  private getMicroVariations(variantName: string): Array<{name: string; intensityRange: [number, number]}> {
    const variations: Record<string, Array<any>> = {
      "Euphoria": [
        { name: "Ecstasy", intensityRange: [85, 100] },
        { name: "Bliss", intensityRange: [80, 95] }
      ],
      "Frustration": [
        { name: "Agitation", intensityRange: [35, 65] },
        { name: "Exasperation", intensityRange: [45, 75] }
      ],
      "Anxiety": [
        { name: "Worry", intensityRange: [25, 55] },
        { name: "Apprehension", intensityRange: [40, 70] }
      ],
      "Melancholy": [
        { name: "Wistfulness", intensityRange: [30, 60] },
        { name: "Pensiveness", intensityRange: [25, 55] }
      ],
      "Passion": [
        { name: "Ardor", intensityRange: [75, 100] },
        { name: "Fervor", intensityRange: [70, 95] }
      ]
    };

    return variations[variantName] || [
      { name: `Mild ${variantName}`, intensityRange: [20, 50] },
      { name: `Intense ${variantName}`, intensityRange: [70, 100] }
    ];
  }

  private getBlendableEmotions(family: string): string[] {
    const blendable: Record<string, string[]> = {
      "JOY": ["SURPRISE", "LOVE", "HOPE", "PLAYFULNESS", "TRUST"],
      "ANGER": ["DISGUST", "FEAR", "CONTEMPT", "FRUSTRATION"],
      "FEAR": ["SADNESS", "HELPLESSNESS", "ANXIETY", "SURPRISE"],
      "SADNESS": ["GRIEF", "LONELINESS", "GUILT", "MELANCHOLY"],
      "LOVE": ["JOY", "TRUST", "COMPASSION", "AFFECTION"]
    };

    return blendable[family] || [];
  }

  private generateIntensityMarkers(variantName: string, min: number, max: number): Record<string, string[]> {
    const baseMarkers: Record<string, Record<string, string[]>> = {
      "Euphoria": {
        low: ["uplifted", "elevated", "high"],
        medium: ["euphoric", "exhilarated", "blissful"],
        high: ["ecstatic", "transcendent", "overwhelming joy"]
      },
      "Frustration": {
        low: ["bothered", "annoyed", "irked"],
        medium: ["frustrated", "exasperated", "aggravated"],
        high: ["infuriated", "livid", "beside myself"]
      },
      "Anxiety": {
        low: ["uneasy", "concerned", "worried"],
        medium: ["anxious", "nervous", "apprehensive"],
        high: ["panicked", "terrified", "paralyzed with fear"]
      }
    };

    if (baseMarkers[variantName]) {
      return baseMarkers[variantName];
    }

    // Generate default markers based on intensity range
    const lowThreshold = min + (max - min) * 0.33;
    const highThreshold = min + (max - min) * 0.66;

    return {
      low: [`mild ${variantName.toLowerCase()}`, `slight ${variantName.toLowerCase()}`],
      medium: [`moderate ${variantName.toLowerCase()}`, `clear ${variantName.toLowerCase()}`],
      high: [`intense ${variantName.toLowerCase()}`, `overwhelming ${variantName.toLowerCase()}`]
    };
  }
}

export const variantExpander = VariantExpander.getInstance();