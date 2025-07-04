/**
 * T-Code Tone Classification System
 * Based on the Emotional Codex™ T-Code standards for expression modulation
 */

export interface ToneClassification {
  code: string;
  name: string;
  description: string;
  useCase: string;
  culturalAlignment: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ToneAnalysis {
  primaryTone: ToneClassification;
  secondaryTones: ToneClassification[];
  culturalModulation: string;
  expressionRisk: number;
  recommendedResponse: string;
}

export class ToneClassifierService {
  private static instance: ToneClassifierService;
  
  private toneLibrary: Record<string, ToneClassification> = {
    'T001': {
      code: 'T001',
      name: 'Silent / Withdrawn',
      description: 'Emotional suppression or internalized processing',
      useCase: 'Suppressed grief, shame, or overwhelming emotions',
      culturalAlignment: ['JP-T-A-F', 'UK-N-A-P', 'RU-N-A-P'],
      riskLevel: 'medium'
    },
    'T002': {
      code: 'T002', 
      name: 'Aggressive / Confrontational',
      description: 'Direct, forceful emotional expression with challenge undertones',
      useCase: 'Rage, defensiveness, boundary violations',
      culturalAlignment: ['US-N-A-P', 'IT-C-Y-S'],
      riskLevel: 'high'
    },
    'T003': {
      code: 'T003',
      name: 'Hesitant / Uncertain',
      description: 'Tentative expression with self-doubt or vulnerability',
      useCase: 'Early vulnerability, fear, or trust-building phases',
      culturalAlignment: ['JP-T-A-F', 'SE-N-A-P'],
      riskLevel: 'low'
    },
    'T004': {
      code: 'T004',
      name: 'Direct / Open',
      description: 'Clear, authentic emotional communication without filter',
      useCase: 'Healthy emotional assertiveness and transparency',
      culturalAlignment: ['US-N-Y-P', 'SE-N-A-P', 'AU-C-A-P'],
      riskLevel: 'low'
    },
    'T005': {
      code: 'T005',
      name: 'Subtle / Indirect',
      description: 'High-context emotional signaling through implication',
      useCase: 'Cultural contexts prioritizing harmony and face-saving',
      culturalAlignment: ['JP-T-A-F', 'KR-T-A-P', 'TH-C-A-S'],
      riskLevel: 'low'
    },
    'T006': {
      code: 'T006',
      name: 'Intense / Overwhelming',
      description: 'Dysregulated emotional expression beyond normal capacity',
      useCase: 'Emotional overflow, trauma response, or blend overflow',
      culturalAlignment: ['Variable - indicates dysregulation'],
      riskLevel: 'high'
    },
    'T007': {
      code: 'T007',
      name: 'Controlled / Measured',
      description: 'Cognitive filtering applied to emotional expression',
      useCase: 'Professional settings, cultural restraint expectations',
      culturalAlignment: ['DE-N-A-P', 'UK-N-A-P', 'SG-C-A-P'],
      riskLevel: 'low'
    },
    'T008': {
      code: 'T008',
      name: 'Expressive / Dramatic',
      description: 'High-affect emotional display with somatic engagement',
      useCase: 'Culturally appropriate emotional richness and celebration',
      culturalAlignment: ['BR-U-Y-S', 'IT-C-Y-S', 'MX-C-E-F'],
      riskLevel: 'low'
    }
  };

  private constructor() {}

  static getInstance(): ToneClassifierService {
    if (!ToneClassifierService.instance) {
      ToneClassifierService.instance = new ToneClassifierService();
    }
    return ToneClassifierService.instance;
  }

  analyzeTone(
    inputPhrase: string, 
    emotionFamily: string, 
    culturalContext: string = "Universal",
    intensity: number = 0.5
  ): ToneAnalysis {
    const primaryTone = this.detectPrimaryTone(inputPhrase, emotionFamily, intensity);
    const secondaryTones = this.detectSecondaryTones(inputPhrase, primaryTone);
    const culturalModulation = this.applyCulturalModulation(primaryTone, culturalContext);
    const expressionRisk = this.assessExpressionRisk(primaryTone, intensity, culturalContext);
    const recommendedResponse = this.generateResponseStrategy(primaryTone, culturalModulation, expressionRisk);

    return {
      primaryTone,
      secondaryTones,
      culturalModulation,
      expressionRisk,
      recommendedResponse
    };
  }

