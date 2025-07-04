import { storage } from "../storage";
import { cipRubricService } from "./cip-rubric";
import type { InsertEmotionEntry } from "@shared/schema";
import type { CIPScore, ESDMDeconstruction } from "./cip-rubric";

export interface CodexIntegrationResult {
  success: boolean;
  emotionEntry?: any;
  referenceCode?: string;
  message: string;
  cipScore: CIPScore;
  esdmAnalysis: ESDMDeconstruction;
}

export class CodexIntegrationService {
  private static instance: CodexIntegrationService;
  
  private constructor() {}
  
  static getInstance(): CodexIntegrationService {
    if (!CodexIntegrationService.instance) {
      CodexIntegrationService.instance = new CodexIntegrationService();
    }
    return CodexIntegrationService.instance;
  }

  async validateAndIntegrateEmotion(
    emotionName: string,
    description: string,
    culturalContext: string,
    triggers: string[],
    forceIntegration: boolean = false
  ): Promise<CodexIntegrationResult> {
    
    // Step 1: Perform CIP evaluation
    const cipScore = cipRubricService.evaluateEmotionForInclusion(
      emotionName,
      description,
      culturalContext,
      triggers
    );

    // Step 2: Perform ESDM deconstruction
    const esdmAnalysis = cipRubricService.performESDMDeconstruction(
      emotionName,
      description,
      triggers,
      culturalContext
    );

    // Step 3: Check if emotion already exists
    const existingEntries = await storage.getAllEmotionEntries();
    const existingEmotion = existingEntries.find(entry => 
      entry.emotionFamily.toLowerCase() === esdmAnalysis.emotionFamily.toLowerCase() &&
      entry.variant?.toLowerCase() === emotionName.toLowerCase()
    );

    if (existingEmotion) {
      return {
        success: false,
        message: `Emotion "${emotionName}" already exists in codex as ${existingEmotion.referenceCode}`,
        cipScore,
        esdmAnalysis
      };
    }

    // Step 4: Validate HEART alignment threshold
    if (!cipScore.qualifiesForInclusion && !forceIntegration) {
      return {
        success: false,
        message: `Emotion scored ${cipScore.totalScore.toFixed(1)}/10. Requires 7.0+ for automatic integration. Use force integration to override.`,
        cipScore,
        esdmAnalysis
      };
    }

    // Step 5: Generate reference code
    const referenceCode = await this.generateReferenceCode(esdmAnalysis.emotionFamily);

    // Step 6: Create emotion entry
    try {
      const emotionEntry = await this.createEmotionEntry(
        emotionName,
        description,
        culturalContext,
        triggers,
        esdmAnalysis,
        referenceCode
      );

      return {
        success: true,
        emotionEntry,
        referenceCode,
        message: `Successfully integrated "${emotionName}" into codex with reference ${referenceCode}`,
        cipScore,
        esdmAnalysis
      };

    } catch (error: any) {
      return {
        success: false,
        message: `Integration failed: ${error.message}`,
        cipScore,
        esdmAnalysis
      };
    }
  }

  private async generateReferenceCode(emotionFamily: string): Promise<string> {
    const existingEntries = await storage.getAllEmotionEntries();
    
    // Get family prefix (first 3 letters)
    const familyPrefix = emotionFamily.substring(0, 3).toUpperCase();
    
    // Find highest number for this family
    const familyEntries = existingEntries.filter(entry => 
      entry.referenceCode.startsWith(familyPrefix)
    );

    let highestNumber = 0;
    familyEntries.forEach(entry => {
      const match = entry.referenceCode.match(/-(\d+)$/);
      if (match) {
        const number = parseInt(match[1], 10);
        if (number > highestNumber) {
          highestNumber = number;
        }
      }
    });

    const nextNumber = String(highestNumber + 1).padStart(3, '0');
    return `${familyPrefix}-${nextNumber}`;
  }

  private async createEmotionEntry(
    emotionName: string,
    description: string,
    culturalContext: string,
    triggers: string[],
    esdmAnalysis: ESDMDeconstruction,
    referenceCode: string
  ): Promise<any> {

    const intensityMin = Math.max(20, (esdmAnalysis.intensityLevel - 2) * 10);
    const intensityMax = Math.min(100, (esdmAnalysis.intensityLevel + 2) * 10);

    const emotionEntry: InsertEmotionEntry = {
      referenceCode,
      emotionFamily: esdmAnalysis.emotionFamily,
      variant: emotionName,
      definition: description,
      intensityMin,
      intensityMax,
      culturalUniversality: this.mapCulturalUniversality(culturalContext),
      variants: this.generateVariants(emotionName, esdmAnalysis),
      blendableWith: esdmAnalysis.blendability,
      triggers,
      intensityMarkers: this.generateIntensityMarkers(emotionName, esdmAnalysis)
    };

    return await storage.createEmotionEntry(emotionEntry);
  }

