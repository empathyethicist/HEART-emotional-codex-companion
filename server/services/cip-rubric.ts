// CIP (Cultural Inclusion Protocol) Rubric Implementation
// Based on the Codex Mapping Manual

export interface CIPScore {
  universality: number;        // 1-10: How universally recognizable is this emotion?
  traceability: number;        // 1-10: Can the emotion's arc be traced and mapped?
  empathicCoherence: number;   // 1-10: Does it resonate coherently with empathic understanding?
  relationalActivation: number; // 1-10: Does it activate meaningful interpersonal dynamics?
  totalScore: number;
  qualifiesForInclusion: boolean;
}

export interface EmotionArc {
  type: 'ambient' | 'reactive' | 'cyclical';
  stages: string[];
  duration: 'momentary' | 'short-term' | 'extended' | 'ongoing';
}

export interface ESDMDeconstruction {
  triggerOrigin: string[];
  arcType: EmotionArc;
  intensityLevel: number;
  emotionFamily: string;
  secondaryFamily?: string;
  somaticExpression: string[];
  culturalExpression: string[];
  blendability: string[];
  resonanceBehaviors: string[];
}

export class CIPRubricService {
  private static instance: CIPRubricService;
  
  private constructor() {}
  
  static getInstance(): CIPRubricService {
    if (!CIPRubricService.instance) {
      CIPRubricService.instance = new CIPRubricService();
    }
    return CIPRubricService.instance;
  }

  evaluateEmotionForInclusion(
    emotionName: string,
    description: string,
    culturalContext: string,
    triggers: string[]
  ): CIPScore {
    const universality = this.assessUniversality(emotionName, description, culturalContext);
    const traceability = this.assessTraceability(description, triggers);
    const empathicCoherence = this.assessEmpathicCoherence(description);
    const relationalActivation = this.assessRelationalActivation(description, triggers);
    
    const totalScore = (universality + traceability + empathicCoherence + relationalActivation) / 4;
    
    return {
      universality,
      traceability,
      empathicCoherence,
      relationalActivation,
      totalScore,
      qualifiesForInclusion: totalScore >= 7.0
    };
  }

  private assessUniversality(emotionName: string, description: string, culturalContext: string): number {
    let score = 5; // baseline
    
    // Universal emotional patterns
    const universalPatterns = [
      'loss', 'joy', 'fear', 'love', 'anger', 'surprise', 'sadness',
      'connection', 'separation', 'achievement', 'threat', 'safety'
    ];
    
    const hasUniversalElements = universalPatterns.some(pattern => 
      description.toLowerCase().includes(pattern) || 
      emotionName.toLowerCase().includes(pattern)
    );
    
    if (hasUniversalElements) score += 2;
    
    // Cross-cultural recognition potential
    if (description.includes('human') || description.includes('universal')) score += 1;
    if (culturalContext === 'Multiple' || culturalContext === 'Universal') score += 1;
    
    // Culture-specific but relatable
    if (culturalContext !== 'Universal' && description.length > 50) score += 1;
    
    return Math.min(10, Math.max(1, score));
  }

  private assessTraceability(description: string, triggers: string[]): number {
    let score = 5; // baseline
    
    // Clear trigger patterns
    if (triggers.length >= 3) score += 2;
    if (triggers.length >= 5) score += 1;
    
    // Emotional arc indicators
    const arcIndicators = [
      'begins', 'develops', 'grows', 'fades', 'transforms', 'leads to',
      'triggered by', 'results in', 'evolves', 'transitions'
    ];
    
    const hasArcLanguage = arcIndicators.some(indicator => 
      description.toLowerCase().includes(indicator)
    );
    
    if (hasArcLanguage) score += 2;
    
    // Observable manifestations
    const observableTerms = [
      'visible', 'expressed', 'shown', 'manifests', 'appears',
      'demonstrated', 'exhibited', 'displayed'
    ];
    
    const hasObservableElements = observableTerms.some(term => 
      description.toLowerCase().includes(term)
    );
    
    if (hasObservableElements) score += 1;
    
    return Math.min(10, Math.max(1, score));
  }

  private assessEmpathicCoherence(description: string): number {
    let score = 5; // baseline
    
    // Empathic language indicators
    const empathicTerms = [
      'feel', 'experience', 'sense', 'understand', 'resonate',
      'connect', 'relate', 'mirror', 'share', 'recognize'
    ];
    
    const empathicCount = empathicTerms.filter(term => 
      description.toLowerCase().includes(term)
    ).length;
    
    score += Math.min(3, empathicCount);
    
    // Emotional coherence
    if (description.length > 30 && description.length < 200) score += 1;
    if (description.includes('feeling') || description.includes('emotion')) score += 1;
    
    return Math.min(10, Math.max(1, score));
  }

