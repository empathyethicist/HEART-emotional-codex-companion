/**
 * Cultural Expression Modifier (CEM) System
 * Advanced cultural mapping based on Emotional Codex™ CVM/CEM specifications
 */

export interface CulturalProfile {
  code: string;
  region: string;
  generational: string;
  context: string;
  style: string;
  description: string;
}

export interface ExpressionModifier {
  emotionFamily: string;
  culturalCode: string;
  cemCode: string;
  expressionTendency: string;
  modulationNotes: string;
  intensityAdjustment: number;
  toneRecommendations: string[];
}

export interface CulturalAnalysis {
  detectedProfile: CulturalProfile | null;
  recommendedModifiers: ExpressionModifier[];
  culturalSensitivities: string[];
  expressionGuidance: string;
  riskAssessment: {
    misalignmentRisk: number;
    culturalOffenseRisk: number;
    communicationEffectiveness: number;
  };
}

export class CulturalExpressionModifierService {
  private static instance: CulturalExpressionModifierService;
  
  private culturalProfiles: Record<string, CulturalProfile> = {
    'US-N-Y-P': {
      code: 'US-N-Y-P',
      region: 'United States - Northern',
      generational: 'Youth',
      context: 'Professional',
      style: 'Direct/Individual',
      description: 'Open emotional expression with individual responsibility focus'
    },
    'JP-T-A-F': {
      code: 'JP-T-A-F',
      region: 'Japan - Traditional',
      generational: 'Adult',
      context: 'Formal',
      style: 'Reserved/Harmonic',
      description: 'Emotional restraint prioritizing group harmony and face-saving'
    },
    'BR-U-Y-S': {
      code: 'BR-U-Y-S',
      region: 'Brazil - Urban',
      generational: 'Youth',
      context: 'Social',
      style: 'Expressive/Somatic',
      description: 'High emotional expressiveness through physical and vocal channels'
    },
    'DE-N-A-P': {
      code: 'DE-N-A-P',
      region: 'Germany - Northern',
      generational: 'Adult',
      context: 'Professional',
      style: 'Controlled/Logical',
      description: 'Measured emotional expression with emphasis on competence and structure'
    },
    'IN-T-A-F': {
      code: 'IN-T-A-F',
      region: 'India - Traditional',
      generational: 'Adult',
      context: 'Formal',
      style: 'Hierarchical/Spiritual',
      description: 'Role-dependent emotional expression filtered through familial and spiritual frameworks'
    },
    'MX-C-E-F': {
      code: 'MX-C-E-F',
      region: 'Mexico - Central',
      generational: 'Elder',
      context: 'Family',
      style: 'Communal/Expressive',
      description: 'Family-centered emotional expression with ritual and community integration'
    },
    'UK-N-A-P': {
      code: 'UK-N-A-P',
      region: 'United Kingdom - Northern',
      generational: 'Adult',
      context: 'Professional',
      style: 'Reserved/Stoic',
      description: 'Emotional restraint with understatement and deflection as coping mechanisms'
    },
    'SE-N-A-P': {
      code: 'SE-N-A-P',
      region: 'Sweden - Northern',
      generational: 'Adult',
      context: 'Professional',
      style: 'Egalitarian/Transparent',
      description: 'Balanced emotional honesty with institutional mental health support'
    }
  };