  private mapCulturalUniversality(culturalContext: string): string {
    const mapping: Record<string, string> = {
      "Universal": "High",
      "Multiple": "High", 
      "Western": "Medium",
      "Scandinavian": "Medium",
      "Russian": "Medium",
      "East Asian": "Medium",
      "Latin American": "Medium",
      "African": "Medium",
      "Middle Eastern": "Medium",
      "Digital Culture": "Medium"
    };

    return mapping[culturalContext] || "Medium";
  }

  private generateVariants(emotionName: string, esdmAnalysis: ESDMDeconstruction): Record<string, any> {
    const variants: Record<string, any> = {};
    
    // Generate intensity-based variants
    if (esdmAnalysis.intensityLevel <= 3) {
      variants[`${emotionName.toUpperCase()}-MILD`] = {
        name: `Mild ${emotionName}`,
        intensity_range: [10, 40]
      };
    }
    
    if (esdmAnalysis.intensityLevel >= 7) {
      variants[`${emotionName.toUpperCase()}-INTENSE`] = {
        name: `Intense ${emotionName}`,
        intensity_range: [70, 100]
      };
    }

    // Add cultural variants if applicable
    if (esdmAnalysis.culturalExpression.length > 1) {
      variants[`${emotionName.toUpperCase()}-CULTURAL`] = {
        name: `Cultural ${emotionName}`,
        intensity_range: [30, 80]
      };
    }

    return variants;
  }

  private generateIntensityMarkers(emotionName: string, esdmAnalysis: ESDMDeconstruction): Record<string, string[]> {
    const baseName = emotionName.toLowerCase();
    
    return {
      low: [
        `slight ${baseName}`,
        `mild ${baseName}`,
        `traces of ${baseName}`
      ],
      medium: [
        baseName,
        `clear ${baseName}`,
        `noticeable ${baseName}`
      ],
      high: [
        `intense ${baseName}`,
        `overwhelming ${baseName}`,
        `profound ${baseName}`
      ]
    };
  }

  async getIntegrationHistory(): Promise<Array<{
    referenceCode: string;
    emotionName: string;
    integrationDate: Date;
    cipScore: number;
    culturalContext: string;
  }>> {
    const entries = await storage.getAllEmotionEntries();
    
    // Return recently added entries (assuming they were CIP-integrated)
    return entries
      .filter(entry => entry.createdAt && entry.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
      .map(entry => ({
        referenceCode: entry.referenceCode,
        emotionName: entry.variant || entry.emotionFamily,
        integrationDate: entry.createdAt || new Date(),
        cipScore: 8.5, // Placeholder - would need to store actual CIP scores
        culturalContext: entry.culturalUniversality
      }))
      .sort((a, b) => b.integrationDate.getTime() - a.integrationDate.getTime());
  }

  async suggestEmotionImprovements(
    emotionName: string,
    description: string,
    cipScore: CIPScore
  ): Promise<{
    suggestions: string[];
    improvedDescription?: string;
    additionalTriggers?: string[];
  }> {
    const suggestions: string[] = [];
    
    if (cipScore.universality < 7) {
      suggestions.push("Add more universal human elements to increase cross-cultural recognition");
      suggestions.push("Consider how this emotion manifests across different cultures");
    }
    
    if (cipScore.traceability < 7) {
      suggestions.push("Describe the emotional arc more clearly (beginning, peak, resolution)");
      suggestions.push("Add specific behavioral or physical manifestations");
    }
    
    if (cipScore.empathicCoherence < 7) {
      suggestions.push("Use more empathic language that resonates with shared human experience");
      suggestions.push("Include relatable examples or scenarios");
    }
    
    if (cipScore.relationalActivation < 7) {
      suggestions.push("Explain how this emotion affects relationships and social interactions");
      suggestions.push("Add interpersonal triggers or social contexts");
    }

    return {
      suggestions,
      improvedDescription: suggestions.length > 0 ? this.generateImprovedDescription(description, suggestions) : undefined,
      additionalTriggers: this.suggestAdditionalTriggers(emotionName, description)
    };
  }

  private generateImprovedDescription(originalDescription: string, suggestions: string[]): string {
    // This would use AI/ML to improve the description based on suggestions
    // For now, return enhanced version with common improvements
    let improved = originalDescription;
    
    if (!improved.includes("feel")) {
      improved = `A feeling where one ${improved.toLowerCase()}`;
    }
    
    if (!improved.includes("relationship") && !improved.includes("social")) {
      improved += " This emotion can affect how we connect with others and navigate social situations.";
    }
    
    return improved;
  }

  private suggestAdditionalTriggers(emotionName: string, description: string): string[] {
    const commonTriggers = [
      "life transitions",
      "social expectations", 
      "cultural pressures",
      "interpersonal conflict",
      "achievement vs expectation gaps",
      "seasonal changes",
      "life milestones"
    ];

    // Return relevant triggers based on emotion characteristics
    return commonTriggers.filter(trigger => 
      !description.toLowerCase().includes(trigger.toLowerCase())
    ).slice(0, 3);
  }
}

export const codexIntegrationService = CodexIntegrationService.getInstance();