  private assessRelationalActivation(description: string, triggers: string[]): number {
    let score = 5; // baseline
    
    // Interpersonal indicators
    const relationalTerms = [
      'others', 'relationship', 'social', 'between', 'shared',
      'mutual', 'together', 'connection', 'interaction', 'community'
    ];
    
    const relationalCount = relationalTerms.filter(term => 
      description.toLowerCase().includes(term) ||
      triggers.some(trigger => trigger.toLowerCase().includes(term))
    ).length;
    
    score += Math.min(3, relationalCount);
    
    // Social context triggers
    const socialTriggers = triggers.filter(trigger => 
      trigger.includes('social') || 
      trigger.includes('others') || 
      trigger.includes('relationship') ||
      trigger.includes('community')
    );
    
    if (socialTriggers.length > 0) score += 2;
    
    return Math.min(10, Math.max(1, score));
  }

  performESDMDeconstruction(
    emotionName: string,
    description: string,
    triggers: string[],
    culturalContext: string
  ): ESDMDeconstruction {
    return {
      triggerOrigin: this.identifyTriggerOrigins(triggers),
      arcType: this.determineArcType(description, triggers),
      intensityLevel: this.estimateIntensityLevel(description),
      emotionFamily: this.identifyPrimaryFamily(emotionName, description),
      secondaryFamily: this.identifySecondaryFamily(description),
      somaticExpression: this.identifySomaticExpressions(description),
      culturalExpression: this.identifyCulturalExpressions(description, culturalContext),
      blendability: this.identifyBlendableEmotions(description),
      resonanceBehaviors: this.identifyResonanceBehaviors(description)
    };
  }

  private identifyTriggerOrigins(triggers: string[]): string[] {
    const categories = {
      'Environmental': ['weather', 'season', 'nature', 'environment'],
      'Social': ['relationship', 'social', 'others', 'community', 'family'],
      'Achievement': ['success', 'failure', 'accomplishment', 'goal'],
      'Loss': ['death', 'separation', 'ending', 'loss', 'absence'],
      'Existential': ['meaning', 'purpose', 'mortality', 'existence'],
      'Physical': ['pain', 'pleasure', 'body', 'health', 'illness']
    };

    const origins: string[] = [];
    
    for (const [category, keywords] of Object.entries(categories)) {
      const hasMatch = keywords.some(keyword => 
        triggers.some(trigger => trigger.toLowerCase().includes(keyword))
      );
      if (hasMatch) origins.push(category);
    }

    return origins.length > 0 ? origins : ['Experiential'];
  }

  private determineArcType(description: string, triggers: string[]): EmotionArc {
    const cyclicalIndicators = ['recurring', 'cyclical', 'returns', 'periodic', 'seasonal'];
    const reactiveIndicators = ['sudden', 'response', 'reaction', 'triggered', 'immediate'];
    const ambientIndicators = ['underlying', 'pervasive', 'ongoing', 'background', 'persistent'];

    const isCyclical = cyclicalIndicators.some(indicator => 
      description.toLowerCase().includes(indicator)
    );
    
    const isReactive = reactiveIndicators.some(indicator => 
      description.toLowerCase().includes(indicator) ||
      triggers.some(trigger => trigger.toLowerCase().includes(indicator))
    );
    
    const isAmbient = ambientIndicators.some(indicator => 
      description.toLowerCase().includes(indicator)
    );

    let type: 'ambient' | 'reactive' | 'cyclical' = 'reactive';
    let stages: string[] = ['onset', 'peak', 'resolution'];
    let duration: 'momentary' | 'short-term' | 'extended' | 'ongoing' = 'short-term';

    if (isCyclical) {
      type = 'cyclical';
      stages = ['emergence', 'intensification', 'plateau', 'decline', 'dormancy'];
      duration = 'extended';
    } else if (isAmbient) {
      type = 'ambient';
      stages = ['presence', 'fluctuation', 'integration'];
      duration = 'ongoing';
    } else if (isReactive) {
      type = 'reactive';
      stages = ['trigger', 'response', 'processing', 'integration'];
      duration = 'short-term';
    }

    return { type, stages, duration };
  }

  private estimateIntensityLevel(description: string): number {
    const intensityWords = {
      mild: ['slight', 'gentle', 'soft', 'subtle', 'quiet'],
      moderate: ['noticeable', 'clear', 'evident', 'apparent'],
      high: ['intense', 'overwhelming', 'powerful', 'strong', 'profound'],
      extreme: ['devastating', 'crushing', 'unbearable', 'transcendent']
    };

    for (const [level, words] of Object.entries(intensityWords)) {
      const hasMatch = words.some(word => description.toLowerCase().includes(word));
      if (hasMatch) {
        switch (level) {
          case 'mild': return 3;
          case 'moderate': return 5;
          case 'high': return 8;
          case 'extreme': return 10;
        }
      }
    }

    return 5; // default moderate
  }