  private expressionModifiers: Record<string, ExpressionModifier[]> = {
    'JOY': [
      {
        emotionFamily: 'JOY',
        culturalCode: 'US-N-Y-P',
        cemCode: 'CEM-JOY-USA',
        expressionTendency: 'Open / Encouraged',
        modulationNotes: 'Smiling, verbal affirmation, and laughter are socially supported and expected in public settings',
        intensityAdjustment: 0.1,
        toneRecommendations: ['T004', 'T008']
      },
      {
        emotionFamily: 'JOY',
        culturalCode: 'JP-T-A-F',
        cemCode: 'CEM-JOY-JP',
        expressionTendency: 'Reserved / Context-sensitive',
        modulationNotes: 'Joy is expressed more subtly to maintain group harmony; outward displays may be softened in public',
        intensityAdjustment: -0.2,
        toneRecommendations: ['T005', 'T007']
      },
      {
        emotionFamily: 'JOY',
        culturalCode: 'BR-U-Y-S',
        cemCode: 'CEM-JOY-BR',
        expressionTendency: 'Highly Expressive / Somatic',
        modulationNotes: 'Dancing, touch, vocal exclamations are normalized and culturally celebrated',
        intensityAdjustment: 0.2,
        toneRecommendations: ['T008', 'T004']
      }
    ],
    'ANG': [
      {
        emotionFamily: 'ANG',
        culturalCode: 'US-N-A-P',
        cemCode: 'CEM-ANG-US',
        expressionTendency: 'Contextual / Professionally Suppressed',
        modulationNotes: 'Direct expression acceptable in private or informal settings, but social norms favor control in professional domains',
        intensityAdjustment: -0.1,
        toneRecommendations: ['T007', 'T004']
      },
      {
        emotionFamily: 'ANG',
        culturalCode: 'JP-T-A-F',
        cemCode: 'CEM-ANG-JP',
        expressionTendency: 'Indirect / Internalized',
        modulationNotes: 'Anger often internalized or rechanneled; emotional restraint preferred to maintain social harmony',
        intensityAdjustment: -0.3,
        toneRecommendations: ['T001', 'T005']
      },
      {
        emotionFamily: 'ANG',
        culturalCode: 'IT-C-Y-S',
        cemCode: 'CEM-ANG-IT',
        expressionTendency: 'Expressive / Socially Normalized',
        modulationNotes: 'Raised voices or gestural emphasis are not seen as confrontational; anger expression is woven into passionate discourse',
        intensityAdjustment: 0.1,
        toneRecommendations: ['T002', 'T008']
      }
    ],
    'SAD': [
      {
        emotionFamily: 'SAD',
        culturalCode: 'US-N-A-P',
        cemCode: 'CEM-SAD-US',
        expressionTendency: 'Internal / Therapeutically Framed',
        modulationNotes: 'Sadness is encouraged to be acknowledged and explored through private reflection or therapy sessions',
        intensityAdjustment: 0.0,
        toneRecommendations: ['T004', 'T007']
      },
      {
        emotionFamily: 'SAD',
        culturalCode: 'MX-C-E-F',
        cemCode: 'CEM-SAD-MX',
        expressionTendency: 'Communal / Expressive',
        modulationNotes: 'Mourning and sadness are often shared in group rituals or family spaces; public emotional expression is normalized',
        intensityAdjustment: 0.1,
        toneRecommendations: ['T008', 'T004']
      }
    ],
    'FEA': [
      {
        emotionFamily: 'FEA',
        culturalCode: 'DE-S-A-P',
        cemCode: 'CEM-FEA-DE',
        expressionTendency: 'Rationalized / Controlled',
        modulationNotes: 'Fear is culturally framed as a signal to initiate preparation and control-based responses; emotional display minimized in favor of action planning',
        intensityAdjustment: -0.2,
        toneRecommendations: ['T007', 'T004']
      }
    ]
  };

  private constructor() {}

  static getInstance(): CulturalExpressionModifierService {
    if (!CulturalExpressionModifierService.instance) {
      CulturalExpressionModifierService.instance = new CulturalExpressionModifierService();
    }
    return CulturalExpressionModifierService.instance;
  }

  analyzeCulturalExpression(
    inputPhrase: string,
    emotionFamily: string,
    suggestedCulture?: string
  ): CulturalAnalysis {
    const detectedProfile = this.detectCulturalProfile(inputPhrase, suggestedCulture);
    const recommendedModifiers = this.getModifiersForEmotion(emotionFamily, detectedProfile?.code);
    const culturalSensitivities = this.identifySensitivities(emotionFamily, detectedProfile);
    const expressionGuidance = this.generateGuidance(detectedProfile, recommendedModifiers);
    const riskAssessment = this.assessCulturalRisks(emotionFamily, detectedProfile, inputPhrase);

    return {
      detectedProfile,
      recommendedModifiers,
      culturalSensitivities,
      expressionGuidance,
      riskAssessment
    };
  }

  private detectCulturalProfile(inputPhrase: string, suggestedCulture?: string): CulturalProfile | null {
    if (suggestedCulture && this.culturalProfiles[suggestedCulture]) {
      return this.culturalProfiles[suggestedCulture];
    }

    // Detect from linguistic patterns in input
    const phrase = inputPhrase.toLowerCase();
    
    // Japanese cultural markers
    if (phrase.includes('harmony') || phrase.includes('group') || phrase.includes('respect') ||
        phrase.includes('subtle') || phrase.includes('indirect')) {
      return this.culturalProfiles['JP-T-A-F'];
    }
    
    // German cultural markers
    if (phrase.includes('control') || phrase.includes('structure') || phrase.includes('logical') ||
        phrase.includes('efficient') || phrase.includes('appropriate')) {
      return this.culturalProfiles['DE-N-A-P'];
    }
    
    // Brazilian cultural markers  
    if (phrase.includes('celebrate') || phrase.includes('dance') || phrase.includes('expressive') ||
        phrase.includes('physical') || phrase.includes('community')) {
      return this.culturalProfiles['BR-U-Y-S'];
    }
    
    // Default to US professional context
    return this.culturalProfiles['US-N-Y-P'];
  }

