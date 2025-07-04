// Symbolic Ambiguity Layer (SAL) Detection Service
export interface SALAnalysis {
  symbolicPatterns: string[];
  archetype: string;
  reasoning: string;
  ambiguityScore: number;
}

export class SALDetector {
  private salTriggers: Record<string, {
    patterns: string[];
    archetype: string;
    reasoning_template: string;
  }>;

  constructor() {
    // Initialize with common symbolic patterns
    // In a real implementation, this would be loaded from SAL_triggers.yaml
    this.salTriggers = {
      "water_drowning": {
        patterns: ["drowning", "ocean", "sea", "water", "flood", "waves", "deep"],
        archetype: "Drowning/Survival",
        reasoning_template: "Water metaphors suggest overwhelming emotions with potential for survival/rescue"
      },
      "light_darkness": {
        patterns: ["light", "dark", "shadow", "bright", "dim", "glow", "shine"],
        archetype: "Hope/Despair",
        reasoning_template: "Light/darkness symbolism indicates contrast between hope and despair"
      },
      "journey_path": {
        patterns: ["path", "road", "journey", "walk", "travel", "destination", "lost"],
        archetype: "Life Journey",
        reasoning_template: "Journey metaphors represent life progression and personal growth"
      },
      "prison_freedom": {
        patterns: ["trapped", "cage", "prison", "free", "escape", "chains", "bound"],
        archetype: "Confinement/Liberation",
        reasoning_template: "Confinement imagery suggests feelings of restriction or desire for freedom"
      },
      "weather_storm": {
        patterns: ["storm", "rain", "thunder", "clouds", "sunny", "wind", "hurricane"],
        archetype: "Natural Forces",
        reasoning_template: "Weather metaphors represent uncontrollable emotional forces"
      },
      "fire_burning": {
        patterns: ["fire", "burn", "flame", "heat", "cold", "ice", "freeze"],
        archetype: "Passion/Numbness",
        reasoning_template: "Temperature metaphors indicate intensity of emotional experience"
      }
    };
  }

  analyzeSymbolicContent(inputPhrase: string): SALAnalysis {
    const normalizedInput = inputPhrase.toLowerCase();
    const detectedPatterns: string[] = [];
    let primaryArchetype = "Unknown";
    let reasoning = "No significant symbolic patterns detected";
    let ambiguityScore = 0;

    // Detect symbolic patterns
    for (const [category, data] of Object.entries(this.salTriggers)) {
      const matchedPatterns = data.patterns.filter(pattern => 
        normalizedInput.includes(pattern.toLowerCase())
      );
      
      if (matchedPatterns.length > 0) {
        detectedPatterns.push(...matchedPatterns);
        primaryArchetype = data.archetype;
        reasoning = data.reasoning_template;
        
        // Increase ambiguity score based on multiple pattern matches
        ambiguityScore += matchedPatterns.length * 0.2;
      }
    }

    // Calculate overall ambiguity based on metaphor density
    const metaphorIndicators = [
      "like", "as if", "feels like", "seems like", "reminds me",
      "similar to", "kind of", "sort of", "almost like"
    ];
    
    const metaphorCount = metaphorIndicators.filter(indicator => 
      normalizedInput.includes(indicator)
    ).length;

    ambiguityScore += metaphorCount * 0.3;
    ambiguityScore = Math.min(ambiguityScore, 1); // Cap at 1.0

    // Handle mixed metaphors (higher ambiguity)
    const uniqueCategories = new Set();
    for (const [category, data] of Object.entries(this.salTriggers)) {
      const hasMatch = data.patterns.some(pattern => 
        normalizedInput.includes(pattern.toLowerCase())
      );
      if (hasMatch) {
        uniqueCategories.add(category);
      }
    }

    if (uniqueCategories.size > 1) {
      ambiguityScore += 0.2;
      reasoning += ". Multiple symbolic themes create interpretive complexity";
    }

    return {
      symbolicPatterns: [...new Set(detectedPatterns)], // Remove duplicates
      archetype: primaryArchetype,
      reasoning,
      ambiguityScore: Math.min(ambiguityScore, 1)
    };
  }

  detectBlendedEmotions(symbolicPatterns: string[], baseEmotion: string): string[] {
    const blendMap: Record<string, string[]> = {
      "drowning": ["FEAR", "HOPE"], // Drowning implies fear but often hope for rescue
      "light": ["JOY", "HOPE"],
      "dark": ["SADNESS", "FEAR"],
      "storm": ["ANGER", "FEAR"],
      "fire": ["ANGER", "LOVE"], // Fire can be passion or rage
      "ice": ["SADNESS", "FEAR"],
      "journey": ["HOPE", "UNCERTAINTY"],
      "trapped": ["FEAR", "ANGER"],
      "free": ["JOY", "RELIEF"]
    };

    const suggestedBlends = new Set<string>();
    
    for (const pattern of symbolicPatterns) {
      const blends = blendMap[pattern.toLowerCase()] || [];
      blends.forEach(blend => {
        if (blend !== baseEmotion) {
          suggestedBlends.add(blend);
        }
      });
    }

    return Array.from(suggestedBlends);
  }
}

export const salDetector = new SALDetector();