  private identifyPrimaryFamily(emotionName: string, description: string): string {
    const familyKeywords = {
      'JOY': ['joy', 'happiness', 'delight', 'pleasure', 'bliss', 'euphoria'],
      'SADNESS': ['sad', 'sorrow', 'grief', 'melancholy', 'despair', 'anguish'],
      'FEAR': ['fear', 'anxiety', 'worry', 'terror', 'panic', 'dread'],
      'ANGER': ['anger', 'rage', 'fury', 'irritation', 'frustration', 'resentment'],
      'LOVE': ['love', 'affection', 'devotion', 'adoration', 'passion', 'care'],
      'SURPRISE': ['surprise', 'amazement', 'wonder', 'astonishment', 'shock'],
      'DISGUST': ['disgust', 'revulsion', 'contempt', 'disdain', 'loathing'],
      'TRUST': ['trust', 'faith', 'confidence', 'security', 'reliance'],
      'ANTICIPATION': ['anticipation', 'expectation', 'hope', 'eagerness'],
      'SHAME': ['shame', 'embarrassment', 'humiliation', 'mortification'],
      'GUILT': ['guilt', 'remorse', 'regret', 'self-blame'],
      'CURIOSITY': ['curiosity', 'interest', 'wonder', 'intrigue']
    };

    const text = (emotionName + ' ' + description).toLowerCase();
    
    for (const [family, keywords] of Object.entries(familyKeywords)) {
      const hasMatch = keywords.some(keyword => text.includes(keyword));
      if (hasMatch) return family;
    }

    return 'COMPLEX'; // for emotions that don't fit standard categories
  }

  private identifySecondaryFamily(description: string): string | undefined {
    // Look for blend indicators
    const blendTerms = ['also', 'mixed with', 'combined', 'along with', 'tinged with'];
    const hasBlend = blendTerms.some(term => description.toLowerCase().includes(term));
    
    if (hasBlend) {
      // Try to identify the secondary emotion
      return this.identifyPrimaryFamily('', description);
    }
    
    return undefined;
  }

  private identifySomaticExpressions(description: string): string[] {
    const somaticTerms = {
      'Facial': ['smile', 'frown', 'tears', 'expression', 'eyes', 'face'],
      'Bodily': ['tense', 'relax', 'posture', 'shoulders', 'chest', 'stomach'],
      'Physiological': ['heart rate', 'breathing', 'sweating', 'trembling', 'warmth', 'cold'],
      'Vocal': ['voice', 'tone', 'sigh', 'gasp', 'laughter', 'cry']
    };

    const expressions: string[] = [];
    
    for (const [category, terms] of Object.entries(somaticTerms)) {
      const hasMatch = terms.some(term => description.toLowerCase().includes(term));
      if (hasMatch) expressions.push(category);
    }

    return expressions.length > 0 ? expressions : ['Subjective Experience'];
  }

  private identifyCulturalExpressions(description: string, culturalContext: string): string[] {
    const expressions = [`${culturalContext} Context`];
    
    const culturalIndicators = [
      'ritual', 'tradition', 'custom', 'ceremony', 'practice',
      'cultural', 'social norm', 'community', 'collective'
    ];
    
    const hasCulturalElements = culturalIndicators.some(indicator => 
      description.toLowerCase().includes(indicator)
    );
    
    if (hasCulturalElements) {
      expressions.push('Ritualistic Expression');
    }
    
    return expressions;
  }

  private identifyBlendableEmotions(description: string): string[] {
    // Based on emotional adjacency and common blends
    const blendPatterns = {
      'joy': ['LOVE', 'SURPRISE', 'TRUST'],
      'sadness': ['FEAR', 'GUILT', 'LONELINESS'],
      'anger': ['DISGUST', 'FEAR', 'CONTEMPT'],
      'fear': ['SADNESS', 'SURPRISE', 'ANXIETY'],
      'love': ['JOY', 'TRUST', 'COMPASSION']
    };

    const text = description.toLowerCase();
    const blendable: string[] = [];
    
    for (const [emotion, blends] of Object.entries(blendPatterns)) {
      if (text.includes(emotion)) {
        blendable.push(...blends);
      }
    }

    // Remove duplicates manually for better compatibility
    const unique: string[] = [];
    for (const item of blendable) {
      if (!unique.includes(item)) {
        unique.push(item);
      }
    }
    return unique;
  }

  private identifyResonanceBehaviors(description: string): string[] {
    const behaviors: string[] = [];
    
    const resonanceIndicators = {
      'Mirroring': ['mirror', 'reflect', 'echo', 'imitate'],
      'Contagion': ['spread', 'contagious', 'infectious', 'shared'],
      'Empathic Response': ['empathy', 'understand', 'feel for', 'resonate'],
      'Synchronization': ['sync', 'align', 'harmonize', 'coordinate']
    };

    for (const [behavior, indicators] of Object.entries(resonanceIndicators)) {
      const hasMatch = indicators.some(indicator => 
        description.toLowerCase().includes(indicator)
      );
      if (hasMatch) behaviors.push(behavior);
    }

    return behaviors.length > 0 ? behaviors : ['Individual Experience'];
  }
}

export const cipRubricService = CIPRubricService.getInstance();