  private getModifiersForEmotion(emotionFamily: string, culturalCode?: string): ExpressionModifier[] {
    const familyModifiers = this.expressionModifiers[emotionFamily.toUpperCase()] || [];
    
    if (culturalCode) {
      return familyModifiers.filter(mod => mod.culturalCode === culturalCode);
    }
    
    return familyModifiers;
  }

  private identifySensitivities(emotionFamily: string, profile: CulturalProfile | null): string[] {
    const sensitivities: string[] = [];
    
    if (!profile) return sensitivities;
    
    if (profile.style.includes('Reserved') && emotionFamily === 'ANG') {
      sensitivities.push('Anger expression may be culturally inappropriate - consider indirect communication');
    }
    
    if (profile.style.includes('Hierarchical') && emotionFamily === 'DIS') {
      sensitivities.push('Disgust expression may challenge authority structures - assess relational context');
    }
    
    if (profile.style.includes('Somatic') && emotionFamily === 'SAD') {
      sensitivities.push('Physical comfort and community support expected in grief expression');
    }
    
    if (profile.context === 'Professional' && ['JOY', 'ANG', 'FEA'].includes(emotionFamily)) {
      sensitivities.push('Professional context requires emotional regulation and appropriate boundaries');
    }
    
    return sensitivities;
  }

  private generateGuidance(profile: CulturalProfile | null, modifiers: ExpressionModifier[]): string {
    if (!profile || modifiers.length === 0) {
      return 'No specific cultural guidance available - using universal emotional support approach';
    }
    
    const modifier = modifiers[0];
    return `For ${profile.region} context: ${modifier.expressionTendency}. ${modifier.modulationNotes}`;
  }

  private assessCulturalRisks(
    emotionFamily: string, 
    profile: CulturalProfile | null, 
    inputPhrase: string
  ): { misalignmentRisk: number; culturalOffenseRisk: number; communicationEffectiveness: number } {
    let misalignmentRisk = 0.2;
    let culturalOffenseRisk = 0.1;
    let communicationEffectiveness = 0.7;
    
    if (!profile) {
      return { misalignmentRisk: 0.5, culturalOffenseRisk: 0.3, communicationEffectiveness: 0.5 };
    }
    
    // High-intensity emotions in reserved cultures
    if (profile.style.includes('Reserved') && inputPhrase.includes('!')) {
      misalignmentRisk += 0.3;
      culturalOffenseRisk += 0.2;
    }
    
    // Direct emotional expression in indirect cultures
    if (profile.style.includes('Harmonic') && emotionFamily === 'ANG') {
      misalignmentRisk += 0.4;
      culturalOffenseRisk += 0.3;
    }
    
    // Insufficient expressiveness in expressive cultures
    if (profile.style.includes('Expressive') && inputPhrase.length < 20) {
      misalignmentRisk += 0.2;
      communicationEffectiveness -= 0.2;
    }
    
    // Professional context with high emotional intensity
    if (profile.context === 'Professional' && /[!]{2,}/.test(inputPhrase)) {
      misalignmentRisk += 0.3;
      culturalOffenseRisk += 0.1;
    }
    
    return {
      misalignmentRisk: Math.min(1.0, misalignmentRisk),
      culturalOffenseRisk: Math.min(1.0, culturalOffenseRisk),
      communicationEffectiveness: Math.max(0.0, communicationEffectiveness)
    };
  }

  getAllCulturalProfiles(): Record<string, CulturalProfile> {
    return { ...this.culturalProfiles };
  }

  getModifiersByFamily(emotionFamily: string): ExpressionModifier[] {
    return this.expressionModifiers[emotionFamily.toUpperCase()] || [];
  }

  addCustomCulturalProfile(code: string, profile: CulturalProfile): void {
    this.culturalProfiles[code] = profile;
  }

  addCustomExpressionModifier(emotionFamily: string, modifier: ExpressionModifier): void {
    if (!this.expressionModifiers[emotionFamily]) {
      this.expressionModifiers[emotionFamily] = [];
    }
    this.expressionModifiers[emotionFamily].push(modifier);
  }
}

export const culturalExpressionModifierService = CulturalExpressionModifierService.getInstance();