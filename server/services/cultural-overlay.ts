// Cultural Overlay Service for emotion interpretation
export interface CulturalOverlay {
  culturalTag: string;
  interpretationNotes: string;
  culturalModifiers: string[];
  recommendedIntensityAdjustment: number; // -0.2 to +0.2
}

export class CulturalOverlayService {
  private culturalContexts: Record<string, {
    emotionExpressionStyle: string;
    intensityModifier: number;
    commonMetaphors: string[];
    culturalNuances: Record<string, string>;
  }>;

  constructor() {
    // Initialize with basic cultural contexts
    // In a real implementation, this would be loaded from cultural_codex.json
    this.culturalContexts = {
      "Western (Generic)": {
        emotionExpressionStyle: "Direct and individualistic",
        intensityModifier: 0,
        commonMetaphors: ["heart breaking", "floating on air", "seeing red"],
        culturalNuances: {
          "sadness": "Often expressed through personal metaphors",
          "joy": "Emphasis on individual achievement and happiness",
          "anger": "Direct expression is generally acceptable"
        }
      },
      "East Asian": {
        emotionExpressionStyle: "Indirect and collective-focused",
        intensityModifier: -0.1, // Generally more restrained expression
        commonMetaphors: ["face-saving", "harmony disruption", "group spirit"],
        culturalNuances: {
          "sadness": "May be expressed through duty or collective concern",
          "joy": "Often tempered with modesty and group consideration",
          "anger": "Indirect expression preferred, focus on harmony"
        }
      },
      "Latin American": {
        emotionExpressionStyle: "Expressive and family-centered",
        intensityModifier: 0.1, // Generally more expressive
        commonMetaphors: ["corazón (heart)", "alma (soul)", "sangre (blood)"],
        culturalNuances: {
          "sadness": "Often expressed through family and community connections",
          "joy": "Celebration-focused with strong community elements",
          "anger": "May involve honor and family dignity"
        }
      },
      "African": {
        emotionExpressionStyle: "Community-oriented and spiritual",
        intensityModifier: 0.05,
        commonMetaphors: ["ubuntu", "ancestral guidance", "community strength"],
        culturalNuances: {
          "sadness": "Often contextualized within community and spiritual beliefs",
          "joy": "Collective celebration and spiritual connection",
          "anger": "May involve community justice and restoration"
        }
      },
      "Middle Eastern": {
        emotionExpressionStyle: "Honor-based and traditional",
        intensityModifier: 0,
        commonMetaphors: ["honor", "dignity", "family name"],
        culturalNuances: {
          "sadness": "May involve concepts of fate and divine will",
          "joy": "Often expressed through hospitality and generosity",
          "anger": "May relate to honor, respect, and family dignity"
        }
      }
    };
  }

  applyCulturalOverlay(
    emotionFamily: string,
    inputPhrase: string,
    culturalContext: string,
    baseIntensity: number
  ): CulturalOverlay {
    const context = this.culturalContexts[culturalContext] || this.culturalContexts["Western (Generic)"];
    
    let interpretationNotes = `Interpreted within ${culturalContext} cultural context. `;
    interpretationNotes += context.emotionExpressionStyle + ". ";
    
    // Add emotion-specific cultural nuances
    const emotionNuance = context.culturalNuances[emotionFamily.toLowerCase()];
    if (emotionNuance) {
      interpretationNotes += emotionNuance + ". ";
    }

    // Detect cultural metaphors
    const detectedMetaphors = context.commonMetaphors.filter(metaphor =>
      inputPhrase.toLowerCase().includes(metaphor.toLowerCase())
    );

    const culturalModifiers: string[] = [];
    if (detectedMetaphors.length > 0) {
      culturalModifiers.push(`Cultural metaphors detected: ${detectedMetaphors.join(", ")}`);
    }

    // Check for culture-specific expressions
    const cultureSpecificPatterns = this.detectCultureSpecificPatterns(inputPhrase, culturalContext);
    if (cultureSpecificPatterns.length > 0) {
      culturalModifiers.push(...cultureSpecificPatterns);
    }

    return {
      culturalTag: culturalContext,
      interpretationNotes,
      culturalModifiers,
      recommendedIntensityAdjustment: context.intensityModifier
    };
  }

  private detectCultureSpecificPatterns(inputPhrase: string, culturalContext: string): string[] {
    const patterns: string[] = [];
    const normalizedInput = inputPhrase.toLowerCase();

    switch (culturalContext) {
      case "East Asian":
        if (normalizedInput.includes("shame") || normalizedInput.includes("face")) {
          patterns.push("Face-saving concern detected");
        }
        if (normalizedInput.includes("group") || normalizedInput.includes("family")) {
          patterns.push("Collective focus identified");
        }
        break;
        
      case "Latin American":
        if (normalizedInput.includes("family") || normalizedInput.includes("familia")) {
          patterns.push("Family-centered expression");
        }
        if (normalizedInput.includes("celebration") || normalizedInput.includes("fiesta")) {
          patterns.push("Celebratory cultural context");
        }
        break;
        
      case "African":
        if (normalizedInput.includes("community") || normalizedInput.includes("together")) {
          patterns.push("Ubuntu/community spirit detected");
        }
        if (normalizedInput.includes("ancestor") || normalizedInput.includes("spiritual")) {
          patterns.push("Spiritual/ancestral context");
        }
        break;
        
      case "Middle Eastern":
        if (normalizedInput.includes("honor") || normalizedInput.includes("respect")) {
          patterns.push("Honor-based cultural values");
        }
        if (normalizedInput.includes("fate") || normalizedInput.includes("destiny")) {
          patterns.push("Spiritual/fate-based interpretation");
        }
        break;
    }

    return patterns;
  }

  detectCulturalContext(inputPhrase: string): string {
    // Simple auto-detection based on keywords
    // In a real implementation, this would be more sophisticated
    const normalizedInput = inputPhrase.toLowerCase();
    
    const culturalKeywords = {
      "East Asian": ["face", "harmony", "group", "collective", "shame", "duty"],
      "Latin American": ["familia", "corazón", "alma", "celebration", "fiesta", "community"],
      "African": ["ubuntu", "community", "together", "ancestor", "spiritual", "tribe"],
      "Middle Eastern": ["honor", "respect", "fate", "destiny", "family name", "dignity"]
    };

    for (const [culture, keywords] of Object.entries(culturalKeywords)) {
      const matches = keywords.filter(keyword => normalizedInput.includes(keyword));
      if (matches.length >= 1) {
        return culture;
      }
    }

    return "Western (Generic)";
  }

  getAllCulturalContexts(): string[] {
    return Object.keys(this.culturalContexts);
  }
}

export const culturalOverlayService = new CulturalOverlayService();