  private detectPrimaryTone(inputPhrase: string, emotionFamily: string, intensity: number): ToneClassification {
    const phrase = inputPhrase.toLowerCase();
    
    // Aggressive/Confrontational indicators (T002)
    if (phrase.includes('angry') || phrase.includes('furious') || phrase.includes('rage') ||
        phrase.includes('can\'t stand') || phrase.includes('hate') || /!{2,}/.test(inputPhrase)) {
      return this.toneLibrary['T002'];
    }
    
    // Intense/Overwhelming indicators (T006)
    if (intensity > 0.8 || phrase.includes('overwhelmed') || phrase.includes('breaking') ||
        phrase.includes('can\'t handle') || phrase.includes('too much')) {
      return this.toneLibrary['T006'];
    }
    
    // Silent/Withdrawn indicators (T001)
    if (phrase.includes('can\'t say') || phrase.includes('don\'t know how') ||
        phrase.includes('silent') || phrase.includes('withdrawn') || phrase.includes('numb')) {
      return this.toneLibrary['T001'];
    }
    
    // Hesitant/Uncertain indicators (T003)
    if (phrase.includes('maybe') || phrase.includes('not sure') || phrase.includes('confused') ||
        phrase.includes('i think') || phrase.includes('possibly')) {
      return this.toneLibrary['T003'];
    }
    
    // Expressive/Dramatic indicators (T008)
    if (phrase.includes('absolutely') || phrase.includes('incredible') || phrase.includes('amazing') ||
        emotionFamily === 'JOY' && intensity > 0.7) {
      return this.toneLibrary['T008'];
    }
    
    // Controlled/Measured indicators (T007)
    if (phrase.includes('managed') || phrase.includes('controlled') || phrase.includes('professional') ||
        phrase.includes('appropriate')) {
      return this.toneLibrary['T007'];
    }
    
    // Default to Direct/Open (T004) for healthy expression
    return this.toneLibrary['T004'];
  }

  private detectSecondaryTones(inputPhrase: string, primaryTone: ToneClassification): ToneClassification[] {
    const secondaryTones: ToneClassification[] = [];
    const phrase = inputPhrase.toLowerCase();
    
    // Look for blended tone patterns
    if (primaryTone.code !== 'T005' && this.hasIndirectMarkers(phrase)) {
      secondaryTones.push(this.toneLibrary['T005']);
    }
    
    if (primaryTone.code !== 'T003' && this.hasHesitantMarkers(phrase)) {
      secondaryTones.push(this.toneLibrary['T003']);
    }
    
    return secondaryTones.slice(0, 2); // Limit to 2 secondary tones
  }

  private hasIndirectMarkers(phrase: string): boolean {
    return phrase.includes('sort of') || phrase.includes('kind of') || 
           phrase.includes('you know') || phrase.includes('i guess');
  }

  private hasHesitantMarkers(phrase: string): boolean {
    return phrase.includes('um') || phrase.includes('uh') || 
           phrase.includes('well') || phrase.includes('i mean');
  }

  private applyCulturalModulation(tone: ToneClassification, culturalContext: string): string {
    if (culturalContext === "Universal") {
      return "No specific cultural modulation applied";
    }
    
    // Check if the tone aligns with the cultural context
    const isAligned = tone.culturalAlignment.some(culture => 
      culturalContext.includes(culture.split('-')[0])
    );
    
    if (isAligned) {
      return `Tone expression aligns with ${culturalContext} cultural norms`;
    } else {
      return `Tone may need cultural adjustment for ${culturalContext} context`;
    }
  }

  private assessExpressionRisk(
    tone: ToneClassification, 
    intensity: number, 
    culturalContext: string
  ): number {
    let baseRisk = tone.riskLevel === 'high' ? 0.8 : tone.riskLevel === 'medium' ? 0.5 : 0.2;
    
    // Adjust for intensity
    if (intensity > 0.8) baseRisk += 0.2;
    if (intensity < 0.3) baseRisk -= 0.1;
    
    // Cultural context adjustment
    if (culturalContext !== "Universal") {
      const isAligned = tone.culturalAlignment.some(culture => 
        culturalContext.includes(culture.split('-')[0])
      );
      if (!isAligned) baseRisk += 0.3;
    }
    
    return Math.min(1.0, Math.max(0.0, baseRisk));
  }

  private generateResponseStrategy(
    tone: ToneClassification, 
    culturalModulation: string, 
    expressionRisk: number
  ): string {
    if (expressionRisk > 0.7) {
      return `HIGH RISK: Consider de-escalation strategies. ${tone.name} tone may indicate emotional dysregulation.`;
    } else if (expressionRisk > 0.4) {
      return `MODERATE RISK: Monitor for emotional escalation. Provide supportive validation for ${tone.name} expression.`;
    } else {
      return `LOW RISK: ${tone.name} tone is within healthy expression range. Mirror appropriate emotional resonance.`;
    }
  }

  getAllToneCodes(): Record<string, ToneClassification> {
    return { ...this.toneLibrary };
  }

  getToneByCode(code: string): ToneClassification | null {
    return this.toneLibrary[code] || null;
  }
}

export const toneClassifierService = ToneClassifierService.getInstance();